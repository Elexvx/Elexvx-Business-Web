import { SiteShell } from '../../../site/components/shell';
import { EnglishLanguageProvider } from '../../../site/providers/english-i18n';
import { serviceMetadata } from '../../../site/routing/metadata-base';
import { ServicesPage } from '../../../site/services/services-page';
import { translateEnglish } from '../../../site/translation';

export const metadata = serviceMetadata({
  title: translateEnglish('服务中心'),
  description: translateEnglish('帮助文档、企业服务导航与服务状态的统一入口。'),
  path: '/services/',
  locale: 'en',
});

export default function Page() {
  return (
    <EnglishLanguageProvider path="/services">
      <SiteShell activePath="/services" className="service-site-shell">
        <ServicesPage />
      </SiteShell>
    </EnglishLanguageProvider>
  );
}
