import { notFound } from 'next/navigation';
import { homeContent } from '../../../data/page-content';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';
export const dynamicParams = false;
export const generateStaticParams = () => homeContent.product.items.map(({ slug }) => ({ slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/products/${slug}`);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!homeContent.product.items.some((p) => p.slug === slug)) notFound();
  return <NextSitePage path={`/products/${slug}`} />;
}
