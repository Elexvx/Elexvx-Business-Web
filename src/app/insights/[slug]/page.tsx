import { notFound } from 'next/navigation';
import { loadInsights } from '../../../content/loader';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';
import { InsightArticleJsonLd } from '../../../site/seo/insight-article-json-ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return loadInsights()
    .filter((insight) => insight.status === 'published')
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/insights/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = loadInsights().find((item) => item.slug === slug && item.status === 'published');
  if (!insight) notFound();

  return (
    <>
      <InsightArticleJsonLd insight={insight} />
      <NextSitePage path={`/insights/${slug}`} />
    </>
  );
}
