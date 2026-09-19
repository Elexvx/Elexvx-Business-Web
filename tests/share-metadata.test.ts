import { describe, expect, it } from 'vitest';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { nextMetadata } from '../src/site/routing/metadata';
import { getStaticRoutes } from '../src/site/routing/routes';
import { brandedHomepageTitle, brandedPageTitle, metadataForRoute } from '../src/site/routing/metadata-base';
import { newsArticleStructuredData } from '../src/site/seo/news-article-json-ld';

describe('static share metadata', () => {
  it('uses article-specific images and production links', () => {
    const data = nextMetadata('/activities/jinxi-entrepreneurship-roadshow-2026');
    expect(data.openGraph?.url).toBe('https://www.elexvx.com/activities/jinxi-entrepreneurship-roadshow-2026/');
    expect(data.openGraph?.images).toEqual([
      {
        url: 'https://www.elexvx.com/activities/jinxi-2026/jinxi-2026-group-photo.jpg',
        alt: '宏翔商道-Elexvx — 锦兮创见，共话企业成长 — 活动报道',
      },
    ]);
    expect(data.twitter).toMatchObject({ card: 'summary_large_image' });
  });
  it('keeps English share titles localized', () => {
    const data = nextMetadata('/activities/jinxi-entrepreneurship-roadshow-2026', 'en');
    expect(data.openGraph?.url).toBe('https://www.elexvx.com/en/activities/jinxi-entrepreneurship-roadshow-2026/');
    expect(data.openGraph?.title).not.toMatch(/[\u4e00-\u9fff]/);
  });
  it('provides a branded default cover', () => {
    expect(nextMetadata('/').openGraph?.images).toEqual([
      expect.objectContaining({ url: 'https://www.elexvx.com/share/elexvx.png' }),
    ]);
  });
  it('uses the company brand in Chinese search metadata', () => {
    const data = nextMetadata('/');
    expect(data.title).toEqual({ absolute: '宏翔商道-Elexvx — 人工智能与数据智能研发' });
    expect(data.openGraph?.title).toBe('宏翔商道-Elexvx — 人工智能与数据智能研发');
    expect(data.twitter?.title).toBe('宏翔商道-Elexvx — 人工智能与数据智能研发');
    expect(data.description).toContain('宏翔商道-Elexvx');
    expect(data.keywords).toEqual(expect.arrayContaining(['宏翔商道', 'Elexvx']));
  });
  it('keeps English homepage metadata concise and localized', () => {
    const data = nextMetadata('/', 'en');
    expect(data.title).toEqual({ absolute: 'Hongxiang Shangdao-Elexvx — AI & Data Intelligence R&D' });
    expect(data.openGraph?.title).toBe('Hongxiang Shangdao-Elexvx — AI & Data Intelligence R&D');
    expect(data.twitter?.title).toBe('Hongxiang Shangdao-Elexvx — AI & Data Intelligence R&D');
    expect(data.description).toMatch(/Hongxiang Shangdao-Elexvx/);
    expect(data.description).not.toMatch(/[\u4e00-\u9fff]/u);
    expect(data.description?.length).toBeLessThanOrEqual(160);
  });
  it('keeps short route metadata descriptive and unique', () => {
    const activities = nextMetadata('/activities');
    const products = nextMetadata('/products');
    const firstNews = nextMetadata('/news/2025-08-21-01');
    const secondNews = nextMetadata('/news/2026-01-14-01');
    expect(activities.title).toEqual({ absolute: '宏翔商道-Elexvx — 活动 — 项目合作' });
    expect(products.title).toEqual({ absolute: '宏翔商道-Elexvx — 产品 — 产品项目' });
    expect(activities.openGraph?.title).toBe('宏翔商道-Elexvx — 活动 — 项目合作');
    expect(activities.twitter?.title).toBe('宏翔商道-Elexvx — 活动 — 项目合作');
    expect(activities.description?.length).toBeGreaterThanOrEqual(80);
    expect(products.description?.length).toBeGreaterThanOrEqual(80);
    expect(firstNews.description).not.toBe(secondNews.description);
  });
  it('uses one localized page-title pattern across all generated routes', () => {
    for (const locale of ['zh-CN', 'en'] as const) {
      const brand = locale === 'en' ? 'Hongxiang Shangdao-Elexvx' : '宏翔商道-Elexvx';
      for (const route of getStaticRoutes(loadInsights(), loadNews())) {
        const data = metadataForRoute(route.meta, route.path, locale);
        const title = data.title;
        const absoluteTitle =
          typeof title === 'string' ? title : title && 'absolute' in title ? title.absolute : undefined;
        expect(absoluteTitle, `${locale} ${route.path}`).toBeDefined();
        if (route.path === '/') {
          expect(absoluteTitle, `${locale} homepage`).toBe(
            brandedHomepageTitle(locale === 'en' ? 'AI & Data Intelligence R&D' : '人工智能与数据智能研发', locale)
          );
        } else {
          expect(absoluteTitle?.startsWith(`${brand} — `), `${locale} ${route.path}`).toBe(true);
          expect(absoluteTitle?.split(`${brand} — `).length, `${locale} ${route.path}`).toBe(2);
        }
        expect(data.openGraph?.title, `${locale} ${route.path} Open Graph title`).toBe(absoluteTitle);
        expect(data.twitter?.title, `${locale} ${route.path} Twitter title`).toBe(absoluteTitle);
      }
    }
  });
  it('uses a brand-first format for homepage and page titles', () => {
    expect(brandedHomepageTitle('人工智能与数据智能研发')).toBe('宏翔商道-Elexvx — 人工智能与数据智能研发');
    expect(brandedPageTitle('服务中心')).toBe('宏翔商道-Elexvx — 服务中心');
    expect(brandedHomepageTitle('AI & Data Intelligence R&D', 'en')).toBe(
      'Hongxiang Shangdao-Elexvx — AI & Data Intelligence R&D'
    );
    expect(brandedPageTitle('Services', 'en')).toBe('Hongxiang Shangdao-Elexvx — Services');
  });
  it('removes legacy embedded brand suffixes before applying the shared format', () => {
    expect(brandedPageTitle('服务｜宏翔商道 / Elexvx')).toBe('宏翔商道-Elexvx — 服务');
    expect(brandedPageTitle('Services | Hongxiang Shangdao-Elexvx', 'en')).toBe('Hongxiang Shangdao-Elexvx — Services');
  });
  it('marks published news as an article for crawlers and sharing clients', () => {
    const data = nextMetadata('/news/2026-06-09-01');
    expect(data.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-06-09',
      siteName: '宏翔商道-Elexvx',
    });
  });
  it('emits localized NewsArticle JSON-LD for Google', () => {
    const item = loadNews().find((news) => news.slug === '2026-06-09-01');
    if (!item) throw new Error('Expected published news fixture');

    const chinese = JSON.parse(newsArticleStructuredData(item));
    const english = JSON.parse(newsArticleStructuredData(item, 'en'));

    expect(chinese).toMatchObject({
      '@type': 'NewsArticle',
      url: 'https://www.elexvx.com/news/2026-06-09-01/',
      inLanguage: 'zh-CN',
      publisher: { '@id': 'https://www.elexvx.com/#organization' },
    });
    expect(english).toMatchObject({
      '@type': 'NewsArticle',
      url: 'https://www.elexvx.com/en/news/2026-06-09-01/',
      inLanguage: 'en',
      publisher: { '@id': 'https://www.elexvx.com/#organization' },
    });
    expect(english.headline).not.toMatch(/[\u4e00-\u9fff]/u);
  });
});
