import { notFound } from 'next/navigation';
import { loadInsights } from '../../../content/loader';
import { loadNews } from '../../../content/news-loader';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';
import { getStaticRoutes, normalizeRoutePath } from '../../../site/routing/routes';

export const dynamicParams = false;

const routePath = (segments?: string[]) => normalizeRoutePath(segments?.length ? `/${segments.join('/')}` : '/');

export function generateStaticParams() {
  return getStaticRoutes(loadInsights(), loadNews()).map((route) => ({
    path: route.path === '/' ? [] : route.path.replace(/^\//, '').split('/'),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return nextMetadata(routePath(path), 'en');
}

export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const resolvedPath = routePath(path);
  if (!getStaticRoutes(loadInsights(), loadNews()).some((route) => route.path === resolvedPath)) notFound();
  return <NextSitePage path={resolvedPath} locale="en" />;
}
