import { serviceNavigationConfig } from '../../data/service-navigation';
import { CANONICAL_ORIGIN } from '../../data/site-origins';
import { SiteShell } from '../../site/components/shell';
import { LanguageProvider } from '../../site/providers/i18n';
import { serviceMetadata } from '../../site/routing/metadata-base';
import { NavigationPage } from '../../site/services/navigation-page';

export const metadata = serviceMetadata({
  title: serviceNavigationConfig.seo.defaultTitle,
  description:
    '统一汇聚宏翔商道企业内部协作系统、江苏政务与人社办事服务、国家知识产权与软著商标登记、企业信用核查、人工智能研发平台、开发工程工具及公众媒体等 7 大类 30 项常用入口，支持站内实时过滤检索与多搜索引擎快捷直达。',
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
