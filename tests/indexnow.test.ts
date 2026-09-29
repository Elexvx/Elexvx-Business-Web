import { describe, expect, it } from 'vitest';
import { selectIndexNowUrls } from '../src/server/indexnow';

const origin = 'https://www.elexvx.com';
const now = Date.parse('2026-09-29T12:00:00Z');
const sitemap = (entries: Array<[string, string?]>) =>
  `<urlset>${entries
    .map(([url, date]) => `<url><loc>${url}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`)
    .join('')}</urlset>`;

describe('IndexNow content discovery', () => {
  it('submits articles, collections and categories in both languages', () => {
    const paths = [
      '/research/',
      '/activities/',
      '/news/',
      '/research/example/',
      '/insights/example/',
      '/research/category/chip-architecture/',
      '/en/activities/category/roadshows/',
      '/en/news/',
    ];
    const xml = sitemap(paths.map((path) => [origin + path, '2026-09-28']));
    expect(selectIndexNowUrls(xml, { now })).toEqual(paths.map((path) => origin + path));
  });
  it('keeps the daily job limited to recently changed content', () => {
    const xml = sitemap([
      ['https://www.elexvx.com/news/old/', '2020-01-01'],
      [origin + '/news/', '2026-09-28'],
      [origin + '/news/undated/'],
    ]);
    expect(selectIndexNowUrls(xml, { now })).toEqual([origin + '/news/']);
    expect(selectIndexNowUrls(xml, { now, includeAll: true })).toHaveLength(3);
  });
  it('rejects unrelated hosts, filters, private paths and malformed URLs', () => {
    const urls = [
      'https://evil.example/news/test/',
      'http://www.elexvx.com/news/test/',
      origin + '/news/?category=test',
      origin + '/research/#test',
      origin + '/api/login/',
      origin + '/archive/',
      origin + '/company/',
      origin + '/insights/',
      'invalid',
      origin + '/news/a/b/',
    ];
    expect(selectIndexNowUrls(sitemap(urls.map((url) => [url])), { includeAll: true })).toEqual([]);
  });
  it('deduplicates sitemap URLs and fails on security checkpoint HTML', () => {
    const url = origin + '/research/';
    expect(selectIndexNowUrls(sitemap([[url], [url]]), { includeAll: true })).toEqual([url]);
    expect(() => selectIndexNowUrls('<html>Security Checkpoint</html>')).toThrow('not a URL sitemap');
    expect(() => selectIndexNowUrls('<urlset/>', { lookbackDays: 0 })).toThrow('positive number');
  });
});
