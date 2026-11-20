import { afterEach, describe, expect, it, vi } from 'vitest';
import { documentationUrl } from '../src/data/service-routes';
import { PREVIEW_HOST } from '../src/data/site-origins';
import { handleRequest, notifyPublishedContent, resolveRedirect } from '../src/server/esa/gateway';
import { resetStatusCacheForTests } from '../src/server/status/uptime-robot';

const createContext = () => ({ waitUntil: vi.fn<(task: Promise<unknown>) => void>() });
const request = (path: string, init?: RequestInit, host = 'www.elexvx.com') =>
  new Request(`https://${host}${path}`, init);
const manifest = { version: 'a'.repeat(64), urls: ['https://www.elexvx.com/research/'] };

afterEach(() => {
  vi.useRealTimers();
  resetStatusCacheForTests();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('single ESA project', () => {
  it.each(['', '/en'])('only enables the legacy product redirect in released builds (%s)', async (prefix) => {
    const path = `${prefix}/products/bookkin/`;
    const context = createContext();

    vi.stubEnv('NEXT_PUBLIC_HUMITE_PUBLISHED', 'false');
    expect((await handleRequest(request(path), context, {})).status).toBe(404);

    vi.stubEnv('NEXT_PUBLIC_HUMITE_PUBLISHED', 'true');
    const response = await handleRequest(request(path), context, {});
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(`https://www.elexvx.com${prefix}/products/humite/`);
  });

  it.each(['/services/docs', '/services/docs/'])('redirects the retired documentation page at %s', async (path) => {
    const response = await handleRequest(request(path), createContext(), {});
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(documentationUrl);
  });

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
    const context = createContext();
    const response = await handleRequest(request('/missing/'), context, {}, manifest, '<h1>404</h1>');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('<h1>404</h1>');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await (await handleRequest(request('/missing/', { method: 'HEAD' }), context, {})).text()).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('canonicalizes unknown categories instead of returning a missing page', async () => {
    const response = await handleRequest(request('/research/?category=unknown&ref=old'), createContext(), {});
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://www.elexvx.com/research/?ref=old');
  });

  it('restricts methods and keeps the manual IndexNow endpoint authenticated', async () => {
    const context = createContext();
    expect((await handleRequest(request('/api/status/', { method: 'POST' }), context, {})).status).toBe(405);
    expect((await handleRequest(request('/api/status/'), context, {})).status).toBe(503);
    const response = await handleRequest(request('/api/indexnow/'), context, { CRON_SECRET: 'private' });
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await handleRequest(request('/api/unknown/'), context, {})).status).toBe(404);
  });

  it('serves /api/status with Server-Timing and Cache-Control for overview and full history, or 502 on failure', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestBody = new URLSearchParams(String(init?.body ?? ''));
      const rangeCount = requestBody.get('custom_uptime_ranges')?.split('-').length ?? 0;
      return new Response(
        JSON.stringify({
          stat: 'ok',
          monitors: [
            {
              id: 1,
              friendly_name: 'Gateway Monitor',
              status: 2,
              type: 1,
              interval: 300,
              custom_uptime_ranges: Array.from({ length: rangeCount }, () => '100.00').join('-'),
            },
          ],
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const overviewResponse = await handleRequest(request('/api/status/?days=14'), createContext(), {
      UPTIMEROBOT_API_KEY: 'key',
    });
    expect(overviewResponse.status).toBe(200);
    expect(overviewResponse.headers.get('cache-control')).toBe('public, max-age=30, stale-while-revalidate=300');
    expect(overviewResponse.headers.get('server-timing')).toMatch(/^uptime-robot;dur=\d+$/);
    const overviewPayload = (await overviewResponse.json()) as {
      code: number;
      data: { monitors: Array<{ days: unknown[] }> };
    };
    expect(overviewPayload.code).toBe(200);
    expect(overviewPayload.data.monitors[0].days).toHaveLength(14);

    const historyResponse = await handleRequest(request('/api/status/'), createContext(), {
      UPTIMEROBOT_API_KEY: 'key',
    });
    expect(historyResponse.status).toBe(200);
    const historyPayload = (await historyResponse.json()) as {
      data: { monitors: Array<{ days: unknown[] }> };
    };
    expect(historyPayload.data.monitors[0].days).toHaveLength(60);

    resetStatusCacheForTests();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Upstream error')));
    const errorResponse = await handleRequest(request('/api/status/'), createContext(), {
      UPTIMEROBOT_API_KEY: 'key',
    });
    expect(errorResponse.status).toBe(502);
  });

  it('handles authorized /api/indexnow success, method restriction, missing config, and upstream failure', async () => {
    const context = createContext();
    const authHeaders = { authorization: 'Bearer secret-token' };

    expect((await handleRequest(request('/api/indexnow/', { method: 'POST' }), context, {})).status).toBe(405);
    expect(
      (
        await handleRequest(request('/api/indexnow/', { headers: authHeaders }), context, {
          CRON_SECRET: 'secret-token',
        })
      ).status
    ).toBe(503);

    vi.stubGlobal(
      'EdgeKV',
      class {
        get = vi.fn().mockResolvedValue(undefined);
        put = vi.fn();
      }
    );
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));

    const okResponse = await handleRequest(
      request('/api/indexnow/', { headers: authHeaders }),
      context,
      { CRON_SECRET: 'secret-token', INDEXNOW_KV_NAMESPACE: 'indexnow-ok' },
      manifest
    );
    expect(okResponse.status).toBe(200);
    expect(await okResponse.json()).toMatchObject({ ok: true });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('denied', { status: 500 })));
    const failResponse = await handleRequest(
      request('/api/indexnow/', { headers: authHeaders }),
      context,
      { CRON_SECRET: 'secret-token', INDEXNOW_KV_NAMESPACE: 'indexnow-fail' },
      manifest
    );
    expect(failResponse.status).toBe(502);
  });

  it('handles /api/login and /api/logout endpoints', async () => {
    const context = createContext();
    expect((await handleRequest(request('/api/login', { method: 'GET' }), context, {})).status).toBe(405);

    const loginResponse = await handleRequest(request('/api/login', { method: 'POST' }), context, {});
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get('set-cookie')).toBeNull();

    const logoutResponse = await handleRequest(request('/api/logout', { method: 'POST' }), context, {});
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers.get('set-cookie')).toContain('Max-Age=0');
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
    const context = createContext();
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

  it('skips waitUntil on preview hosts and enforces cooldown with cleanup on failure', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-18T12:00:00.000Z'));

    vi.stubGlobal(
      'EdgeKV',
      class {
        get = vi.fn().mockResolvedValue(undefined);
        put = vi.fn();
      }
    );
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })));

    const previewContext = createContext();
    const previewResponse = await handleRequest(
      request('/api/publish/', undefined, PREVIEW_HOST),
      previewContext,
      { INDEXNOW_KV_NAMESPACE: 'preview-skip' },
      manifest
    );
    expect(previewResponse.status).toBe(202);
    expect(previewContext.waitUntil).not.toHaveBeenCalled();

    const cooldownContext = createContext();
    await handleRequest(
      request('/api/publish/'),
      cooldownContext,
      { INDEXNOW_KV_NAMESPACE: 'cooldown-skip' },
      manifest
    );
    await cooldownContext.waitUntil.mock.calls[0][0];
    expect(cooldownContext.waitUntil).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(10_000);
    await handleRequest(
      request('/api/publish/'),
      cooldownContext,
      { INDEXNOW_KV_NAMESPACE: 'cooldown-skip' },
      manifest
    );
    expect(cooldownContext.waitUntil).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(600_001);
    await handleRequest(
      request('/api/publish/'),
      cooldownContext,
      { INDEXNOW_KV_NAMESPACE: 'cooldown-skip' },
      manifest
    );
    await cooldownContext.waitUntil.mock.calls[1][0];
    expect(cooldownContext.waitUntil).toHaveBeenCalledTimes(2);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('error', { status: 500 }))
        .mockResolvedValueOnce(new Response(null, { status: 202 }))
    );

    const retryContext = createContext();
    await handleRequest(
      request('/api/publish/'),
      retryContext,
      { INDEXNOW_KV_NAMESPACE: 'retry-after-fail' },
      manifest
    );
    await retryContext.waitUntil.mock.calls[0][0];
    expect(errorSpy).toHaveBeenCalledWith('indexnow.publish.failed');

    await handleRequest(
      request('/api/publish/'),
      retryContext,
      { INDEXNOW_KV_NAMESPACE: 'retry-after-fail' },
      manifest
    );
    await retryContext.waitUntil.mock.calls[1][0];
    expect(retryContext.waitUntil).toHaveBeenCalledTimes(2);
  });
});
