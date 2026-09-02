import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { getStaticRoutes, resolveRoute } from '../src/app/routes';
import { homeContent, staticPageHeroByPath } from '../src/data/page-content';
import { validateSiteCatalog } from '../src/data/site';

describe('content publication gates', () => {
  it('loads published and draft insights while only publishing verified content', () => {
    const insights = loadInsights();
    expect(insights.some((insight) => insight.status === 'draft')).toBe(true);
    expect(
      insights
        .filter((insight) => insight.status === 'published')
        .every((insight) => insight.evidence.every((item) => item.verified))
    ).toBe(true);
  });

  it('creates static routes for published insights but not drafts', () => {
    const insights = loadInsights();
    const news = loadNews();
    const routes = getStaticRoutes(insights, news).map((route) => route.path);
    expect(routes).toContain('/insights/question-before-model');
    expect(routes).not.toContain('/insights/llm-safety-boundaries');
    expect(routes).toContain('/news/2026-06-09-01');
    expect(resolveRoute('/missing', insights).meta.robots).toBe('noindex,nofollow');
  });

  it('migrates all legacy posts into the published news collection', () => {
    const news = loadNews();
    expect(news).toHaveLength(10);
    expect(news.every((item) => item.status === 'published')).toBe(true);
    expect(news.every((item) => item.cover?.startsWith('/visuals/news/'))).toBe(true);
  });

  it('keeps the latest activity module enabled and data-driven by default', () => {
    expect(homeContent.latestActivity.enabled).toBe(true);
    expect(homeContent.latestActivity.title).toBeTruthy();
    expect(homeContent.latestActivity.action.href).toBe('/news');
    expect(homeContent.latestActivity.media.src.startsWith('/visuals/')).toBe(true);
  });

  it('validates parameterized catalog references and gives every static subpage a hero visual', () => {
    expect(validateSiteCatalog()).toBe(true);
    expect(Object.keys(staticPageHeroByPath)).toHaveLength(13);
    for (const hero of Object.values(staticPageHeroByPath)) {
      expect(hero.title).toBeTruthy();
      expect(hero.primaryAction.href).toBeTruthy();
      expect(hero.media.src.startsWith('/')).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', hero.media.src.slice(1)))).toBe(true);
    }
  });
});
