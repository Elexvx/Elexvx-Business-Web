import { notFound } from 'next/navigation';
import { jobs } from '../../../data/jobs';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';
export const dynamicParams = false;
export const generateStaticParams = () => jobs.map(({ id }) => ({ id }));
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return nextMetadata(`/careers/${id}`);
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!jobs.some((job) => job.id === id)) notFound();
  return <NextSitePage path={`/careers/${id}`} />;
}
