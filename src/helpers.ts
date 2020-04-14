import * as bent from 'bent';
import { keys } from './watcher';
import * as colors from 'colors/safe';

export const isProduction = process.env.NODE_ENV === 'production';

export const log = (id: string, comment: string) => {
  const date = colors.green(
    new Date().toISOString().slice(0, 19).replace('T', ' '),
  );
  id = colors.yellow(id);
  console.log(`${date} [${id}] ${comment}`);
};

const keysString = keys.join('|');
const url = `https://api.pushshift.io/reddit/search?q=${keysString}&limit=10&filter=body,id,author,parent_id`;

export const getComments = bent('json', url);

export const second = 1000;
export const minute = second * 60;
