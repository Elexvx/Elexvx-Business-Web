import { decodeXmlEntities } from '../content/html-entities.mjs';
import { CANONICAL_HOST, CANONICAL_ORIGIN, INDEXNOW_KEY, INDEXNOW_KEY_FILE } from '../data/site-origins';

export { INDEXNOW_KEY };

const host = CANONICAL_HOST;
const origin = CANONICAL_ORIGIN;
const key = INDEXNOW_KEY;
const keyLocation = `${origin}/${INDEXNOW_KEY_FILE}`;
const contentPath = /^\/(?:en\/)?(?:(?:activities|news|research)(?:\/(?:category\/)?[^/]+)?|insights\/[^/]+)\/?$/;
const DEFAULT_LOOKBACK_DAYS = 3;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type IndexNowSubmission = {
  status: number;
  urls: string[];
};

const validateUrls = (urls: string[]) => {
  const uniqueUrls = [...new Set(urls)];
  for (const value of uniqueUrls) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.host !== host) {
      throw new Error(`IndexNow URLs must use https://${host}: ${value}`);
    }
  }
  return uniqueUrls;
};

const verifyPublishedKey = async (verificationUrl = keyLocation) => {
  const response = await fetch(verificationUrl, { cache: 'no-store' });
  if (!response.ok || (await response.text()).trim() !== key) {
    throw new Error(`Production IndexNow key verification failed (HTTP ${response.status}).`);
  }
};

const postIndexNow = async (
  urls: string[],
  verificationUrl: string | false = keyLocation
): Promise<IndexNowSubmission> => {
  const uniqueUrls = validateUrls(urls);
  if (uniqueUrls.length === 0) return { status: 204, urls: [] };

  if (verificationUrl !== false) await verifyPublishedKey(verificationUrl);
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: uniqueUrls }),
  });
  const details = (await response.text()).trim();
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the submission (${response.status}): ${details || response.statusText}`);
  }

  return { status: response.status, urls: uniqueUrls };
};

export const submitIndexNowUrls = async (urls: string[], verificationUrl?: string | false) =>
  postIndexNow(urls, verificationUrl);

const parseSitemapEntryUrl = (entry: string, cutoff: number, includeAll: boolean): string | undefined => {
  const location = entry.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1];
  if (!location) return undefined;

  let url: URL;
  try {
    url = new URL(decodeXmlEntities(location.trim()));
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:' || url.host !== host || url.search || url.hash || !contentPath.test(url.pathname)) {
    return undefined;
  }
  const lastmod = entry.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1];
  const lastModifiedAt = lastmod ? Date.parse(decodeXmlEntities(lastmod.trim())) : Number.NaN;
  if (!includeAll && (!Number.isFinite(lastModifiedAt) || lastModifiedAt < cutoff)) return undefined;
  return url.href;
};

export const selectIndexNowUrls = (
  xml: string,
  options: { lookbackDays?: number; includeAll?: boolean; now?: number } = {}
) => {
  const lookbackDays = options.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;
  if (!Number.isFinite(lookbackDays) || lookbackDays < 1) {
    throw new Error('IndexNow lookbackDays must be a positive number.');
  }

  if (!/<urlset\b/i.test(xml)) throw new Error('Production sitemap is not a URL sitemap.');
  const cutoff = (options.now ?? Date.now()) - lookbackDays * MILLISECONDS_PER_DAY;
  const includeAll = Boolean(options.includeAll);
  const urls = [...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)]
    .map(([, entry]) => parseSitemapEntryUrl(entry, cutoff, includeAll))
    .filter((value): value is string => value !== undefined);

  return [...new Set(urls)];
};

export const submitRecentIndexNowPages = async (options: { lookbackDays?: number; includeAll?: boolean } = {}) => {
  const sitemapUrl = new URL('/sitemap.xml', origin);
  sitemapUrl.searchParams.set('_indexnow', String(Date.now()));
  const sitemapResponse = await fetch(sitemapUrl, { cache: 'no-store' });
  if (!sitemapResponse.ok) throw new Error(`Production sitemap check failed (HTTP ${sitemapResponse.status}).`);
  return postIndexNow(selectIndexNowUrls(await sitemapResponse.text(), options));
};
