import { serviceNavigationConfig } from '../../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../../data/site-origins';
import { SiteShell } from '../../../site/components/shell';
import { LanguageProvider } from '../../../site/providers/i18n';
import { serviceMetadata } from '../../../site/routing/metadata-base';
import { StatusPage } from '../../../site/services/status-page';

export const metadata = serviceMetadata({
  title: '服务状态历史',
  description: `详尽查看宏翔商道-Elexvx 企业核心服务、自研项目服务与公共基础服务最近 ${serviceNavigationConfig.status.historyDays} 天的逐日在线运行记录、每日异常中断与故障时长统计、各监测节点可用状态变化以及长期稳定性历史趋势，便于团队与访客全面回溯服务运行保障表现。`,
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
