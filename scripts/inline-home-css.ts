import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Beasties from 'beasties';

// Inline critical rules only for high-impact landing routes. Keep the complete
// stylesheet available as a deferred/no-JavaScript fallback on every route.
const sharedAllowRules = [
  /data-theme/,
  /data-festival/,
  /\.cookie-/,
  /\.mobile-/,
  /\.global-nav/,
  /\.ui-dialog-/,
  /\.ui-visually-hidden/,
  /\.navigation-search/,
];
const homepageAllowRules = [
  /data-theme/,
  /data-festival/,
  /\.mobile-/,
  /\.global-nav/,
  /\.ui-visually-hidden/,
  /^\.site-shell-home\s+\.home-(?:ecosystem|latest-activity|news-section|products-section|company-section)$/,
];
const navigationAllowRules = [...sharedAllowRules, /\.service-page-hero/, /\.service-search/];
const statusAllowRules = [
  ...sharedAllowRules,
  /\.status-performance-shell/,
  /\.service-site-shell/,
  /\.service-status-/,
  /\.service-monitor-/,
  /\.service-availability-/,
  /\.service-group-uptime/,
  /\.service-refresh-button/,
  /\.service-history-action/,
  /\.site-footer/,
  /\.footer-/,
  /\.sr-only/,
];
const pages = [
  { file: 'dist/index.html', allowRules: homepageAllowRules, aboveTheFoldOnly: true },
  { file: 'dist/en/index.html', allowRules: homepageAllowRules, aboveTheFoldOnly: true },
  { file: 'dist/navigation/index.html', allowRules: navigationAllowRules },
  { file: 'dist/en/navigation/index.html', allowRules: navigationAllowRules },
  { file: 'dist/status/index.html', allowRules: statusAllowRules, inlineFonts: false },
  { file: 'dist/en/status/index.html', allowRules: statusAllowRules, inlineFonts: false },
];

const foundationCss = await readFile('src/styles/sections/01-foundation.css', 'utf8');
const homeFontPath = foundationCss.match(/\/fonts\/source-han-sans\/home-[a-f0-9]+\.woff2/)?.[0];
const rawHomeFontFace = foundationCss.match(
  /@font-face\s*\{[^}]*\/fonts\/source-han-sans\/home-[a-f0-9]+\.woff2[^}]*\}/
)?.[0];
const minifiedHomeFontFace = rawHomeFontFace
  ? rawHomeFontFace.replace(/\s+/g, ' ').replace(/\s*([{:;,}])\s*/g, '$1')
  : '';

const stripBelowTheFoldForCriticalCss = (html: string) =>
  html
    .replace(/<div class="home-static-fragment">[\s\S]*?<\/main>/, '</div></section></main>')
    .replace(/<footer\b[\s\S]*?<\/footer>/, '');

for (const { file, allowRules, inlineFonts = true, aboveTheFoldOnly = false } of pages) {
  const optimizer = new Beasties({
    path: resolve('dist'),
    preload: 'swap',
    pruneSource: false,
    reduceInlineStyles: false,
    inlineFonts,
    preloadFonts: false,
    noscriptFallback: true,
    allowRules,
    logLevel: 'warn',
  });
  const html = await readFile(file, 'utf8');
  const processed = await optimizer.process(html);
  const criticalSource = aboveTheFoldOnly ? await optimizer.process(stripBelowTheFoldForCriticalCss(html)) : processed;
  // Next emits several CSS chunks. Keep the complete critical cascade after all
  // deferred links so a partially loaded chunk cannot temporarily override it.
  const criticalStyles: string[] = [];
  criticalSource.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, (style) => {
    criticalStyles.push(style);
    return '';
  });
  const withoutCriticalStyles = processed.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
  const isHomepage = file === 'dist/index.html' || file === 'dist/en/index.html';
  if (isHomepage && minifiedHomeFontFace && criticalStyles.length > 0 && !criticalStyles[0].includes('@font-face')) {
    criticalStyles[0] = criticalStyles[0].replace('<style>', `<style>${minifiedHomeFontFace}`);
  }
  const fontPreload =
    isHomepage && homeFontPath && !withoutCriticalStyles.includes(`href="${homeFontPath}"`)
      ? `<link rel="preload" as="font" type="font/woff2" href="${homeFontPath}" crossorigin="anonymous" fetchpriority="high">`
      : '';
  let result = withoutCriticalStyles.replace('</head>', `${criticalStyles.join('')}</head>`);
  if (fontPreload) {
    result = result.includes('<meta name="viewport"')
      ? result.replace(/<meta name="viewport"[^>]*>/, (tag) => `${tag}${fontPreload}`)
      : result.replace('</head>', `${fontPreload}</head>`);
  }
  await writeFile(file, result);
}
console.log('Inlined route-specific critical CSS for the homepages, navigation, and status page.');
