import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Beasties from 'beasties';

// Inline only rules used by the homepage. Keep shared CSS intact for other routes
// and retain a no-JavaScript fallback for the deferred stylesheet.
const optimizer = new Beasties({
  path: resolve('dist'),
  preload: 'swap',
  pruneSource: false,
  reduceInlineStyles: false,
  inlineFonts: true,
  preloadFonts: false,
  noscriptFallback: true,
  allowRules: [/data-theme/, /\.cookie-/, /\.mobile-/, /\.global-nav/],
  logLevel: 'warn',
});
for (const file of ['dist/index.html', 'dist/en/index.html']) {
  const html = await readFile(file, 'utf8');
  await writeFile(file, await optimizer.process(html));
}
console.log('Inlined homepage critical CSS for both languages.');
