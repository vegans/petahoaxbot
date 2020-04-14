import * as fs from 'fs';
import * as fm from 'front-matter';

const footer = fs.readFileSync('./markdown/_footer.md', 'utf8');

interface Attributes {
  term: string | string[];
  by?: string;
  byUrl?: string;
}

export const watchers = {};
fs.readdirSync('./markdown')
  .filter((file) => !file.startsWith('_'))
  .forEach((file) => {
    const data = fs.readFileSync('./markdown/' + file, 'utf8');
    const { attributes, body }: { attributes: Attributes; body: string } = fm(
      data,
    );
    const terms = Array.isArray(attributes.term)
      ? attributes.term
      : [attributes.term];
    terms.forEach((term) => {
      let output = `${body}\n${footer}`;
      const { by, byUrl } = attributes;
      const byString =
        by && byUrl ? `[Read more about ${by}](${byUrl}) |\n` : '';
      output = output
        .replace('{term}', term)
        .replace('{file}', file)
        .replace('{by-footer}\n', byString);
      watchers[term] = output;
    });
  });

export const keys = Object.keys(watchers);
