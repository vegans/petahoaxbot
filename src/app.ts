/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { client, config } from './redditClient';
import { limiter } from './limiter';
import {
  log,
  getJSON,
  isProduction,
  reply,
  minute,
  hasAlreadyReplied,
  isInParent,
} from './helpers';
import { queue } from './queue';

require('mdlog/override');

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
}, minute);

queue.process(async ({ data, id }) => {
  try {
    const alreadyReplied = await hasAlreadyReplied(id);
    let inParent = false;
    if (!alreadyReplied && data.parent_id) {
      inParent = await isInParent(data.parent_id);
    }

    if (!alreadyReplied && !inParent) {
      const func = isProduction
        ? () => client.getComment(data.id).reply(reply)
        : () => log(data.id, 'Debug resolve');
      // @ts-ignore
      await limiter.schedule({ id }, func);
    }
  } catch (error) {
    log(id, error.message);
    return error.message;
  }
  return id;
});

log('app', `Listening for comments..`);
log('app', `NODE_ENV: ${process.env.NODE_ENV}`);
log('app', `Loaded message:`);
console.log(reply);
