import { serviceNavigationConfig } from '../../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../../data/site-origins';
import { SiteShell } from '../../../site/components/shell';
import { EnglishLanguageProvider } from '../../../site/providers/english-i18n';
import { serviceMetadata } from '../../../site/routing/metadata-base';
import { StatusPage } from '../../../site/services/status-page';
import { translateEnglish } from '../../../site/translation';

export const metadata = serviceMetadata({
  title: translateEnglish('服务状态'),
  description: translateEnglish(serviceNavigationConfig.status.description),
  path: '/status/',
  locale: 'en',
});

export default function Page() {
  return (
    <EnglishLanguageProvider path="/status">
      <SiteShell
        activePath="/status"
        className="service-site-shell status-performance-shell"
        linkOrigin={CANONICAL_ORIGIN}
      >
        <StatusPage />
      </SiteShell>
    </EnglishLanguageProvider>
  );
}
