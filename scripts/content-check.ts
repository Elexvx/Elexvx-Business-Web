import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadInsights, contentPath } from '../src/content/loader';
import { getStaticRoutes } from '../src/app/routes';
import { loadNews, newsContentPath } from '../src/content/news-loader';
import { staticPageHeroByPath } from '../src/data/page-content';
import { validateSiteCatalog } from '../src/data/site';

const insights = loadInsights();
const news = loadNews();
const routes = getStaticRoutes(insights, news);
const routeSet = new Set<string>();

validateSiteCatalog();

for (const route of routes) {
  if (routeSet.has(route.path)) throw new Error(`Duplicate route: ${route.path}`);
  routeSet.add(route.path);
}

for (const insight of insights) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(insight.slug)) throw new Error(`Invalid insight slug: ${insight.slug}`);
  if (
    insight.directionSlug &&
    !['ai-data', 'industrial-intelligence', 'llm-ai-safety'].includes(insight.directionSlug)
  ) {
    throw new Error(`Unknown direction for ${insight.slug}: ${insight.directionSlug}`);
  }
  for (const evidence of insight.evidence) {
    if (evidence.url && !/^(https?:|\/|#)/i.test(evidence.url))
      throw new Error(`Unsafe evidence URL in ${insight.slug}: ${evidence.url}`);
  }
  if (insight.cover?.startsWith('/') && !existsSync(join(process.cwd(), 'public', insight.cover.slice(1)))) {
    throw new Error(`Missing local cover asset in ${insight.slug}: ${insight.cover}`);
  }
}

for (const item of news) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error(`Invalid news slug: ${item.slug}`);
  for (const value of [item.sourceUrl]) {
    if (value && !/^(https?:|\/|#)/i.test(value)) throw new Error(`Unsafe news source URL: ${item.slug}`);
  }
  if (item.cover?.startsWith('/') && !existsSync(join(process.cwd(), 'public', item.cover.slice(1)))) {
    throw new Error(`Missing local news cover asset in ${item.slug}: ${item.cover}`);
  }
}

if (!existsSync(contentPath())) throw new Error(`Content directory does not exist: ${contentPath()}`);
if (!existsSync(newsContentPath())) throw new Error(`News content directory does not exist: ${newsContentPath()}`);
for (const [path, hero] of Object.entries(staticPageHeroByPath)) {
  if (!hero.title || !hero.description || !hero.primaryAction.href) throw new Error(`Incomplete page content: ${path}`);
  if (!existsSync(join(process.cwd(), 'public', hero.media.src.slice(1)))) {
    throw new Error(`Missing hero asset for ${path}: ${hero.media.src}`);
  }
}
console.log(
  `Content OK: ${insights.length} insight files, ${news.length} news files, ${news.filter((item) => item.status === 'published').length} published news, ${Object.keys(staticPageHeroByPath).length} parameterized page heroes.`
);
