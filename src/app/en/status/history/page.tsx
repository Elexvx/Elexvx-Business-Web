import { serviceNavigationConfig } from '../../../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../../../data/site-origins';
import { SiteShell } from '../../../../site/components/shell';
import { EnglishLanguageProvider } from '../../../../site/providers/english-i18n';
import { serviceMetadata } from '../../../../site/routing/metadata-base';
import { StatusPage } from '../../../../site/services/status-page';
import { translateEnglish } from '../../../../site/translation';

export const metadata = serviceMetadata({
  title: translateEnglish('服务状态历史'),
  description: `Review daily uptime records, outage durations, and long-term availability trends over the last ${serviceNavigationConfig.status.historyDays} days across all Hongxiang Shangdao-Elexvx services.`,
  path: '/status/history/',
  locale: 'en',
});

export default function Page() {
  return (
    <EnglishLanguageProvider path="/status/history">
      <SiteShell activePath="/status/history" className="service-site-shell" linkOrigin={CANONICAL_ORIGIN}>
        <StatusPage history />
      </SiteShell>
    </EnglishLanguageProvider>
  );
}
