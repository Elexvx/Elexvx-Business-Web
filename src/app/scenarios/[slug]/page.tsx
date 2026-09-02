import { notFound } from 'next/navigation';
import { getScenario, scenarios } from '../../../data/site';
import { NextSitePage } from '../../NextSitePage';
import { nextMetadata } from '../../next-metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return scenarios.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/scenarios/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getScenario(slug)) notFound();
  return <NextSitePage path={`/scenarios/${slug}`} />;
}
