import * as Snoowrap from 'snoowrap';
require('dotenv').config();

export const config = {
  userAgent: 'petahoaxbot v0.1',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS,
};

export const client = new Snoowrap(config);

export const hasAlreadyReplied = (id): Promise<boolean> =>
  new Promise((resolve) => {
    client
      .getComment(id)
      .expandReplies()
      .then(({ replies }) => {
        const result = !!replies
          .map((r) => r.author.name)
          .find((r) => r === config.username);
        resolve(result);
      });
  });

export const isInParent = (parentId): Promise<boolean> =>
  new Promise((resolve) => {
    client
      .getComment(parentId)
      .fetch()
      .then((parent) => {
        if (parent.author.name === config.username) {
          resolve(true);
        }
      })
      .finally(() => resolve(false));
  });
