import redirects from './redirects.json';
import { isHumiteProductPath } from '../../data/humite-launch.mjs';
import { ALLOWED_PUBLIC_HOSTS, CANONICAL_ORIGIN, PREVIEW_HOST } from '../../data/site-origins';
import { handleStatusApi } from '../status/status-api';
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
export type PublishManifest = { version: string; urls: string[] };

const MAX_PUBLISH_MANIFEST_URLS = 10_000;
const PUBLISH_CHECK_COOLDOWN_MS = 600_000;
const ESA_HOSTING_HEADER = 'ESA';
const checkedAtByNamespace = new Map<string, number>();

const json = (payload: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Elexvx-Hosting': ESA_HOSTING_HEADER,
      ...extra,
    },
  });

const createRedirectResponse = (location: string) =>
  new Response(null, { status: 308, headers: { Location: location, 'X-Elexvx-Hosting': ESA_HOSTING_HEADER } });

const createNotFoundResponse = (body: string | null) =>
  new Response(body, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'X-Elexvx-Hosting': ESA_HOSTING_HEADER,
    },
  });

type RedirectRule = (typeof redirects)[number];
type RedirectCondition = NonNullable<RedirectRule['has']>[number];

const matchesRedirectCondition = (condition: RedirectCondition, url: URL): boolean => {
  if (condition.type === 'host') return condition.value === url.hostname;
  if (condition.type === 'query') {
    return 'key' in condition && url.searchParams.get(String(condition.key)) === condition.value;
  }
  return false;
};

const matchesRedirectRule = (rule: RedirectRule, url: URL): boolean =>
  rule.source === url.pathname &&
  (!rule.has || rule.has.every((condition) => matchesRedirectCondition(condition, url)));

const matchRedirectDestination = (url: URL): string | undefined => {
  for (const redirect of redirects) {
    if (!matchesRedirectRule(redirect, url)) continue;
    if (process.env.NEXT_PUBLIC_HUMITE_PUBLISHED !== 'true' && isHumiteProductPath(redirect.destination)) {
      continue;
    }
    const destination = new URL(redirect.destination, url);
    destination.search = url.search;
    for (const condition of redirect.has ?? []) {
      if (condition.type === 'query' && 'key' in condition && condition.key) {
        destination.searchParams.delete(String(condition.key));
      }
    }
    if (!destination.pathname.endsWith('/') && !/\.[^/]+$/.test(destination.pathname)) destination.pathname += '/';
    return destination.href;
  }
  return undefined;
};

export function resolveRedirect(url: URL): string | undefined {
  if (!(ALLOWED_PUBLIC_HOSTS as readonly string[]).includes(url.hostname)) {
    return CANONICAL_ORIGIN + url.pathname + url.search;
  }
  const directDestination = matchRedirectDestination(url);
  if (directDestination) return directDestination;
  // Exported legacy fallback paths also accept the canonical trailing slash.
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    const withoutSlash = new URL(url);
    withoutSlash.pathname = url.pathname.slice(0, -1);
    return matchRedirectDestination(withoutSlash);
  }
  return undefined;
}

export async function notifyPublishedContent(namespace: string, manifest: PublishManifest): Promise<void> {
  const store = new EdgeKV({ namespace });
  if (
    !/^[a-f\d]{64}$/.test(manifest.version) ||
    !Array.isArray(manifest.urls) ||
    manifest.urls.length > MAX_PUBLISH_MANIFEST_URLS
  ) {
    throw new Error('Invalid publish manifest.');
  }
  const key = `indexnow:${manifest.version}`;
  if (await store.get(key, { type: 'text' })) return;
  const result = await submitIndexNowUrls(manifest.urls, false);
  await store.put(key, JSON.stringify({ status: result.status, submitted: result.urls.length, at: Date.now() }));
}

async function handleIndexNowApi(request: Request, env: EsaEnvironment, manifest?: PublishManifest): Promise<Response> {
  if (request.method !== 'GET') return json({ ok: false, message: 'Method not allowed' }, 405, { Allow: 'GET' });
  if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return json({ ok: false, message: 'Unauthorized' }, 401);
  }
  try {
    if (!env.INDEXNOW_KV_NAMESPACE || !manifest)
      return json({ ok: false, message: 'Publish notification storage not configured.' }, 503);
    await notifyPublishedContent(env.INDEXNOW_KV_NAMESPACE, manifest);
    return json({ ok: true, message: 'Published URLs notified; receipt does not guarantee indexing.' });
  } catch (error) {
    console.error('indexnow.notify.failed', error instanceof Error ? error.message : String(error));
    return json({ ok: false, message: 'IndexNow submission failed; the next visit will retry.' }, 502);
  }
}

function handleAuthApi(request: Request, path: string): Response {
  if (request.method !== 'POST') return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'POST' });
  return json(
    { code: 200, message: '当前未启用密码保护' },
    200,
    path === '/api/logout' ? { 'Set-Cookie': 'authToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict' } : {}
  );
}

async function handleApi(
  request: Request,
  url: URL,
  env: EsaEnvironment,
  manifest?: PublishManifest
): Promise<Response> {
  const path = url.pathname.replace(/\/$/, '');
  if (path === '/api/status') return handleStatusApi(request, url, env.UPTIMEROBOT_API_KEY);
  if (path === '/api/indexnow') return handleIndexNowApi(request, env, manifest);
  if (path === '/api/login' || path === '/api/logout') return handleAuthApi(request, path);
  return json({ code: 404, message: 'Not found' }, 404);
}

function handlePublishTrigger(
  request: Request,
  url: URL,
  context: ExecutionContext,
  env: EsaEnvironment,
  manifest?: PublishManifest
): Response {
  if (request.method !== 'GET') return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'GET' });
  const namespace = env.INDEXNOW_KV_NAMESPACE;
  if (!namespace || !manifest) return json({ code: 503, message: 'Publish manifest unavailable' }, 503);
  if (
    url.hostname !== PREVIEW_HOST &&
    Date.now() - (checkedAtByNamespace.get(namespace) ?? 0) > PUBLISH_CHECK_COOLDOWN_MS
  ) {
    checkedAtByNamespace.set(namespace, Date.now());
    context.waitUntil(
      notifyPublishedContent(namespace, manifest).catch(() => {
        checkedAtByNamespace.delete(namespace);
        console.error('indexnow.publish.failed');
      })
    );
  }
  return json({ ok: true, message: 'Published URLs queued; this does not guarantee indexing.' }, 202);
}

// A category route also receives unknown categories: canonicalize these to the
// unfiltered list instead of returning a missing page.
function canonicalizeCategoryQuery(url: URL): Response | undefined {
  if (!/^\/(?:en\/)?(?:news|research|activities)\/?$/.test(url.pathname) || !url.searchParams.has('category')) {
    return undefined;
  }
  url.searchParams.delete('category');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return createRedirectResponse(url.href);
}

export async function handleRequest(
  request: Request,
  context: ExecutionContext,
  env: EsaEnvironment,
  manifest?: PublishManifest,
  notFoundHtml = 'Not found',
  englishNotFoundHtml = notFoundHtml
): Promise<Response> {
  const url = new URL(request.url);
  const destination = resolveRedirect(url);
  if (destination) return createRedirectResponse(destination);
  if (url.pathname.replace(/\/$/, '') === '/api/publish') {
    return handlePublishTrigger(request, url, context, env, manifest);
  }
  if (url.pathname.startsWith('/api/')) return handleApi(request, url, env, manifest);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'GET, HEAD' });
  }
  const canonicalCategoryResponse = canonicalizeCategoryQuery(url);
  if (canonicalCategoryResponse) return canonicalCategoryResponse;
  // ESA serves every existing file itself. Only unmatched paths reach this code.
  const fallback = /^\/en(?:\/|$)/.test(url.pathname) ? englishNotFoundHtml : notFoundHtml;
  return createNotFoundResponse(request.method === 'HEAD' ? null : fallback);
}

export default { fetch: handleRequest };
