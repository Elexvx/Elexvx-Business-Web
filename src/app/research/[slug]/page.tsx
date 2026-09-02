import { notFound } from 'next/navigation';
import { getDirection, researchDirections } from '../../../data/site';
import { NextSitePage } from '../../NextSitePage';
import { nextMetadata } from '../../next-metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return researchDirections.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/research/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getDirection(slug)) notFound();
  return <NextSitePage path={`/research/${slug}`} />;
}
