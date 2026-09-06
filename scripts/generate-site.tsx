import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { getStaticRoutes, redirectRoutes } from '../src/site/routing/routes';
import { siteIdentity } from '../src/data/site';

const distRoot = resolve(process.cwd(), 'dist');
const insights = loadInsights();
const news = loadNews();
const routes = getStaticRoutes(insights, news);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const redirectDocument = (target: string) => {
  const safeTarget = escapeHtml(target);
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex,nofollow" />
    <meta http-equiv="refresh" content="0;url=${safeTarget}" />
    <title>页面已移动 · Elexvx Research</title>
  </head>
  <body style="margin:0;background:#000;color:#fff;font-family:system-ui,sans-serif">
    <main style="padding:48px"><p>页面已移动到 <a style="color:#fff" href="${safeTarget}">${safeTarget}</a>。</p></main>
  </body>
</html>
`;
};

const writeRouteFile = async (path: string, html: string) => {
  const routeDirectory = join(distRoot, path.replace(/^\//, ''));
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(join(routeDirectory, 'index.html'), html, 'utf8');
  const cleanUrlFile = join(distRoot, `${path.replace(/^\//, '')}.html`);
  await mkdir(dirname(cleanUrlFile), { recursive: true });
  await writeFile(cleanUrlFile, html, 'utf8');
};

for (const [from, target] of Object.entries(redirectRoutes)) {
  if (from !== target) await writeRouteFile(from, redirectDocument(target));
}

const indexableRoutes = routes.filter((route) => route.meta.robots !== 'noindex,nofollow');
const localizedIndexablePaths = indexableRoutes.flatMap((route) => {
  const path = route.path === '/' ? '/' : `${route.path}/`;
  const englishPath = route.path === '/' ? '/en/' : `/en${route.path}/`;
  return [path, englishPath];
});
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${localizedIndexablePaths
  .map((path) => `<url><loc>${siteIdentity.canonicalOrigin}${path}</loc></url>`)
  .join('')}</urlset>\n`;
await writeFile(join(distRoot, 'sitemap.xml'), sitemap, 'utf8');

const activePaths = new Set(routes.map((route) => route.path));
const published = insights.filter(
  (insight) => insight.status === 'published' && activePaths.has(`/insights/${insight.slug}`)
);
const publishedNews = news.filter((item) => item.status === 'published' && activePaths.has(`/news/${item.slug}`));
const feedItems = [
  ...published.map((insight) => ({ ...insight, href: `/insights/${insight.slug}/` })),
  ...publishedNews.map((item) => ({ ...item, href: `/news/${item.slug}/` })),
].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteIdentity.researchName)}</title><link>${siteIdentity.canonicalOrigin}</link><description>${escapeXml(siteIdentity.description)}</description>${feedItems
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
