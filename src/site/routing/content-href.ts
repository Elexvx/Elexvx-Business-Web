import { siteIdentity } from '../../data/site';

const contentPath = /^\/(?:en\/)?(?:(?:research|news|activities)(?:\/(?:category\/)?[^/.]+)?|insights\/[^/.]+)\/?$/;

/** Match content links to the trailing-slash URLs published in canonical metadata and the sitemap. */
export const canonicalContentHref = (value: string) => {
  const origin = value.startsWith(`${siteIdentity.canonicalOrigin}/`) ? siteIdentity.canonicalOrigin : '';
  const relative = value.slice(origin.length);
  const pathname = relative.split(/[?#]/, 1)[0];
  return contentPath.test(pathname)
    ? `${origin}${pathname.replace(/\/?$/, '/')}${relative.slice(pathname.length)}`
    : value;
};
