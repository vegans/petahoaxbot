import { watchers } from './watcher';
import * as fs from 'fs';

let comment = '';

Object.entries(watchers).forEach(([key, value]) => {
  comment =
    comment +
    `
<details>
  <summary>${key}</summary>
  
  ${value}
</details>`;
});

fs.mkdir('./dist', { recursive: true }, () => {
  fs.writeFileSync('./dist/replies.md', comment);
});
