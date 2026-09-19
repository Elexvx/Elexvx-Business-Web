import type { Metadata } from 'next';

import { serviceNavigationConfig } from '../../data/service-navigation';
import { SiteShell } from '../../site/components/shell';
import { StatusPage } from '../../site/services/status-page';
import { brandedPageTitle } from '../../site/routing/metadata-base';

const pageTitle = brandedPageTitle('服务状态');

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: serviceNavigationConfig.status.description,
  alternates: { canonical: 'https://www.elexvx.com/status/' },
  openGraph: {
    title: pageTitle,
    description: serviceNavigationConfig.status.description,
    url: 'https://www.elexvx.com/status/',
    siteName: '宏翔商道-Elexvx',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: serviceNavigationConfig.status.description,
    images: ['/share/elexvx.png'],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <SiteShell activePath="/status" className="service-site-shell" linkOrigin="https://www.elexvx.com">
      <StatusPage />
    </SiteShell>
  );
}
