import { notFound } from 'next/navigation';
import { businessLines } from '../../../data/site';
import { NextSitePage } from '../../NextSitePage';
import { nextMetadata } from '../../next-metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return businessLines.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/business/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!businessLines.some((line) => line.slug === slug)) notFound();
  return <NextSitePage path={`/business/${slug}`} />;
}
