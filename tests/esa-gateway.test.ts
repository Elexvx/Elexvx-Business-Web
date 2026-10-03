import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleRequest, notifyPublishedContent, resolveRedirect } from '../src/server/esa/gateway';

const context = { waitUntil: vi.fn() };
const request = (path: string, init?: RequestInit) => new Request(`https://www.elexvx.com${path}`, init);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('ESA gateway', () => {
  it('preserves host entry points, legacy aliases and category redirects', () => {
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
    expect(resolveRedirect(new URL('https://www.elexvx.com/research/?category=unknown'))).toBeUndefined();
    expect(resolveRedirect(new URL('https://www.elexvx.com/research/'))).toBeUndefined();
  });

  it('serves files from ESA without forwarding cookies or authorization', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('page', { headers: { 'Content-Type': 'text/html', 'Content-Length': '4' } }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleRequest(
      request('/research/', { headers: { Cookie: 'private=data', Authorization: 'Bearer private' } }),
      context,
      {}
    );
    expect(fetchMock.mock.calls[0][0]).toBe('https://assets.elexvx.com/research/');
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.has('cookie')).toBe(false);
    expect(headers.has('authorization')).toBe(false);
    expect(response.headers.get('x-elexvx-hosting')).toBe('ESA');
    expect(response.headers.has('content-length')).toBe(false);
    expect(await response.text()).toBe('page');
  });

  it('keeps missing pages as HTTP 404 and internal redirects on the visitor host', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('missing', { status: 404 }))
        .mockResolvedValueOnce(
          new Response(null, { status: 307, headers: { Location: 'https://assets.elexvx.com/research/' } })
        )
    );
    expect((await handleRequest(request('/missing/'), context, {})).status).toBe(404);
    const response = await handleRequest(request('/research'), context, {});
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://www.elexvx.com/research/');
  });

  it('returns HEAD and conditional responses without a body', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('page'))
        .mockResolvedValueOnce(new Response(null, { status: 304 }))
    );
    expect(await (await handleRequest(request('/research/', { method: 'HEAD' }), context, {})).text()).toBe('');
    expect(
      (await handleRequest(request('/research/', { headers: { 'If-None-Match': 'tag' } }), context, {})).status
    ).toBe(304);
  });

  it('restricts API methods and protects IndexNow from public submission', async () => {
    expect((await handleRequest(request('/api/status/', { method: 'POST' }), context, {})).status).toBe(405);
    expect((await handleRequest(request('/api/status/'), context, {})).status).toBe(503);
    const indexnow = await handleRequest(request('/api/indexnow/'), context, { CRON_SECRET: 'private' });
    expect(indexnow.status).toBe(401);
    expect(indexnow.headers.get('cache-control')).toBe('private, no-store');
    expect((await handleRequest(request('/api/unknown/'), context, {})).status).toBe(404);
  });

  it('stores successful publish receipt and skips an already notified version', async () => {
    const version = 'a'.repeat(64);
    const get = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce('received');
    const put = vi.fn();
    vi.stubGlobal(
      'EdgeKV',
      class {
        get = get;
        put = put;
      }
    );
    const key = 'f84f594ae29eba5b114a6fe74823cadb422fecf00fdb530ed6c4c6ffaaa3aef4';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ version, urls: ['https://www.elexvx.com/research/'] }))
      .mockResolvedValueOnce(new Response(key))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))
      .mockResolvedValueOnce(Response.json({ version, urls: ['https://www.elexvx.com/research/'] }));
    vi.stubGlobal('fetch', fetchMock);
    await notifyPublishedContent('public-notification-state');
    await notifyPublishedContent('public-notification-state');
    expect(put).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(JSON.parse(put.mock.calls[0][1])).toMatchObject({ status: 202, submitted: 1 });
  });

  it('does not record failed IndexNow submissions as completed', async () => {
    const put = vi.fn();
    vi.stubGlobal(
      'EdgeKV',
      class {
        get = vi.fn().mockResolvedValue(undefined);
        put = put;
      }
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(Response.json({ version: 'b'.repeat(64), urls: ['https://evil.example/news/'] }))
    );
    await expect(notifyPublishedContent('public-notification-state')).rejects.toThrow('IndexNow URLs must use');
    expect(put).not.toHaveBeenCalled();
  });
});
