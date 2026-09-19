import { getDocumentationPage, loadDocumentation } from '../../../../content/documentation';
import { DocumentationPage } from '../../../../site/services/documentation-page';
import { LanguageProvider } from '../../../../site/providers/i18n';
import { metadataForRoute } from '../../../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: 'Legendary Invention Documentation — Official Guide',
    description: 'Development, architecture, deployment, and operations documentation for Legendary Invention.',
  },
  '/services/docs',
  'en'
);

export default function Page() {
  const pages = loadDocumentation('en');
  const page = getDocumentationPage('en');
  if (!page) throw new Error('Documentation overview is missing');
  return (
    <LanguageProvider locale="en" path="/services/docs">
      <DocumentationPage page={page} pages={pages} locale="en" />
    </LanguageProvider>
  );
}
