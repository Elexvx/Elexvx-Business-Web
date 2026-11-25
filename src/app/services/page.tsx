import { SiteShell } from '../../site/components/shell';
import { LanguageProvider } from '../../site/providers/i18n';
import { serviceMetadata } from '../../site/routing/metadata-base';
import { ServicesPage } from '../../site/services/services-page';

export const metadata = serviceMetadata({
  title: '服务中心',
  description: '帮助文档、企业服务导航与服务状态的统一入口。',
  path: '/services/',
});

export default function Page() {
  return (
    <LanguageProvider locale="zh-CN" path="/services">
      <SiteShell activePath="/services" className="service-site-shell">
        <ServicesPage />
      </SiteShell>
    </LanguageProvider>
  );
}
