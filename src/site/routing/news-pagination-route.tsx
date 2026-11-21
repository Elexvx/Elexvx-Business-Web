import { notFound } from 'next/navigation';
import { loadInsights } from '../../content/loader';
import { loadNews } from '../../content/news-loader';
import { NextSitePage } from '../NextSitePage';
import { getStaticRoutes } from './routes';

const newsRoutes = () => getStaticRoutes(loadInsights(), loadNews());

export const newsPageStaticParams = () => {
  const params = newsRoutes().flatMap(({ path }) => {
    const match = /^\/news\/page\/(\d+)$/.exec(path);
    return match ? [{ page: match[1] }] : [];
  });
  // Next's static export requires a parameter even when the collection fits on one page.
  return params.length ? params : [{ page: '__empty__' }];
};

export const newsCategoryPageStaticParams = () => {
  const params = newsRoutes().flatMap(({ path }) => {
    const match = /^\/news\/category\/([^/]+)\/page\/(\d+)$/.exec(path);
    return match ? [{ slug: match[1], page: match[2] }] : [];
  });
  return params.length ? params : [{ slug: '__empty__', page: '__empty__' }];
};

export const renderNewsPaginationPage = (path: string) => {
  if (!newsRoutes().some((route) => route.path === path)) notFound();
  return <NextSitePage path={path} />;
};
