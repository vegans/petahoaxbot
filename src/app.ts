/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { client, config, hasAlreadyReplied, isInParent } from './redditClient';
import { limiter } from './limiter';
import { log, getComments, isProduction, minute } from './helpers';
import { queue } from './queue';
import { keys, watchers } from './watcher';

require('mdlog/override');

setInterval(async () => {
  const { data } = await getComments();
  data.forEach((comment) => {
    if (comment.author !== config.username) {
      queue.createJob(comment).setId(comment.id).save();
    }
  });
}, minute);

queue.process(async ({ data, id }) => {
  const key = keys.find((_key) => data.body.includes(_key));
  const reply = watchers[key];
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

log('app', `NODE_ENV: ${process.env.NODE_ENV}`);
log('app', `Listening for comments..`);
log('app', `Loaded keys: ${Object.keys(watchers).join(', ')}`);
if (!isProduction) {
  Object.entries(watchers).forEach(([key, value]) => {
    log('dev', `Output for ${key}:`);
    console.log(value);
  });
}
