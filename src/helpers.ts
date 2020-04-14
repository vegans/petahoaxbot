import * as bent from 'bent';
import * as fs from 'fs';
import { config, client } from './redditClient';

const message = fs.readFileSync('./markdown/reply.md', 'utf8');
const footer = fs.readFileSync('./markdown/footer.md', 'utf8');

export const reply = `${message}\n${footer}`;

export const isProduction = process.env.NODE_ENV === 'production';

export const log = (id: string, comment: string) => {
  const date = new Date();
  console.log(`${date.toLocaleTimeString('sv-SE')} [${id}] ${comment}`);
};

const url =
  'https://api.pushshift.io/reddit/search?q=petakillsanimals.com&limit=10&filter=body,id,author,parent_id';

export const getJSON = bent('json', url);

export const second = 1000;
export const minute = second * 60;

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
