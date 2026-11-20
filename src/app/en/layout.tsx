import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ROOT_METADATA_DEFAULTS } from '../../site/routing/metadata-base';

const englishRoot = ROOT_METADATA_DEFAULTS.en;

export const metadata: Metadata = {
  title: { absolute: englishRoot.title },
  openGraph: {
    title: englishRoot.title,
    description: englishRoot.description,
    siteName: englishRoot.brandName,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: englishRoot.title,
    description: englishRoot.description,
  },
};

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
