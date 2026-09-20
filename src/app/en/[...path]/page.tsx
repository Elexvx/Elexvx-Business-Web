import { notFound } from 'next/navigation';
import { loadInsights } from '../../../content/loader';
import { loadNews } from '../../../content/news-loader';
import { nextMetadata } from '../../../site/routing/metadata';
import { getStaticRoutes, normalizeRoutePath } from '../../../site/routing/routes';
import { InsightArticleJsonLd } from '../../../site/seo/insight-article-json-ld';
import { NewsArticleJsonLd } from '../../../site/seo/news-article-json-ld';

export const dynamicParams = false;

const routePath = (segments?: string[]) => normalizeRoutePath(segments?.length ? `/${segments.join('/')}` : '/');

export function generateStaticParams() {
  return getStaticRoutes(loadInsights(), loadNews())
    .filter((route) => route.path !== '/')
    .map((route) => ({ path: route.path.replace(/^\//, '').split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return nextMetadata(routePath(path), 'en');
}

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const resolvedPath = routePath(path);
  if (!getStaticRoutes(loadInsights(), loadNews()).some((route) => route.path === resolvedPath)) notFound();

  const { NextSitePage } = await import('../../../site/NextSitePage');
  const newsItem = resolvedPath.startsWith('/news/')
    ? loadNews().find((item) => item.slug === resolvedPath.slice('/news/'.length) && item.status === 'published')
    : undefined;
  const insight = resolvedPath.startsWith('/insights/')
    ? loadInsights().find(
        (item) => item.slug === resolvedPath.slice('/insights/'.length) && item.status === 'published'
      )
    : undefined;
  return (
    <>
      {newsItem ? <NewsArticleJsonLd item={newsItem} locale="en" /> : null}
      {insight ? <InsightArticleJsonLd insight={insight} locale="en" /> : null}
      <NextSitePage path={resolvedPath} locale="en" />
    </>
  );
}
