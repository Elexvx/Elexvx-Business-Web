'use client';
import '../styles/apple-system.css';
import { ThemeProvider } from '../site/providers/theme-provider';
import { ContentProvider } from '../site/providers/content-context';
import { getStaticRoutes } from '../site/routing/routes';
import { ErrorPage } from '../site/components/error-page';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        <ThemeProvider>
          <ContentProvider insights={[]} news={[]} routePaths={getStaticRoutes([], []).map((route) => route.path)}>
            <ErrorPage code={500} retry={retry} />
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
