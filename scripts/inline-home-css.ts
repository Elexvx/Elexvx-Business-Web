import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Beasties from 'beasties';

// Inline critical rules only for high-impact landing routes. Keep the complete
// stylesheet available as a deferred/no-JavaScript fallback on every route.
const sharedAllowRules = [/data-theme/, /\.cookie-/, /\.mobile-/, /\.global-nav/];
const pages = [
  { file: 'dist/index.html', allowRules: sharedAllowRules },
  { file: 'dist/en/index.html', allowRules: sharedAllowRules },
  {
    file: 'dist/navigation/index.html',
    allowRules: [...sharedAllowRules, /\.service-page-hero/, /\.service-search/],
  },
];

for (const { file, allowRules } of pages) {
  const optimizer = new Beasties({
    path: resolve('dist'),
    preload: 'swap',
    pruneSource: false,
    reduceInlineStyles: false,
    inlineFonts: true,
    preloadFonts: false,
    noscriptFallback: true,
    allowRules,
    logLevel: 'warn',
  });
  const html = await readFile(file, 'utf8');
  const processed = await optimizer.process(html);
  // Next emits several CSS chunks. Keep the complete critical cascade after all
  // deferred links so a partially loaded chunk cannot temporarily override it.
  const criticalStyles: string[] = [];
  const withoutCriticalStyles = processed.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, (style) => {
    criticalStyles.push(style);
    return '';
  });
  await writeFile(file, withoutCriticalStyles.replace('</head>', `${criticalStyles.join('')}</head>`));
}
console.log('Inlined route-specific critical CSS for the homepages and service navigation.');
