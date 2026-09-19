import type { Metadata } from 'next';

import { loadDocumentation, getDocumentationPage } from '../../../content/documentation';
import { DocumentationPage } from '../../../site/services/documentation-page';
import { LanguageProvider } from '../../../site/providers/i18n';
import { brandedPageTitle } from '../../../site/routing/metadata-base';

const pageTitle = brandedPageTitle('Legendary Invention 教程总览');

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: 'Legendary Invention 的开发、架构、部署与运维文档。',
  alternates: { canonical: 'https://www.elexvx.com/services/docs/' },
  openGraph: {
    title: pageTitle,
    description: 'Legendary Invention 的开发、架构、部署与运维文档。',
    url: 'https://www.elexvx.com/services/docs/',
    siteName: '宏翔商道-Elexvx',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: 'Legendary Invention 的开发、架构、部署与运维文档。',
    images: ['/share/elexvx.png'],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const pages = loadDocumentation('zh-CN');
  const page = getDocumentationPage('zh-CN');
  if (!page) throw new Error('Documentation overview is missing');
  return (
    <LanguageProvider locale="zh-CN" path="/services/docs">
      <DocumentationPage page={page} pages={pages} locale="zh-CN" />
    </LanguageProvider>
  );
}
