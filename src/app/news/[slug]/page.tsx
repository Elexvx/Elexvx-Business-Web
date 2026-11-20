import { notFound } from 'next/navigation';
import { loadNews } from '../../../content/news-loader';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return loadNews()
    .filter((item) => item.status === 'published')
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/news/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = loadNews();
  if (!news.some((item) => item.slug === slug && item.status === 'published')) notFound();

  return <NextSitePage path={`/news/${slug}`} news={news} />;
}
