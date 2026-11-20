import { categoryMetadata, categoryStaticParams, renderCategoryPage } from '../../../../site/routing/category-route';

export const dynamicParams = false;
const prefix = '/activities/category/' as const;

export function generateStaticParams() {
  return categoryStaticParams(prefix);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return categoryMetadata(prefix, slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderCategoryPage(prefix, slug);
}
