import redirects from './redirects.json';
import { fetchStatusData } from '../status/uptime-robot';
import { submitIndexNowUrls } from '../indexnow';

export type EsaEnvironment = {
  UPTIMEROBOT_API_KEY?: string;
  CRON_SECRET?: string;
  INDEXNOW_KV_NAMESPACE?: string;
};

type EdgeStore = {
  get(key: string, options: { type: 'text' }): Promise<string | undefined>;
  put(key: string, value: string): Promise<void>;
};

declare const EdgeKV: new (options: { namespace: string }) => EdgeStore;

type ExecutionContext = { waitUntil(task: Promise<unknown>): void };
type PublishManifest = { version: string; urls: string[] };

const staticOrigin = 'https://assets.elexvx.com';
const canonicalOrigin = 'https://www.elexvx.com';
const previewHost = 'esa-migration-preview.elexvx.com';
const checkedAtByNamespace = new Map<string, number>();

const json = (payload: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Elexvx-Hosting': 'ESA',
      ...extra,
    },
  });

export function resolveRedirect(url: URL): string | undefined {
  if (url.hostname === 'elexvx.com' || url.hostname === 'ai.elexvx.com') {
    return canonicalOrigin + url.pathname + url.search;
  }
  if (!['www.elexvx.com', 'nav.elexvx.com', 'status.elexvx.com', previewHost].includes(url.hostname)) {
    return canonicalOrigin + url.pathname + url.search;
  }
  for (const redirect of redirects) {
    if (redirect.source !== url.pathname) continue;
    if (
      redirect.has?.some((condition) =>
        condition.type === 'host'
          ? condition.value !== url.hostname
          : condition.type === 'query'
            ? !('key' in condition) || url.searchParams.get(String(condition.key)) !== condition.value
            : true
      )
    )
      continue;
    const destination = new URL(redirect.destination, url);
    destination.search = url.search;
    if (redirect.has?.some((condition) => condition.type === 'query')) destination.searchParams.delete('category');
    if (!destination.pathname.endsWith('/') && !/\.[^/]+$/.test(destination.pathname)) destination.pathname += '/';
    return destination.href;
  }
  // Exported legacy fallback paths also accept the canonical trailing slash.
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    const withoutSlash = new URL(url);
    withoutSlash.pathname = url.pathname.slice(0, -1);
    return resolveRedirect(withoutSlash);
  }
  return undefined;
}

export async function notifyPublishedContent(namespace: string): Promise<void> {
  const store = new EdgeKV({ namespace });
  const response = await fetch(`${staticOrigin}/indexnow-manifest.json`, { redirect: 'manual' });
  if (!response.ok) throw new Error(`Publish manifest unavailable (${response.status}).`);
  const manifest = (await response.json()) as PublishManifest;
  if (!/^[a-f\d]{64}$/.test(manifest.version) || !Array.isArray(manifest.urls) || manifest.urls.length > 10000) {
    throw new Error('Invalid publish manifest.');
  }
  const key = `indexnow:${manifest.version}`;
  if (await store.get(key, { type: 'text' })) return;
  const result = await submitIndexNowUrls(manifest.urls);
  await store.put(key, JSON.stringify({ status: result.status, submitted: result.urls.length, at: Date.now() }));
}

async function handleApi(request: Request, url: URL, env: EsaEnvironment): Promise<Response> {
  const path = url.pathname.replace(/\/$/, '');
  if (path === '/api/status') {
    if (request.method !== 'GET') return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'GET' });
    if (!env.UPTIMEROBOT_API_KEY) return json({ code: 503, message: '监控服务尚未配置', source: 'api' }, 503);
    try {
      const started = Date.now();
      const result = await fetchStatusData({
        apiKey: env.UPTIMEROBOT_API_KEY,
        historyDays: url.searchParams.get('days') === '14' ? 14 : 60,
        timeoutMs: 8000,
        deduplicateRequests: false,
      });
      return json({ code: 200, message: 'success', source: result.source, data: result.data }, 200, {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=300',
        'Server-Timing': `uptime-robot;dur=${Date.now() - started}`,
      });
    } catch {
      return json({ code: 502, message: '监控服务请求失败，请稍后重试', source: 'api' }, 502);
    }
  }
  if (path === '/api/indexnow') {
    if (request.method !== 'GET') return json({ ok: false, message: 'Method not allowed' }, 405, { Allow: 'GET' });
    if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) {
      return json({ ok: false, message: 'Unauthorized' }, 401);
    }
    try {
      if (!env.INDEXNOW_KV_NAMESPACE)
        return json({ ok: false, message: 'Publish notification storage not configured.' }, 503);
      await notifyPublishedContent(env.INDEXNOW_KV_NAMESPACE);
      return json({ ok: true, message: 'Published URLs notified; receipt does not guarantee indexing.' });
    } catch {
      return json({ ok: false, message: 'IndexNow submission failed; the next visit will retry.' }, 502);
    }
  }
  if (path === '/api/login' || path === '/api/logout') {
    if (request.method !== 'POST') return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'POST' });
    return json(
      { code: 200, message: '当前未启用密码保护' },
      200,
      path === '/api/logout' ? { 'Set-Cookie': 'authToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict' } : {}
    );
  }
  return json({ code: 404, message: 'Not found' }, 404);
}

export async function handleRequest(
  request: Request,
  context: ExecutionContext,
  env: EsaEnvironment
): Promise<Response> {
  const url = new URL(request.url);
  const destination = resolveRedirect(url);
  if (destination)
    return new Response(null, { status: 308, headers: { Location: destination, 'X-Elexvx-Hosting': 'ESA' } });
  if (url.pathname.startsWith('/api/')) return handleApi(request, url, env);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'GET, HEAD' });
  }
  const upstream = new URL(staticOrigin);
  upstream.pathname = url.pathname;
  upstream.search = url.search;
  const requestHeaders = new Headers({ 'Accept-Encoding': 'gzip' });
  for (const name of ['accept', 'range', 'if-none-match', 'if-modified-since']) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }
  const response = await fetch(upstream.href, { method: request.method, headers: requestHeaders, redirect: 'manual' });
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.set('X-Elexvx-Hosting', 'ESA');
  const location = headers.get('location');
  if (location) {
    const redirected = new URL(location, upstream);
    if (redirected.origin === staticOrigin)
      headers.set('Location', url.origin + redirected.pathname + redirected.search);
  }
  if (response.status === 200 && headers.get('content-type')?.includes('text/html')) {
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    const namespace = env.INDEXNOW_KV_NAMESPACE;
    if (
      url.hostname !== previewHost &&
      request.method === 'GET' &&
      namespace &&
      Date.now() - (checkedAtByNamespace.get(namespace) ?? 0) > 600000
    ) {
      checkedAtByNamespace.set(namespace, Date.now());
      context.waitUntil(
        notifyPublishedContent(namespace).catch(() => {
          checkedAtByNamespace.delete(namespace);
          console.log('indexnow.publish.failed');
        })
      );
    }
  }
  return new Response(request.method === 'HEAD' || [204, 304].includes(response.status) ? null : response.body, {
    status: response.status,
    headers,
  });
}

export default { fetch: handleRequest };
