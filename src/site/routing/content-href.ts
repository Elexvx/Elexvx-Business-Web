import { siteIdentity } from '../../data/site';

const contentPath =
  /^\/(?:en\/)?(?:(?:research|news|activities)(?:\/(?:category\/)?[^/.]+)?|insights\/[^/.]+|news\/(?:category\/[^/.]+\/)?page\/\d+|sitemap)\/?$/;

/** Match content links to the trailing-slash URLs published in canonical metadata and the sitemap. */
export const canonicalContentHref = (value: string) => {
  const origin = value.startsWith(`${siteIdentity.canonicalOrigin}/`) ? siteIdentity.canonicalOrigin : '';
  const relative = value.slice(origin.length);
  const pathname = relative.split(/[?#]/, 1)[0];
  return contentPath.test(pathname)
    ? `${origin}${pathname.replace(/\/?$/, '/')}${relative.slice(pathname.length)}`
    : value;
};

/** Resolves an internal localized path against an optional alternate host origin. */
export const resolveOriginHref = (localizedHref: string, linkOrigin?: string): string =>
  linkOrigin && localizedHref.startsWith('/') ? new URL(localizedHref, linkOrigin).href : localizedHref;
