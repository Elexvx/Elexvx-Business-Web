import { publishedResearch } from '../../../data/research-articles';
import { notFound } from 'next/navigation';
import { getDirection, researchDirections } from '../../../data/site';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return [...researchDirections, ...publishedResearch].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/research/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getDirection(slug) && !publishedResearch.some((item) => item.slug === slug)) notFound();
  return <NextSitePage path={`/research/${slug}`} />;
}
