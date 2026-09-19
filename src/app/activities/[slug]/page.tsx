import { notFound } from 'next/navigation';
import { publishedActivities } from '../../../data/activities';
import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';
export const dynamicParams = false;
// Static export requires one parameter even before the first activity is published.
// The placeholder renders notFound and is never added to navigation or sitemap.
export const generateStaticParams = () => {
  const internalActivities = publishedActivities.filter((item) => !item.externalUrl);
  return internalActivities.length ? internalActivities.map(({ slug }) => ({ slug })) : [{ slug: '_empty' }];
};
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return nextMetadata(`/activities/${slug}`);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!publishedActivities.some((item) => item.slug === slug && !item.externalUrl)) notFound();
  return <NextSitePage path={`/activities/${slug}`} />;
}
