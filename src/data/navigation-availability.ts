import { serviceRoutePaths } from './service-routes';

export const createLinkAvailability = (routePaths: string[], publishedDirectionSlugs: (string | undefined)[]) => {
  const paths = new Set([...routePaths, ...serviceRoutePaths]);
  const populatedDirections = new Set(publishedDirectionSlugs);
  return (href: string) => {
    if (/^(https?:|mailto:|tel:)/.test(href)) return true;
    const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    if (
      path === '/services/docs' ||
      path.startsWith('/services/docs/') ||
      path === '/en/services/docs' ||
      path.startsWith('/en/services/docs/')
    ) {
      return true;
    }
    if (!paths.has(path)) return false;
    return !path.startsWith('/research/') || populatedDirections.has(path.slice('/research/'.length));
  };
};
