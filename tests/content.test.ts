import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { getStaticRoutes, redirectRoutes, resolveRoute } from '../src/site/routing/routes';
import { homeContent, staticPageHeroByPath } from '../src/data/page-content';
import { validateSiteCatalog } from '../src/data/site';
import { publishedCaseStudies } from '../src/data/case-studies';

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

  it('publishes verified insights while excluding drafts and other parked sections', () => {
    const insights = loadInsights();
    const news = loadNews();
    const routes = getStaticRoutes(insights, news).map((route) => route.path);
    expect(routes).not.toContain('/insights');
    for (const insight of insights.filter((item) => item.status === 'published')) {
      expect(routes).toContain(`/insights/${insight.slug}`);
    }
    expect(routes).toContain('/research/moe-chiplet-expert-reuse');
    expect(routes).not.toContain('/insights/llm-safety-boundaries');
    expect(routes).not.toContain('/insights/question-before-model');
    expect(routes).not.toContain('/insights/industrial-safety-data');
    expect(routes).not.toContain('/capabilities');
    expect(routes).not.toContain('/projects');
    expect(routes).not.toContain('/scenarios');
    expect(routes).not.toContain('/archive');
    expect(routes).toContain('/news/2026-06-09-01');
    expect(resolveRoute('/missing', insights).meta.robots).toBe('noindex,nofollow');
  });

  it('publishes the active news collection', () => {
    const news = loadNews();
    expect(news).toHaveLength(7);
    expect(news.every((item) => item.status === 'published')).toBe(true);
    expect(news.some((item) => item.slug === 'exam-2025-07-08-01')).toBe(false);
    expect(news.some((item) => item.slug === 'stories-2025-07-01-01')).toBe(false);
    expect(news.some((item) => item.slug === 'technology-2025-07-01-01')).toBe(false);
    expect(news.every((item) => item.cover?.startsWith('/visuals/') || item.cover?.startsWith('/activities/'))).toBe(
      true
    );
  });

  it('keeps the latest activity module enabled and data-driven by default', () => {
    expect(homeContent.latestActivity.enabled).toBe(true);
    expect(homeContent.latestActivity.title).toBeTruthy();
    expect(homeContent.latestActivity.action.href).toBe('/news');
    expect(homeContent.latestActivity.media.src.startsWith('/visuals/')).toBe(true);
  });

  it('publishes the cooperation case as its own route with an English body', () => {
    const insights = loadInsights();
    const news = loadNews();
    const routes = getStaticRoutes(insights, news).map((route) => route.path);
    expect(publishedCaseStudies).toHaveLength(1);
    expect(routes).toContain(`/cases/${publishedCaseStudies[0].slug}`);
    expect(publishedCaseStudies[0].title).toBe('ELEXVX 期刊管理与出版协同系统助力凯城国际');
    expect(publishedCaseStudies[0].excerpt).toContain('凯城国际出版社');
    expect(publishedCaseStudies[0].titleEn).toContain('ELEXVX Journal Management & Publishing Collaboration System');
    expect(publishedCaseStudies[0].bodyEn).toContain('Kaicheng International Publishing House');
  });

  it('excludes the withdrawn ElexvxAI announcement and its former activity redirects', () => {
    const news = loadNews();
    const slug = 'elexvxai-lab-established-2026';
    const paths = getStaticRoutes(loadInsights(), news).map((route) => route.path);
    expect(news.some((article) => article.slug === slug)).toBe(false);
    expect(paths).not.toContain(`/news/${slug}`);
    expect(paths).not.toContain(`/activities/${slug}`);
    expect(redirectRoutes[`/activities/${slug}`]).toBeUndefined();
    expect(redirectRoutes[`/en/activities/${slug}`]).toBeUndefined();
  });

  it('validates parameterized catalog references and gives every static subpage a hero visual', () => {
    expect(validateSiteCatalog()).toBe(true);
    expect(Object.keys(staticPageHeroByPath)).toHaveLength(12);
    for (const hero of Object.values(staticPageHeroByPath)) {
      expect(hero.title).toBeTruthy();
      expect(hero.primaryAction.href).toBeTruthy();
      expect(hero.media.src.startsWith('/')).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', hero.media.src.slice(1)))).toBe(true);
    }
  });
});
