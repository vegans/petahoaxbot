/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { client, config } from './redditClient';
import { limiter } from './limiter';
import { log, getJSON, isProduction, reply } from './helpers';
import { queue } from './queue';

setInterval(async () => {
  const { data } = await getJSON();
  data.forEach((comment) => {
    if (
      comment.body.includes('petakillsanimals') &&
      comment.author !== config.username
    ) {
      queue.createJob(comment).setId(comment.id).save();
    }
  });
}, 1500);

queue.process(async ({ data, id }) => {
  try {
    // @ts-ignore
    const comment = await client.getComment(id).fetch();
    const alreadyReplied = !!comment.replies
      .map((r) => r.author.name)
      .find((r) => r === config.username);
    let inParent = false;
    if (!alreadyReplied && data.parent_id) {
      try {
        // @ts-ignore
        const parent = await (await client.getComment(data.parent_id)).fetch();
        if (parent.author.name === config.username) {
          inParent = true;
        }
      } catch (error) {
        inParent = true;
      }
    }

    if (!alreadyReplied && !inParent) {
      const func = isProduction
        ? () => client.getComment(data.id).reply(reply)
        : () => log(data.id, 'Debug resolve');
      // @ts-ignore
      await limiter.schedule({ id }, func, { name: data.author });
    }
  } catch (error) {
    log(id, error.message);
    return error.message;
  }
  return id;
});

log('app', `Listening for comments... NODE_ENV: ${process.env.NODE_ENV}`);
