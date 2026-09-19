import type { Metadata } from 'next';

import { serviceNavigationConfig } from '../../data/service-navigation';
import { SiteShell } from '../../site/components/shell';
import { NavigationPage } from '../../site/services/navigation-page';
import { brandedPageTitle } from '../../site/routing/metadata-base';

const pageTitle = brandedPageTitle(serviceNavigationConfig.seo.defaultTitle);

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: serviceNavigationConfig.site.description,
  alternates: { canonical: 'https://www.elexvx.com/navigation/' },
  openGraph: {
    title: pageTitle,
    description: serviceNavigationConfig.site.description,
    url: 'https://www.elexvx.com/navigation/',
    siteName: '宏翔商道-Elexvx',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: serviceNavigationConfig.site.description,
    images: ['/share/elexvx.png'],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <SiteShell activePath="/navigation" className="service-site-shell" linkOrigin="https://www.elexvx.com">
      <NavigationPage />
    </SiteShell>
  );
}
