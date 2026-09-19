import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDocumentationPage, loadDocumentation } from '../../../../content/documentation';
import { documentationPath } from '../../../../content/documentation-model';
import { DocumentationPage } from '../../../../site/services/documentation-page';
import { LanguageProvider } from '../../../../site/providers/i18n';
import { brandedPageTitle } from '../../../../site/routing/metadata-base';

export const dynamicParams = false;

export function generateStaticParams() {
  return loadDocumentation('zh-CN')
    .filter((page) => page.slug.length > 0)
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocumentationPage('zh-CN', slug);
  if (!page) {
    const title = brandedPageTitle('文档未找到');
    return {
      title: { absolute: title },
      openGraph: { title, siteName: '宏翔商道-Elexvx', type: 'website' },
      twitter: { card: 'summary_large_image', title, images: ['/share/elexvx.png'] },
      robots: { index: false, follow: false },
    };
  }
  const path = documentationPath('zh-CN', slug);
  const title = brandedPageTitle(`${page.title} — Legendary Invention 文档`);
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: `https://www.elexvx.com${path}/` },
    openGraph: {
      title,
      description: page.description,
      url: `https://www.elexvx.com${path}/`,
      siteName: '宏翔商道-Elexvx',
      locale: 'zh_CN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.description,
      images: ['/share/elexvx.png'],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pages = loadDocumentation('zh-CN');
  const page = getDocumentationPage('zh-CN', slug);
  if (!page) notFound();
  return (
    <LanguageProvider locale="zh-CN" path={documentationPath('zh-CN', slug)}>
      <DocumentationPage page={page} pages={pages} locale="zh-CN" />
    </LanguageProvider>
  );
}
