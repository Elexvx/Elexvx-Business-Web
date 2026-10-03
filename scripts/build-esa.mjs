import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const output = 'esa/site';
await rm(output, { recursive: true, force: true });
await mkdir(`${output}/assets`, { recursive: true });
await cp('dist', `${output}/assets/_esa-assets`, { recursive: true });
const robotsPath = `${output}/assets/_esa-assets/robots.txt`;
const robots = await readFile(robotsPath, 'utf8');
await writeFile(robotsPath, robots.replace(/Disallow:\s*\n/, 'Disallow: /_esa-assets/\n'));
await build({
  entryPoints: ['src/server/esa/single-project.ts'],
  outfile: `${output}/index.js`,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  define: { __ESA_NOT_FOUND_HTML__: JSON.stringify(await readFile('dist/404.html', 'utf8')) },
});
console.log('Built one ESA project with static pages, redirects, status API and IndexNow.');
