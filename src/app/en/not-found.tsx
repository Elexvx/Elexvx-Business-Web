import { ErrorPage } from '../../site/components/error-page';
import { EnglishLanguageProvider } from '../../site/providers/english-i18n';

export default function NotFound() {
  return (
    <EnglishLanguageProvider path="/404">
      <ErrorPage code={404} locale="en" />
    </EnglishLanguageProvider>
  );
}
