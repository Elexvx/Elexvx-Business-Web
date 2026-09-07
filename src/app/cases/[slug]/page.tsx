import { notFound } from 'next/navigation';
import { publishedCaseStudies } from '../../../data/case-studies';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';

export const dynamicParams = false;

export const generateStaticParams = () => publishedCaseStudies.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/cases/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!publishedCaseStudies.some((item) => item.slug === slug)) notFound();
  return <NextSitePage path={`/cases/${slug}`} />;
}
