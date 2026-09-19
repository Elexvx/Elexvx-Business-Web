import { notFound } from 'next/navigation';

import { getDocumentationPage, loadDocumentation } from '../../../../../content/documentation';
import { documentationPath } from '../../../../../content/documentation-model';
import { DocumentationPage } from '../../../../../site/services/documentation-page';
import { LanguageProvider } from '../../../../../site/providers/i18n';
import { metadataForRoute } from '../../../../../site/routing/metadata-base';

export const dynamicParams = false;

export function generateStaticParams() {
  return loadDocumentation('en')
    .filter((page) => page.slug.length > 0)
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getDocumentationPage('en', slug);
  if (!page)
    return metadataForRoute(
      { title: 'Documentation not found', description: 'There is no documentation at this path.' },
      '/services/docs',
      'en'
    );
  return metadataForRoute(
    {
      title: `${page.title} — Legendary Invention Documentation`,
      description: page.description,
      openGraphType: 'article',
    },
    `/services/docs/${slug.join('/')}`,
    'en'
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pages = loadDocumentation('en');
  const page = getDocumentationPage('en', slug);
  if (!page) notFound();
  return (
    <LanguageProvider locale="en" path={documentationPath('zh-CN', slug)}>
      <DocumentationPage page={page} pages={pages} locale="en" />
    </LanguageProvider>
  );
}
