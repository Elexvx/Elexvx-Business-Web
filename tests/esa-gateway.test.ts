import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleRequest, notifyPublishedContent, resolveRedirect } from '../src/server/esa/gateway';

const context = { waitUntil: vi.fn() };
const request = (path: string, init?: RequestInit) => new Request(`https://www.elexvx.com${path}`, init);
const manifest = { version: 'a'.repeat(64), urls: ['https://www.elexvx.com/research/'] };
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('single ESA project', () => {
  it('preserves host, legacy, category and language redirects with query strings', () => {
    expect(resolveRedirect(new URL('https://ai.elexvx.com/research/?ref=old'))).toBe(
      'https://www.elexvx.com/research/?ref=old'
    );
    expect(resolveRedirect(new URL('https://status.elexvx.com/'))).toBe('https://status.elexvx.com/status/');
    expect(resolveRedirect(new URL('https://nav.elexvx.com/robots.txt'))).toBe(
      'https://nav.elexvx.com/navigation-robots.txt'
    );
    expect(resolveRedirect(new URL('https://www.elexvx.com/company/about/?ref=old'))).toBe(
      'https://www.elexvx.com/company/?ref=old'
    );
    expect(resolveRedirect(new URL('https://www.elexvx.com/en/research/?category=chip-architecture&ref=old'))).toBe(
      'https://www.elexvx.com/en/research/category/chip-architecture/?ref=old'
    );
    expect(resolveRedirect(new URL('https://www.elexvx.com/research/'))).toBeUndefined();
  });
  it('returns branded missing pages and HEAD without any static subrequest', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleRequest(request('/missing/'), context, {}, manifest, '<h1>404</h1>');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('<h1>404</h1>');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await (await handleRequest(request('/missing/', { method: 'HEAD' }), context, {})).text()).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('canonicalizes unknown categories instead of returning a missing page', async () => {
    const response = await handleRequest(request('/research/?category=unknown&ref=old'), context, {});
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://www.elexvx.com/research/?ref=old');
  });
  it('restricts methods and keeps the manual IndexNow endpoint authenticated', async () => {
    expect((await handleRequest(request('/api/status/', { method: 'POST' }), context, {})).status).toBe(405);
    expect((await handleRequest(request('/api/status/'), context, {})).status).toBe(503);
    const response = await handleRequest(request('/api/indexnow/'), context, { CRON_SECRET: 'private' });
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await handleRequest(request('/api/unknown/'), context, {})).status).toBe(404);
  });
  it('stores a successful publish receipt and skips an already notified version', async () => {
    const get = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce('received');
    const put = vi.fn();
    vi.stubGlobal(
      'EdgeKV',
      class {
        get = get;
        put = put;
      }
    );
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    await notifyPublishedContent('receipts', manifest);
    await notifyPublishedContent('receipts', manifest);
    expect(put).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(put.mock.calls[0][1])).toMatchObject({ status: 202, submitted: 1 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      urlList: manifest.urls,
      keyLocation: expect.stringContaining('https://www.elexvx.com/'),
    });
  });
  it('rejects external URLs and never records a failed publish submission', async () => {
    const put = vi.fn();
    vi.stubGlobal(
      'EdgeKV',
      class {
        get = vi.fn().mockResolvedValue(undefined);
        put = put;
      }
    );
    const fetchMock = vi.fn().mockResolvedValue(new Response('rejected', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      notifyPublishedContent('failed', { ...manifest, urls: ['https://evil.example/news/'] })
    ).rejects.toThrow('IndexNow URLs must use');
    await expect(notifyPublishedContent('failed', manifest)).rejects.toThrow('IndexNow rejected');
    expect(put).not.toHaveBeenCalled();
  });
  it('only queues the fixed compiled manifest and ignores caller URL parameters', async () => {
    vi.stubGlobal(
      'EdgeKV',
      class {
        get = vi.fn().mockResolvedValue(undefined);
        put = vi.fn();
      }
    );
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleRequest(
      request('/api/publish/?url=https://evil.example'),
      context,
      { INDEXNOW_KV_NAMESPACE: 'fixed-only' },
      manifest
    );
    expect(response.status).toBe(202);
    await context.waitUntil.mock.calls[0][0];
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).urlList).toEqual(manifest.urls);
  });
});
