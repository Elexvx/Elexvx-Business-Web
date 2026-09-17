import { ErrorPage } from '../../../site/components/error-page';
import { EnglishLanguageProvider } from '../../../site/providers/english-i18n';
import { metadataForRoute } from '../../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: 'Access is restricted',
    description: 'This page is not available to you. Contact us if you need access to this information.',
    robots: 'noindex,nofollow',
  },
  '/403',
  'en'
);
export default function Page() {
  return (
    <EnglishLanguageProvider path="/403">
      <ErrorPage code={403} />
    </EnglishLanguageProvider>
  );
}
