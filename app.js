const fs = require('fs');
const { client, config } = require('./redditClient')
const limiter = require('./limiter')
const Queue = require('bee-queue');
const queue = new Queue('jobs', {
  redis: {
    host: process.env.NODE_ENV === 'production' ? 'redis' : '127.0.0.1',
    port: 6379,
    db: 0,
    options: {}
  },
});
const bent = require('bent')

const url = 'https://api.pushshift.io/reddit/search?q=petakillsanimals&limit=10&filter=body,id,author,parent_id'
const getJSON = bent('json', url)
const reply = fs.readFileSync('./reply.md', 'utf8');

const added = []

setInterval(async () => {
  const {data} = await getJSON()
  data.forEach(comment => {
    if (comment.body.includes('petakillsanimals') && comment.author !== config.username && !added.includes(comment.id)) {
      added.push(comment.id)
      console.log('adding job with id', comment.id)
      queue.createJob(comment).setId(comment.id).save()
    }
  })
}, 1500)

queue.process(async (job) => {
  const { data, id } = job
  const comment = await client.getComment(id)
  const { replies } = await comment.expandReplies()
  const alreadyReplied = replies.map(r => r.author.name).find(r => r === config.username)
  let inParent = false
  if (!alreadyReplied && data.parent_id) {
    const parent = await (await client.getComment(data.parent_id)).fetch()
    if (parent.author.name === config.username) {
      inParent = true
    }
  }
  if (!alreadyReplied && !inParent) {
    await limiter.schedule(
      { id },
      // () => console.log('ok'),
      () => client.getComment(data.id).reply(reply),
      { name: data.author })
  }
  return job.id
});

console.log('Listening for comments...')
