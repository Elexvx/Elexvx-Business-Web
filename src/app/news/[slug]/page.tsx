import { notFound } from 'next/navigation';
import { loadNews } from '../../../content/news-loader';
import { NextSitePage } from '../../NextSitePage';
import { nextMetadata } from '../../next-metadata';

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
  const item = loadNews().find((news) => news.slug === slug && news.status === 'published');
  if (!item) notFound();
  return <NextSitePage path={`/news/${slug}`} />;
}
