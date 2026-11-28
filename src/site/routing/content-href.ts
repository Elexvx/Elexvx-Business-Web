import { siteIdentity } from '../../data/site';

/** Match internal page routes (excluding API endpoints and static asset files) to trailing-slash canonical URLs. */
export const canonicalContentHref = (value: string) => {
  const origin = value.startsWith(`${siteIdentity.canonicalOrigin}/`) ? siteIdentity.canonicalOrigin : '';
  const relative = value.slice(origin.length);
  if (!relative.startsWith('/') || relative.startsWith('//')) return value;
  const pathname = relative.split(/[?#]/, 1)[0];
  if (pathname === '/' || pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(pathname)) return value;
  return `${origin}${pathname.replace(/\/?$/, '/')}${relative.slice(pathname.length)}`;
};

/** Resolves an internal localized path against an optional alternate host origin. */
export const resolveOriginHref = (localizedHref: string, linkOrigin?: string): string =>
  linkOrigin && localizedHref.startsWith('/') ? new URL(localizedHref, linkOrigin).href : localizedHref;
