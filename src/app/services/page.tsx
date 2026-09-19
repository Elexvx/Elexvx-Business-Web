import type { Metadata } from 'next';

import { SiteShell } from '../../site/components/shell';
import { ServicesPage } from '../../site/services/services-page';
import { brandedPageTitle } from '../../site/routing/metadata-base';

const pageTitle = brandedPageTitle('服务中心');

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: '帮助文档、企业服务导航与服务状态的统一入口。',
  alternates: { canonical: 'https://www.elexvx.com/services/' },
  openGraph: {
    title: pageTitle,
    description: '帮助文档、企业服务导航与服务状态的统一入口。',
    url: 'https://www.elexvx.com/services/',
    siteName: '宏翔商道-Elexvx',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: '帮助文档、企业服务导航与服务状态的统一入口。',
    images: ['/share/elexvx.png'],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <SiteShell activePath="/services" className="service-site-shell">
      <ServicesPage />
    </SiteShell>
  );
}
