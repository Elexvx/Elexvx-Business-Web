import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { INDEXNOW_KEY } from '../src/data/site-origins-constants.mjs';
import { assertHumiteEmbargo, isHumitePublicBuild } from './humite-export.mjs';

const output = 'esa/site';
const humitePublished = isHumitePublicBuild();
if (!humitePublished) await assertHumiteEmbargo('dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const notFoundHtml = await readFile('dist/404.html', 'utf8');
await cp('dist', `${output}/assets`, { recursive: true });
// The function embeds this fallback for actual misses. Leaving either file in
// the static directory would let ESA answer direct requests with HTTP 200.
await rm(`${output}/assets/404.html`, { force: true });
await rm(`${output}/assets/_not-found`, { recursive: true, force: true });
for (const prefix of ['', '/en']) {
  for (const section of ['insights', 'activities', 'products']) {
    await rm(`${output}/assets${prefix}/${section}/__empty__`, { recursive: true, force: true });
  }
}
const redirects = JSON.parse(await readFile('src/server/esa/redirects.json', 'utf8'));
// Legacy fallback HTML must not shadow the function's permanent redirects.
for (const redirect of redirects) {
  if (redirect.has || redirect.source.includes(':')) continue;
  await rm(`${output}/assets${redirect.source.replace(/\/$/, '')}/index.html`, { force: true });
}
const publishedManifest = await readFile('dist/indexnow-manifest.json', 'utf8');
if ((await readFile(`${output}/assets/${INDEXNOW_KEY}.txt`, 'utf8')).trim() !== INDEXNOW_KEY)
  throw new Error('Invalid deployed IndexNow key.');
const notification = `<script>if(location.hostname==='www.elexvx.com'){fetch('/api/publish/',{credentials:'omit',cache:'no-store'}).catch(()=>{});}</script>`;
async function addNotification(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await addNotification(path);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      await writeFile(path, html.replace('</body>', `${notification}</body>`));
    }
  }
}
await addNotification(`${output}/assets`);
await build({
  entryPoints: ['src/server/esa/single-project.ts'],
  outfile: `${output}/index.js`,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  define: {
    __ESA_NOT_FOUND_HTML__: JSON.stringify(notFoundHtml),
    __ESA_PUBLISH_MANIFEST__: publishedManifest,
    'process.env.NEXT_PUBLIC_HUMITE_PUBLISHED': JSON.stringify(String(humitePublished)),
  },
});
console.log('Built one ESA project: native static files, redirect/API function and fixed publish manifest.');
