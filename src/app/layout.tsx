import type { Metadata } from 'next';
import 'antd/dist/reset.css';
import '../styles/apple-system.css';
import { siteIdentity } from '../data/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteIdentity.canonicalOrigin),
  title: {
    default: siteIdentity.researchName,
    template: `%s · ${siteIdentity.researchName}`,
  },
  description: siteIdentity.description,
  icons: {
    icon: '/brand/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
