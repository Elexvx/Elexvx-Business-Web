import { CANONICAL_ORIGIN } from '../../data/site-origins';
import { SiteShell } from '../../site/components/shell';
import { LanguageProvider } from '../../site/providers/i18n';
import { serviceMetadata } from '../../site/routing/metadata-base';
import { StatusPage } from '../../site/services/status-page';

export const metadata = serviceMetadata({
  title: '服务状态',
  description:
    '实时查看宏翔商道-Elexvx 企业核心服务、自研项目服务与公共基础服务的当前在线运行状态、HTTP 响应健康度监测结果及近期可用率指标汇总，方便研发团队与合作伙伴及时掌握官方网站、博客平台、技术文档库及各类线上工具的服务运行情况。',
  path: '/status/',
});

export default function Page() {
  return (
    <LanguageProvider locale="zh-CN" path="/status">
      <SiteShell
        activePath="/status"
        className="service-site-shell status-performance-shell"
        linkOrigin={CANONICAL_ORIGIN}
      >
        <StatusPage />
      </SiteShell>
    </LanguageProvider>
  );
}
