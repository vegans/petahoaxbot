const fs = require('fs');
const { CommentStream } = require('snoostorm')
const { client, config } = require('./redditClient')
const limiter = require('./limiter')

const reply = fs.readFileSync('./reply.md', 'utf8');
const subreddit = process.env.NODE_ENV === 'production' ? 'all' : 'petahoaxbot'

const comments = new CommentStream(client, { subreddit, limit: 100, pollTime: 2000 })
comments.on('item', async item => {
  if (item.body.includes('petakillsanimals.com') && item.author.name !== config.username) {
    const comment = await client.getComment(item.id)
    const { replies } = await comment.expandReplies()
    const data = await comment.fetch()
    const alreadyReplied = replies.map(r => r.author.name).find(r => r === config.username)
    let inParent = false
    if (!alreadyReplied && data.parent_id) {
      const parent = await (await client.getComment(item.parent_id)).fetch()
      if (parent.author.name === config.username) {
        inParent = true
      }
    }
    if (!alreadyReplied && !inParent) {
      await limiter.schedule(
        { id: data.id },
        // () => console.log('ok'),
        () => client.getComment(data.id).reply(reply),
        { name: data.author.name })
    }
  }
})

console.log('Listening for comments in subreddit:', subreddit)
