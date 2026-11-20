import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { contentPath, loadInsights } from '../src/content/loader';
import { loadNews, newsContentPath } from '../src/content/news-loader';
import type { Insight, NewsItem } from '../src/content/types';
import { staticPageHeroByPath } from '../src/data/page-content';
import { researchDirections, validateSiteCatalog } from '../src/data/site';
import { getStaticRoutes } from '../src/site/routing/routes';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_URL_PATTERN = /^(https?:|\/|#)/i;

const assertValidSlug = (slug: string, label: string): void => {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`Invalid ${label} slug: ${slug}`);
};

const assertSafeUrl = (url: string | undefined, message: string): void => {
  if (url && !SAFE_URL_PATTERN.test(url)) throw new Error(message);
};

const assertPublicAssetExists = (assetPath: string | undefined, message: string): void => {
  if (assetPath?.startsWith('/') && !existsSync(join(process.cwd(), 'public', assetPath.slice(1)))) {
    throw new Error(message);
  }
};

const validateRoutes = (routes: Array<{ path: string }>): void => {
  const routeSet = new Set<string>();
  for (const route of routes) {
    if (routeSet.has(route.path)) throw new Error(`Duplicate route: ${route.path}`);
    routeSet.add(route.path);
  }
};

const validateInsights = (insights: Insight[], allowedDirections: ReadonlySet<string>): void => {
  for (const insight of insights) {
    assertValidSlug(insight.slug, 'insight');
    if (insight.directionSlug && !allowedDirections.has(insight.directionSlug)) {
      throw new Error(`Unknown direction for ${insight.slug}: ${insight.directionSlug}`);
    }
    for (const evidence of insight.evidence) {
      assertSafeUrl(evidence.url, `Unsafe evidence URL in ${insight.slug}: ${evidence.url}`);
    }
    assertPublicAssetExists(insight.cover, `Missing local cover asset in ${insight.slug}: ${insight.cover}`);
  }
};

const validateNews = (news: NewsItem[]): void => {
  for (const item of news) {
    assertValidSlug(item.slug, 'news');
    assertSafeUrl(item.sourceUrl, `Unsafe news source URL: ${item.slug}`);
    assertPublicAssetExists(item.cover, `Missing local news cover asset in ${item.slug}: ${item.cover}`);
  }
};

const validatePageHeroes = (): void => {
  for (const [path, hero] of Object.entries(staticPageHeroByPath)) {
    if (!hero.title || !hero.description || !hero.primaryAction.href) {
      throw new Error(`Incomplete page content: ${path}`);
    }
    assertPublicAssetExists(hero.media.src, `Missing hero asset for ${path}: ${hero.media.src}`);
  }
};

const runContentCheck = (): void => {
  const insights = loadInsights();
  const news = loadNews();
  const routes = getStaticRoutes(insights, news);
  const allowedDirections = new Set(researchDirections.map((direction) => direction.slug));

  validateSiteCatalog();
  validateRoutes(routes);
  validateInsights(insights, allowedDirections);
  validateNews(news);

  if (!existsSync(contentPath())) throw new Error(`Content directory does not exist: ${contentPath()}`);
  if (!existsSync(newsContentPath())) throw new Error(`News content directory does not exist: ${newsContentPath()}`);

  validatePageHeroes();
  console.log(
    `Content OK: ${insights.length} insight files, ${news.length} news files, ${news.filter((item) => item.status === 'published').length} published news, ${Object.keys(staticPageHeroByPath).length} parameterized page heroes.`
  );
};

runContentCheck();
