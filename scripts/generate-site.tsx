import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { escapeHtml, escapeXml } from '../src/content/html-entities.mjs';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { siteIdentity } from '../src/data/site';
import { ENGLISH_BRAND_NAME } from '../src/data/site-origins';
import { ROOT_METADATA_DEFAULTS } from '../src/site/routing/metadata-base';
import { getStaticRoutes, redirectRoutes } from '../src/site/routing/routes';
import { translateEnglish } from '../src/site/translation';

const distRoot = resolve(process.cwd(), 'dist');
const insights = loadInsights();
const news = loadNews();
const routes = getStaticRoutes(insights, news);

const chineseRoot = ROOT_METADATA_DEFAULTS['zh-CN'];
const englishRoot = ROOT_METADATA_DEFAULTS.en;
const chineseRootTitleHtml = escapeHtml(chineseRoot.title);
const englishRootTitleHtml = escapeHtml(englishRoot.title);
const chineseRootDescriptionHtml = escapeHtml(chineseRoot.description);
const englishRootDescriptionHtml = escapeHtml(englishRoot.description);
const chineseRootKeywordsHtml = escapeHtml(chineseRoot.keywords.join(','));
const englishRootKeywordsHtml = escapeHtml(englishRoot.keywords.join(','));
const chineseSeoNameHtml = escapeHtml(siteIdentity.seoName);
const chineseCompanyNameHtml = escapeHtml(siteIdentity.companyName);
const englishBrandNameHtml = escapeHtml(ENGLISH_BRAND_NAME);
const chineseSiteDescriptionHtml = escapeHtml(siteIdentity.description);
const englishSiteDescriptionHtml = escapeHtml(translateEnglish(siteIdentity.description));

const redirectDocument = (target: string) => {
  const safeTarget = escapeHtml(target);
  const en = target.startsWith('/en/');
  const brand = en ? ENGLISH_BRAND_NAME : siteIdentity.seoName;
  return `<!doctype html>
<html lang="${en ? 'en' : 'zh-CN'}">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex,nofollow" />
    <meta http-equiv="refresh" content="0;url=${safeTarget}" />
    <title>${en ? 'Page moved' : '页面已移动'} | ${escapeHtml(brand)}</title>
  </head>
  <body style="margin:0;background:#000;color:#fff;font-family:system-ui,sans-serif">
    <main style="padding:48px"><p>${en ? 'This page has moved to' : '页面已移动到'} <a style="color:#fff" href="${safeTarget}">${safeTarget}</a>${en ? '.' : '。'}</p></main>
  </body>
</html>
`;
};

const writeRouteFile = async (path: string, html: string) => {
  const routeDirectory = join(distRoot, path.replace(/^\//, ''));
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(join(routeDirectory, 'index.html'), html, 'utf8');
};

for (const [from, target] of Object.entries(redirectRoutes)) {
  if (from !== target) await writeRouteFile(from, redirectDocument(target));
}

const activePaths = new Set(routes.map((route) => route.path));
const published = insights.filter(
  (insight) => insight.status === 'published' && activePaths.has(`/insights/${insight.slug}`)
);
const publishedNews = news.filter((item) => item.status === 'published' && activePaths.has(`/news/${item.slug}`));
const feedItems = [
  ...published.map((insight) => ({ ...insight, href: `/insights/${insight.slug}/` })),
  ...publishedNews.map((item) => ({ ...item, href: `/news/${item.slug}/` })),
].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteIdentity.seoName)}</title><link>${siteIdentity.canonicalOrigin}</link><description>${escapeXml(siteIdentity.seoDescription)}</description>${feedItems
  .map(
    (item) =>
      `<item><title>${escapeXml(item.title)}</title><link>${siteIdentity.canonicalOrigin}${item.href}</link><guid>${siteIdentity.canonicalOrigin}${item.href}</guid><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate><description>${escapeXml(item.excerpt)}</description></item>`
  )
  .join('')}</channel></rss>`;
await writeFile(join(distRoot, 'rss.xml'), rss, 'utf8');

await writeFile(
  join(distRoot, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /archive\nDisallow: /en/archive\nSitemap: ${siteIdentity.canonicalOrigin}/sitemap.xml\n`,
  'utf8'
);

console.log(
  `Next.js export postprocessed: ${routes.length} static routes, ${published.length} published insights, ${publishedNews.length} published news items, and ${Object.keys(redirectRoutes).length} redirects.`
);

// Static exports have one root layout; stamp the language on every English document.
const localizeDocumentLanguage = async (directory: string): Promise<void> => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await localizeDocumentLanguage(file);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      const englishErrorMetadata = html.includes('id="__next_error__"')
        ? html
            .replaceAll(`<title>${chineseRootTitleHtml}</title>`, `<title>${englishRootTitleHtml}</title>`)
            .replaceAll(`content="${chineseRootTitleHtml}"`, `content="${englishRootTitleHtml}"`)
            .replaceAll(chineseRootDescriptionHtml, englishRootDescriptionHtml)
            .replaceAll(`content="${chineseRootKeywordsHtml}"`, `content="${englishRootKeywordsHtml}"`)
            .replaceAll(`content="${chineseSeoNameHtml}"`, `content="${englishBrandNameHtml}"`)
            .replaceAll(`content="${chineseCompanyNameHtml}"`, `content="${englishBrandNameHtml}"`)
        : html;
      await writeFile(
        file,
        englishErrorMetadata
          .replace(
            /<html\b([^>]*)>/,
            (_, attributes: string) => `<html${attributes.replace(/\s+lang="[^"]*"/, '')} lang="en">`
          )
          .replaceAll(chineseSiteDescriptionHtml, englishSiteDescriptionHtml),
        'utf8'
      );
    }
  }
};
await localizeDocumentLanguage(join(distRoot, 'en'));
