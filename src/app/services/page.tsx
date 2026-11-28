import { SiteShell } from '../../site/components/shell';
import { LanguageProvider } from '../../site/providers/i18n';
import { serviceMetadata } from '../../site/routing/metadata-base';
import { ServicesPage } from '../../site/services/services-page';

export const metadata = serviceMetadata({
  title: '服务中心',
  description:
    '宏翔商道-Elexvx 服务中心统一汇聚企业内部服务导航（涵盖政务办事、知识产权、人工智能研发与开发工具等 7 大类 30 项常用入口）、全天候实时服务可用性状态监控，以及最近 60 天历史运行与故障趋势记录，方便研发团队与合作伙伴随时一站式查询直达。',
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
