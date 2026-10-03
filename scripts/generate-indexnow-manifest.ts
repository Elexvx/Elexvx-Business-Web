import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { selectIndexNowUrls } from '../src/server/indexnow';

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const urls = selectIndexNowUrls(sitemap, { includeAll: true });
const hash = createHash('sha256').update(sitemap);
for (const value of urls) {
  const path = new URL(value).pathname;
  hash.update(value).update(await readFile(resolve('dist', `.${path}`, 'index.html')));
}
await writeFile('dist/indexnow-manifest.json', JSON.stringify({ version: hash.digest('hex'), urls }) + '\n');
console.log(`Prepared ESA publish notification for ${urls.length} article and collection URLs.`);
