import * as fs from 'fs';
import * as fm from 'front-matter';

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
      const by =
        content.attributes?.['by'] && content.attributes?.['by_url']
          ? `[Read more about ${content.attributes?.['by']}](${content.attributes?.['by_url']}) |\n`
          : '';
      body = body
        .replace('{term}', term)
        .replace('{file}', file)
        .replace('{by-footer}\n', by);
      watchers[term] = body;
    });
  });

export const keys = Object.keys(watchers);
