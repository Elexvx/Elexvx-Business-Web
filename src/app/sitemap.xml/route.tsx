import { escapeXml } from '../../content/html-entities.mjs';
import { loadInsights } from '../../content/loader';
import { loadNews } from '../../content/news-loader';
import { serviceRoutePaths } from '../../data/service-routes';
import { siteIdentity } from '../../data/site';
import { getStaticRoutes } from '../../site/routing/routes';

export const dynamic = 'force-static';

export function GET() {
  const indexableRoutes = getStaticRoutes(loadInsights(), loadNews())
    .filter((route) => route.meta.robots !== 'noindex,nofollow')
    .sort((a, b) => (b.meta.publishedAt ?? '').localeCompare(a.meta.publishedAt ?? ''));
  const entries = [
    ...indexableRoutes.flatMap((route) => {
      const path = route.path === '/' ? '/' : `${route.path}/`;
      const enPath = `/en${path}`;
      const lastmod = route.meta.updatedAt ?? route.meta.publishedAt;
      return [
        { path, lastmod, zhPath: path, enPath },
        { path: enPath, lastmod, zhPath: path, enPath },
      ];
    }),
    ...serviceRoutePaths.flatMap((routePath) => {
      const path = `${routePath}/`;
      const enPath = `/en${path}`;
      return [
        { path, lastmod: undefined, zhPath: path, enPath },
        { path: enPath, lastmod: undefined, zhPath: path, enPath },
      ];
    }),
  ];
  const urls = entries
    .map(({ path, lastmod, zhPath, enPath }) => {
      const loc = escapeXml(siteIdentity.canonicalOrigin + path);
      const zhHref = escapeXml(siteIdentity.canonicalOrigin + zhPath);
      const enHref = escapeXml(siteIdentity.canonicalOrigin + enPath);
      const date = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
      const alternates =
        `<xhtml:link rel="alternate" hreflang="zh-CN" href="${zhHref}"/>` +
        `<xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>` +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${zhHref}"/>`;
      return `  <url><loc>${loc}</loc>${date}${alternates}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
