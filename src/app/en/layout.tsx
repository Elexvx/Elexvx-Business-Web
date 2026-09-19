import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const defaultTitle = 'Hongxiang Shangdao-Elexvx — AI & Data Intelligence R&D';
const defaultDescription =
  'AI and data intelligence research, products, company news, and collaboration opportunities from Hongxiang Shangdao-Elexvx.';

export const metadata: Metadata = {
  title: { absolute: defaultTitle },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName: 'Hongxiang Shangdao-Elexvx',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
