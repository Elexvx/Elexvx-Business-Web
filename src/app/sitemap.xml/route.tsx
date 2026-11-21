import { escapeXml } from '../../content/html-entities.mjs';
import { loadInsights } from '../../content/loader';
import { loadNews } from '../../content/news-loader';
import { serviceRoutePaths } from '../../data/service-routes';
import { siteIdentity } from '../../data/site';
import { getStaticRoutes } from '../../site/routing/routes';
import { translateEnglish } from '../../site/translation';

export const dynamic = 'force-static';

const serviceTitles: Record<(typeof serviceRoutePaths)[number], string> = {
  '/services': '服务中心',
  '/navigation': '企业服务导航',
  '/status': '服务状态',
  '/status/history': '服务状态历史',
};

export function GET() {
  const indexableRoutes = getStaticRoutes(loadInsights(), loadNews())
    .filter((route) => route.meta.robots !== 'noindex,nofollow')
    .sort((a, b) => (b.meta.publishedAt ?? '').localeCompare(a.meta.publishedAt ?? ''));
  const entries = [
    ...indexableRoutes.flatMap((route) => {
      const path = route.path === '/' ? '/' : `${route.path}/`;
      const lastmod = route.meta.updatedAt ?? route.meta.publishedAt;
      return [
        { path, lastmod, title: route.meta.title },
        { path: `/en${path}`, lastmod, title: route.meta.titleEn ?? translateEnglish(route.meta.title) },
      ];
    }),
    ...serviceRoutePaths.map((path) => ({ path: `${path}/`, lastmod: undefined, title: serviceTitles[path] })),
  ];
  const urls = entries
    .map(({ path, lastmod, title }) => {
      const loc = escapeXml(siteIdentity.canonicalOrigin + path);
      const date = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
      return `  <url><loc>${loc}</loc>${date}<a xmlns="http://www.w3.org/1999/xhtml" href="${escapeXml(path)}">${escapeXml(title)}</a></url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="/sitemap.css"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
