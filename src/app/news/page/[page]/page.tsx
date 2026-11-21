import { nextMetadata } from '../../../../site/routing/metadata';
import { newsPageStaticParams, renderNewsPaginationPage } from '../../../../site/routing/news-pagination-route';

export const dynamicParams = false;
export const generateStaticParams = newsPageStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return nextMetadata(`/news/page/${page}`);
}

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return renderNewsPaginationPage(`/news/page/${page}`);
}
