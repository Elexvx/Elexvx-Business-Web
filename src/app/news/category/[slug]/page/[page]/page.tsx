import { nextMetadata } from '../../../../../../site/routing/metadata';
import {
  newsCategoryPageStaticParams,
  renderNewsPaginationPage,
} from '../../../../../../site/routing/news-pagination-route';

export const dynamicParams = false;
export const generateStaticParams = newsCategoryPageStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  return nextMetadata(`/news/category/${slug}/page/${page}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  return renderNewsPaginationPage(`/news/category/${slug}/page/${page}`);
}
