import { notFound } from 'next/navigation';
import { loadInsights } from '../../../content/loader';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  const params = loadInsights()
    .filter((insight) => insight.status === 'published')
    .map(({ slug }) => ({ slug }));

  // Static export requires a parameter even when no articles are published.
  // The fallback reaches notFound() below and does not publish an article.
  return params.length > 0 ? params : [{ slug: '__empty__' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/insights/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insights = loadInsights();
  if (!insights.some((item) => item.slug === slug && item.status === 'published')) notFound();

  return <NextSitePage path={`/insights/${slug}`} insights={insights} />;
}
