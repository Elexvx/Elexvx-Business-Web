import { loadInsights } from '../content/loader';
import { loadNews } from '../content/news-loader';
import { toInsightSummary, toNewsSummary } from '../content/summaries';
import { ContentProvider } from '../site/providers/content-context';
import routePaths from '../data/route-paths.json';
import type { Metadata } from 'next';
import '../styles/apple-system.css';
import { siteIdentity } from '../data/site';
import { ThemeProvider } from '../site/providers/theme-provider';

const themeInitializer = `
  (() => {
    document.documentElement.lang = /^\\/en(?:\\/|$)/.test(window.location.pathname) ? 'en' : 'zh-CN';
    const storageKey = 'elexvx-theme-mode';
    const solarTheme = () => {
      const latitude = 32.0603;
      const longitude = 118.7969;
      const radians = Math.PI / 180;
      const normalizeHours = (hours) => ((hours % 24) + 24) % 24;
      const normalizeDegrees = (degrees) => ((degrees % 360) + 360) % 360;
      const now = new Date();
      const longitudeHour = longitude / 15;
      const solarDate = new Date(now.getTime() + longitudeHour * 3600000);
      const start = Date.UTC(solarDate.getUTCFullYear(), 0, 0);
      const current = Date.UTC(solarDate.getUTCFullYear(), solarDate.getUTCMonth(), solarDate.getUTCDate());
      const ordinalDay = Math.floor((current - start) / 86400000);
      const solarHour = (rising) => {
        const approximateTime = ordinalDay + ((rising ? 6 : 18) - longitudeHour) / 24;
        const meanAnomaly = 0.9856 * approximateTime - 3.289;
        const trueLongitude = normalizeDegrees(
          meanAnomaly +
            1.916 * Math.sin(meanAnomaly * radians) +
            0.02 * Math.sin(2 * meanAnomaly * radians) +
            282.634
        );
        const rightAscension = normalizeDegrees(Math.atan(0.91764 * Math.tan(trueLongitude * radians)) / radians);
        const longitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
        const rightAscensionQuadrant = Math.floor(rightAscension / 90) * 90;
        const adjustedRightAscension = (rightAscension + longitudeQuadrant - rightAscensionQuadrant) / 15;
        const sineDeclination = 0.39782 * Math.sin(trueLongitude * radians);
        const cosineDeclination = Math.cos(Math.asin(sineDeclination));
        const cosineHourAngle =
          (Math.cos(90.8333 * radians) - sineDeclination * Math.sin(latitude * radians)) /
          (cosineDeclination * Math.cos(latitude * radians));
        if (cosineHourAngle > 1 || cosineHourAngle < -1) return null;
        const hourAngle = rising
          ? 360 - Math.acos(cosineHourAngle) / radians
          : Math.acos(cosineHourAngle) / radians;
        const localMeanTime = hourAngle / 15 + adjustedRightAscension - 0.06571 * approximateTime - 6.622;
        return normalizeHours(localMeanTime - longitudeHour);
      };
      const sunrise = solarHour(true);
      const sunset = solarHour(false);
      if (sunrise === null || sunset === null) {
        const hour = now.getHours();
        return hour >= 6 && hour < 18 ? 'light' : 'dark';
      }
      const currentSolarHour = normalizeHours(now.getUTCHours() + now.getUTCMinutes() / 60 + longitudeHour);
      const sunriseSolarHour = normalizeHours(sunrise + longitudeHour);
      const sunsetSolarHour = normalizeHours(sunset + longitudeHour);
      const isDaylight = sunriseSolarHour < sunsetSolarHour
        ? currentSolarHour >= sunriseSolarHour && currentSolarHour < sunsetSolarHour
        : currentSolarHour >= sunriseSolarHour || currentSolarHour < sunsetSolarHour;
      return isDaylight ? 'light' : 'dark';
    };
    try {
      const storedMode = window.localStorage.getItem(storageKey);
      const theme = storedMode === 'light' || storedMode === 'dark' ? storedMode : solarTheme();
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      const theme = solarTheme();
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  })();
`;

const organizationId = `${siteIdentity.canonicalOrigin}/#organization`;
const fallbackPageTitle = '人工智能与数据智能研发';
const fallbackSearchTitle = `${siteIdentity.seoName} — ${fallbackPageTitle}`;
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: siteIdentity.seoName,
      legalName: '宏翔商道（南京）科技发展有限公司',
      alternateName: ['宏翔商道', 'Elexvx'],
      description: siteIdentity.seoDescription,
      url: `${siteIdentity.canonicalOrigin}/`,
      logo: `${siteIdentity.canonicalOrigin}/brand/elexvx-logo-black-600.webp`,
      email: 'contact@elexvx.com',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteIdentity.canonicalOrigin}/#website`,
      name: siteIdentity.seoName,
      alternateName: ['宏翔商道', 'Elexvx'],
      description: siteIdentity.seoDescription,
      url: `${siteIdentity.canonicalOrigin}/`,
      publisher: { '@id': organizationId },
      inLanguage: ['zh-CN', 'en'],
    },
  ],
}).replace(/</g, '\\u003c');

export const metadata: Metadata = {
  metadataBase: new URL(siteIdentity.canonicalOrigin),
  title: {
    default: fallbackSearchTitle,
    template: `${siteIdentity.seoName} — %s`,
  },
  description: siteIdentity.seoDescription,
  applicationName: siteIdentity.seoName,
  keywords: ['宏翔商道-Elexvx', '宏翔商道', 'Elexvx', '人工智能', '数据智能'],
  authors: [{ name: siteIdentity.companyName, url: siteIdentity.canonicalOrigin }],
  creator: siteIdentity.seoName,
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
    title: fallbackSearchTitle,
    description: siteIdentity.seoDescription,
    url: `${siteIdentity.canonicalOrigin}/`,
    siteName: siteIdentity.seoName,
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/share/elexvx.png', alt: siteIdentity.seoName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: fallbackSearchTitle,
    description: siteIdentity.seoDescription,
    images: ['/share/elexvx.png'],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
