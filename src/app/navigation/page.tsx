import { serviceNavigationConfig } from '../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../data/site-origins';
import { SiteShell } from '../../site/components/shell';
import { LanguageProvider } from '../../site/providers/i18n';
import { serviceMetadata } from '../../site/routing/metadata-base';
import { NavigationPage } from '../../site/services/navigation-page';

export const metadata = serviceMetadata({
  title: serviceNavigationConfig.seo.defaultTitle,
  description: serviceNavigationConfig.site.description,
  path: '/navigation/',
});

export default function Page() {
  return (
    <LanguageProvider locale="zh-CN" path="/navigation">
      <SiteShell activePath="/navigation" className="service-site-shell" linkOrigin={CANONICAL_ORIGIN}>
        <NavigationPage />
      </SiteShell>
    </LanguageProvider>
  );
}
