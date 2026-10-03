import type { Metadata } from 'next';

import { serviceNavigationConfig } from '../../../data/service-navigation';
import { SiteShell } from '../../../site/components/shell';
import { StatusPage } from '../../../site/services/status-page';
import { brandedPageTitle } from '../../../site/routing/metadata-base';

const pageTitle = brandedPageTitle('服务状态历史');

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: `查看最近 ${serviceNavigationConfig.status.historyDays} 天的服务运行记录。`,
  alternates: { canonical: 'https://www.elexvx.com/status/history/' },
  openGraph: {
    title: pageTitle,
    description: `查看最近 ${serviceNavigationConfig.status.historyDays} 天的服务运行记录。`,
    url: 'https://www.elexvx.com/status/history/',
    siteName: '宏翔商道-Elexvx',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: `查看最近 ${serviceNavigationConfig.status.historyDays} 天的服务运行记录。`,
    images: ['/share/elexvx.png'],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <SiteShell activePath="/status/history" className="service-site-shell" linkOrigin="https://www.elexvx.com">
      <StatusPage history />
    </SiteShell>
  );
}
