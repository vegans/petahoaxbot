import * as bent from 'bent';

export const isProduction = process.env.NODE_ENV === 'production';

export const log = (id: string, comment: string) => {
  const date = new Date();
  console.log(`${date.toLocaleTimeString('sv-SE')} [${id}] ${comment}`);
};

const url =
  'https://api.pushshift.io/reddit/search?q=petakillsanimals.com&limit=10&filter=body,id,author,parent_id';

export const getJSON = bent('json', url);
