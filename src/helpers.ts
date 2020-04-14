import * as bent from 'bent';
import * as fs from 'fs';
import * as fm from 'front-matter';
import { config, client } from './redditClient';

const footer = fs.readFileSync('./markdown/_footer.md', 'utf8');

export const watchers = {};
fs.readdirSync('./markdown')
  .filter((file) => !file.startsWith('_'))
  .forEach((file) => {
    const data = fs.readFileSync('./markdown/' + file, 'utf8');
    const content = fm(data);
    let terms = content.attributes?.['term'];
    terms = Array.isArray(terms) ? terms : [terms];
    terms.forEach((term) => {
      let body = `${content.body}\n${footer}`;
      body = body.replace('{term}', term).replace('{file}', file);
      watchers[term] = body;
    });
  });

export const isProduction = process.env.NODE_ENV === 'production';

export const log = (id: string, comment: string) => {
  const date = new Date();
  console.log(`${date.toLocaleTimeString('sv-SE')} [${id}] ${comment}`);
};

const keys = Object.keys(watchers).join('|');
const url = `https://api.pushshift.io/reddit/search?q=${keys}&limit=10&filter=body,id,author,parent_id`;

export const getComments = bent('json', url);

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
