import { serviceNavigationConfig } from '../../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../../data/site-origins';
import { SiteShell } from '../../../site/components/shell';
import { EnglishLanguageProvider } from '../../../site/providers/english-i18n';
import { serviceMetadata } from '../../../site/routing/metadata-base';
import { NavigationPage } from '../../../site/services/navigation-page';
import { translateEnglish } from '../../../site/translation';

export const metadata = serviceMetadata({
  title: translateEnglish(serviceNavigationConfig.seo.defaultTitle),
  description:
    'Curated Hongxiang Shangdao-Elexvx directory aggregating 30 enterprise systems, government portals, IP and corporate credit lookups, AI development platforms, and public media tools.',
  path: '/navigation/',
  locale: 'en',
});

export default function Page() {
  return (
    <EnglishLanguageProvider path="/navigation">
      <SiteShell activePath="/navigation" className="service-site-shell" linkOrigin={CANONICAL_ORIGIN}>
        <NavigationPage />
      </SiteShell>
    </EnglishLanguageProvider>
  );
}
