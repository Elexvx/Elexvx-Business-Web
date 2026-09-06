import { notFound } from 'next/navigation';
import { teamMembers } from '../../../../data/team';
import { NextSitePage } from '../../../../site/NextSitePage';
import { nextMetadata } from '../../../../site/routing/metadata';

export const dynamicParams = false;
export const generateStaticParams = () => teamMembers.map(({ id }) => ({ id }));
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return nextMetadata(`/company/team/${id}`);
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!teamMembers.some((member) => member.id === id)) notFound();
  return <NextSitePage path={`/company/team/${id}`} />;
}
