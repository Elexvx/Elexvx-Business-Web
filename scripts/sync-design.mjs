import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile(new URL('../public/company/design/design.md', import.meta.url), 'utf8');
await writeFile(new URL('../src/data/design-document.json', import.meta.url), JSON.stringify({ source }, null, 2) + '\n');
