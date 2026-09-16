import { ErrorPage } from '../../../site/components/error-page';
import { EnglishLanguageProvider } from '../../../site/providers/english-i18n';

export const metadata = { robots: { index: false, follow: false } };
export default function Page() {
  return (
    <EnglishLanguageProvider path="/403">
      <ErrorPage code={403} />
    </EnglishLanguageProvider>
  );
}
