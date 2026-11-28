import { SiteShell } from '../../../site/components/shell';
import { EnglishLanguageProvider } from '../../../site/providers/english-i18n';
import { serviceMetadata } from '../../../site/routing/metadata-base';
import { ServicesPage } from '../../../site/services/services-page';
import { translateEnglish } from '../../../site/translation';

export const metadata = serviceMetadata({
  title: translateEnglish('服务中心'),
  description:
    'Unified Hongxiang Shangdao-Elexvx Service Center providing direct access to the 30-link Enterprise Service Directory, real-time service uptime monitoring, and 60-day availability history.',
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
