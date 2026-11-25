import { serviceNavigationConfig } from '../../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../../data/site-origins';
import { SiteShell } from '../../../site/components/shell';
import { LanguageProvider } from '../../../site/providers/i18n';
import { serviceMetadata } from '../../../site/routing/metadata-base';
import { StatusPage } from '../../../site/services/status-page';

export const metadata = serviceMetadata({
  title: '服务状态历史',
  description: `查看最近 ${serviceNavigationConfig.status.historyDays} 天的服务运行记录。`,
  path: '/status/history/',
});

export default function Page() {
  return (
    <LanguageProvider locale="zh-CN" path="/status/history">
      <SiteShell activePath="/status/history" className="service-site-shell" linkOrigin={CANONICAL_ORIGIN}>
        <StatusPage history />
      </SiteShell>
    </LanguageProvider>
  );
}
