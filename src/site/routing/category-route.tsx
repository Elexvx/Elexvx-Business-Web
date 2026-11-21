import { notFound } from 'next/navigation';
import { loadInsights } from '../../content/loader';
import { loadNews } from '../../content/news-loader';
import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from './metadata';
import { getStaticRoutes } from './routes';

export type CategoryPrefix = '/activities/category/' | '/news/category/' | '/research/category/';

export const categoryStaticParams = (prefix: CategoryPrefix) =>
  getStaticRoutes(loadInsights(), loadNews())
    .filter((route) => route.path.startsWith(prefix))
    .map((route) => route.path.slice(prefix.length))
    .filter((slug) => !slug.includes('/'))
    .map((slug) => ({ slug }));

export const categoryMetadata = (prefix: CategoryPrefix, slug: string) => nextMetadata(`${prefix}${slug}`);

export const renderCategoryPage = (prefix: CategoryPrefix, slug: string) => {
  const insights = loadInsights();
  const news = loadNews();
  const path = `${prefix}${slug}`;
  if (!getStaticRoutes(insights, news).some((route) => route.path === path)) notFound();
  return <NextSitePage path={path} insights={insights} news={news} />;
};
