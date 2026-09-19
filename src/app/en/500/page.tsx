import { ErrorPage } from '../../../site/components/error-page';
import { LanguageProvider } from '../../../site/providers/i18n';
import { metadataForRoute } from '../../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: 'Something went wrong',
    description: 'Please try again shortly or return home. If the problem persists, contact us.',
    robots: 'noindex,nofollow',
  },
  '/500',
  'en'
);
export default function Page() {
  return (
    <LanguageProvider locale="en" path="/500">
      <ErrorPage code={500} />
    </LanguageProvider>
  );
}
