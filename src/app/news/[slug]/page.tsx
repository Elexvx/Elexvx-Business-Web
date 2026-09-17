import { notFound } from 'next/navigation';
import { loadNews } from '../../../content/news-loader';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';
import { NewsArticleJsonLd } from '../../../site/seo/news-article-json-ld';

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

  return (
    <>
      <NewsArticleJsonLd item={item} />
      <NextSitePage path={`/news/${slug}`} />
    </>
  );
}
