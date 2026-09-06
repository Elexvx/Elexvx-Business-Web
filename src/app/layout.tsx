import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import '../styles/apple-system.css';
import { siteIdentity } from '../data/site';
import { ThemeProvider } from '../site/providers/theme-provider';

const themeInitializer = `
  (() => {
    const storageKey = 'elexvx-theme';
    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      const hour = new Date().getHours();
      const theme = storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : hour >= 6 && hour < 18 ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      const hour = new Date().getHours();
      const theme = hour >= 6 && hour < 18 ? 'light' : 'dark';
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
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
