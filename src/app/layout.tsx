import { loadInsights } from '../content/loader';
import { loadNews } from '../content/news-loader';
import { ContentProvider } from '../site/providers/content-context';
import { getStaticRoutes } from '../site/routing/routes';
import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import '../styles/apple-system.css';
import { siteIdentity } from '../data/site';
import { ThemeProvider } from '../site/providers/theme-provider';

const themeInitializer = `
  (() => {
    document.documentElement.lang = /^\\/en(?:\\/|$)/.test(window.location.pathname) ? 'en' : 'zh-CN';
    const storageKey = 'elexvx-theme';
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
    const systemTheme = (() => {
      try {
        if (typeof window.matchMedia !== 'function') return null;
        const preference = window.matchMedia('(prefers-color-scheme: dark)');
        return typeof preference.matches === 'boolean' ? (preference.matches ? 'dark' : 'light') : null;
      } catch {
        return null;
      }
    })();
    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      const theme = storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : systemTheme ?? solarTheme();
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      const theme = systemTheme ?? solarTheme();
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  })();
`;

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
  const insights = loadInsights();
  const news = loadNews();
  const routePaths = getStaticRoutes(insights, news).map((route) => route.path);
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body>
        <ThemeProvider>
          <ContentProvider insights={insights} news={news} routePaths={routePaths}>
            {children}
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
