import { notFound } from 'next/navigation';
import { loadInsights } from '../../../../content/loader';
import { loadNews } from '../../../../content/news-loader';
import { NextSitePage } from '../../../../site/NextSitePage';
import { nextMetadata } from '../../../../site/routing/metadata';
import { getStaticRoutes } from '../../../../site/routing/routes';

export const dynamicParams = false;
const prefix = '/research/category/';
const categories = () => getStaticRoutes(loadInsights(), loadNews()).filter((route) => route.path.startsWith(prefix));

export function generateStaticParams() {
  return categories().map((route) => ({ slug: route.path.slice(prefix.length) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`${prefix}${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = `${prefix}${slug}`;
  if (!categories().some((route) => route.path === path)) notFound();
  return <NextSitePage path={path} />;
}
