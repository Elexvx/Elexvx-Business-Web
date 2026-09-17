import { describe, expect, it } from 'vitest';
import { loadNews } from '../src/content/news-loader';
import { nextMetadata } from '../src/site/routing/metadata';
import { newsArticleStructuredData } from '../src/site/seo/news-article-json-ld';

describe('static share metadata', () => {
  it('uses article-specific images and production links', () => {
    const data = nextMetadata('/activities/jinxi-entrepreneurship-roadshow-2026');
    expect(data.openGraph?.url).toBe('https://www.elexvx.com/activities/jinxi-entrepreneurship-roadshow-2026/');
    expect(data.openGraph?.images).toEqual([
      {
        url: 'https://www.elexvx.com/activities/jinxi-2026/jinxi-2026-group-photo.jpg',
        alt: '锦兮创见，共话企业成长｜活动报道与项目交流记录 | 宏翔商道-Elexvx',
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
    expect(data.title).toEqual({ absolute: '宏翔商道-Elexvx | 人工智能与数据智能研发' });
    expect(data.description).toContain('宏翔商道-Elexvx');
    expect(data.keywords).toEqual(expect.arrayContaining(['宏翔商道', 'Elexvx']));
  });
  it('keeps English homepage metadata concise and localized', () => {
    const data = nextMetadata('/', 'en');
    expect(data.title).toEqual({ absolute: 'Hongxiang Shangdao-Elexvx | AI & Data Intelligence R&D' });
    expect(data.description).toMatch(/Hongxiang Shangdao-Elexvx/);
    expect(data.description).not.toMatch(/[\u4e00-\u9fff]/u);
    expect(data.description?.length).toBeLessThanOrEqual(160);
  });
  it('keeps short route metadata descriptive and unique', () => {
    const activities = nextMetadata('/activities');
    const products = nextMetadata('/products');
    const firstNews = nextMetadata('/news/2025-08-21-01');
    const secondNews = nextMetadata('/news/2026-01-14-01');
    expect(activities.title).toMatchObject({ absolute: expect.stringContaining('活动交流与项目合作记录') });
    expect(activities.description?.length).toBeGreaterThanOrEqual(80);
    expect(products.description?.length).toBeGreaterThanOrEqual(80);
    expect(firstNews.description).not.toBe(secondNews.description);
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
