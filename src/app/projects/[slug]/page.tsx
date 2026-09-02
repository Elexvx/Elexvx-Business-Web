import { notFound } from 'next/navigation';
import { getProject, projects } from '../../../data/site';
import { NextSitePage } from '../../NextSitePage';
import { nextMetadata } from '../../next-metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/projects/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return <NextSitePage path={`/projects/${slug}`} />;
}
