const host = 'www.elexvx.com';
const origin = `https://${host}`;
const keyFile = 'f84f594ae29eba5b114a6fe74823cadb422fecf00fdb530ed6c4c6ffaaa3aef4.txt';
const key = keyFile.slice(0, -4);
const keyLocation = `${origin}/${keyFile}`;
const contentPath = /^\/(?:en\/)?(?:(?:activities|news|research)(?:\/(?:category\/)?[^/]+)?|insights\/[^/]+)\/?$/;

export type IndexNowSubmission = {
  status: number;
  urls: string[];
};

const decodeXml = (value: string) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");

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

const verifyPublishedKey = async () => {
  const response = await fetch(keyLocation, { cache: 'no-store' });
  if (!response.ok || (await response.text()).trim() !== key) {
    throw new Error(`Production IndexNow key verification failed (HTTP ${response.status}).`);
  }
};

const postIndexNow = async (urls: string[]): Promise<IndexNowSubmission> => {
  const uniqueUrls = validateUrls(urls);
  if (uniqueUrls.length === 0) return { status: 204, urls: [] };

  await verifyPublishedKey();
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

export const submitIndexNowUrls = async (urls: string[]) => postIndexNow(urls);

export const selectIndexNowUrls = (
  xml: string,
  options: { lookbackDays?: number; includeAll?: boolean; now?: number } = {}
) => {
  const lookbackDays = options.lookbackDays ?? 3;
  if (!Number.isFinite(lookbackDays) || lookbackDays < 1) {
    throw new Error('IndexNow lookbackDays must be a positive number.');
  }

  if (!/<urlset\b/i.test(xml)) throw new Error('Production sitemap is not a URL sitemap.');
  const cutoff = (options.now ?? Date.now()) - lookbackDays * 24 * 60 * 60 * 1000;
  const entries = [...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)];
  const urls = entries.flatMap(([, entry]) => {
    const location = entry.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1];
    const lastmod = entry.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1];
    if (!location) return [];

    let url: URL;
    try {
      url = new URL(decodeXml(location.trim()));
    } catch {
      return [];
    }
    if (url.protocol !== 'https:' || url.host !== host || url.search || url.hash || !contentPath.test(url.pathname))
      return [];
    const lastModifiedAt = lastmod ? Date.parse(decodeXml(lastmod.trim())) : Number.NaN;
    if (!options.includeAll && (!Number.isFinite(lastModifiedAt) || lastModifiedAt < cutoff)) return [];
    return [url.href];
  });

  return [...new Set(urls)];
};

export const submitRecentIndexNowPages = async (options: { lookbackDays?: number; includeAll?: boolean } = {}) => {
  const sitemapUrl = new URL('/sitemap.xml', origin);
  sitemapUrl.searchParams.set('_indexnow', String(Date.now()));
  const sitemapResponse = await fetch(sitemapUrl, { cache: 'no-store' });
  if (!sitemapResponse.ok) throw new Error(`Production sitemap check failed (HTTP ${sitemapResponse.status}).`);
  return postIndexNow(selectIndexNowUrls(await sitemapResponse.text(), options));
};
