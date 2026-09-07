import { describe, expect, it } from 'vitest';
import { nextMetadata } from '../src/site/routing/metadata';

describe('static share metadata', () => {
  it('uses article-specific images and production links', () => {
    const data = nextMetadata('/activities/jinxi-entrepreneurship-roadshow-2026');
    expect(data.openGraph?.url).toBe('https://www.elexvx.com/activities/jinxi-entrepreneurship-roadshow-2026/');
    expect(data.openGraph?.images).toEqual([
      {
        url: 'https://www.elexvx.com/activities/jinxi-2026/jinxi-2026-group-photo.jpg',
        alt: '锦兮创见，共话企业成长 · Elexvx Research',
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
});
