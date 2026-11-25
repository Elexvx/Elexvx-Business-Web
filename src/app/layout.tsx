import { loadInsights } from '../content/loader';
import { loadNews } from '../content/news-loader';
import { toInsightSummary, toNewsSummary } from '../content/summaries';
import { ContentProvider } from '../site/providers/content-context';
import routePaths from '../data/route-paths.json';
import type { Metadata } from 'next';
import '../styles/apple-system.css';
import { siteIdentity } from '../data/site';
import { DEFAULT_SHARE_IMAGE_PATH } from '../data/site-origins';
import { FestivalEffects } from '../site/components/festival-effects';
import { createFestivalInitializerScript } from '../site/festival';
import { ThemeProvider } from '../site/providers/theme-provider';
import { ROOT_METADATA_DEFAULTS } from '../site/routing/metadata-base';
import { JsonLdScript, siteStructuredData } from '../site/seo/structured-data';
import { createThemeInitializerScript } from '../site/theme';

const themeInitializer = createThemeInitializerScript();
const festivalInitializer = createFestivalInitializerScript();

const chineseRoot = ROOT_METADATA_DEFAULTS['zh-CN'];
const structuredData = siteStructuredData();

export const metadata: Metadata = {
  metadataBase: new URL(siteIdentity.canonicalOrigin),
  title: {
    default: chineseRoot.title,
    template: `${chineseRoot.brandName} — %s`,
  },
  description: chineseRoot.description,
  applicationName: chineseRoot.brandName,
  keywords: [...chineseRoot.keywords],
  authors: [{ name: siteIdentity.companyName, url: siteIdentity.canonicalOrigin }],
  creator: chineseRoot.brandName,
  publisher: siteIdentity.companyName,
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
      en: '/en/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: chineseRoot.title,
    description: chineseRoot.description,
    url: `${siteIdentity.canonicalOrigin}/`,
    siteName: chineseRoot.brandName,
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: DEFAULT_SHARE_IMAGE_PATH, alt: chineseRoot.brandName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: chineseRoot.title,
    description: chineseRoot.description,
    images: [DEFAULT_SHARE_IMAGE_PATH],
  },
  icons: {
    icon: [{ url: '/brand/elexvx-logo-64.png', type: 'image/png', sizes: '64x64' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const insights = loadInsights();
  const news = loadNews();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <JsonLdScript data={structuredData} />
        <script id="elexvx-theme-initializer" dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <script id="elexvx-festival-initializer" dangerouslySetInnerHTML={{ __html: festivalInitializer }} />
      </head>
      <body>
        <ThemeProvider>
          <ContentProvider
            insights={insights.map(toInsightSummary)}
            news={news.map(toNewsSummary)}
            routePaths={routePaths}
          >
            {children}
          </ContentProvider>
          <FestivalEffects />
        </ThemeProvider>
      </body>
    </html>
  );
}
