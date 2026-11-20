import { serviceRoutePaths } from './service-routes';

export const createLinkAvailability = (routePaths: string[]) => {
  const paths = new Set([...routePaths, ...serviceRoutePaths]);
  return (href: string) => {
    if (/^(https?:|mailto:|tel:)/.test(href)) return true;
    const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    return paths.has(path);
  };
};
