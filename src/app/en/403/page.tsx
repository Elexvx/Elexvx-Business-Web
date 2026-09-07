import { english } from '../../../site/translation';
import { ErrorPage } from '../../../site/components/error-page';
import { LanguageProvider } from '../../../site/providers/i18n';

export const metadata = { robots: { index: false, follow: false } };
export default function Page() {
  return (
    <LanguageProvider locale="en" path="/403" autoRedirect={false} translations={english}>
      <ErrorPage code={403} />
    </LanguageProvider>
  );
}
