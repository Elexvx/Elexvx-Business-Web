'use client';
import '../styles/apple-system.css';
import { ThemeProvider } from '../site/providers/theme-provider';
import { ContentProvider } from '../site/providers/content-context';
import routePaths from '../data/route-paths.json';
import { ErrorPage } from '../site/components/error-page';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        <ThemeProvider>
          <ContentProvider insights={[]} news={[]} routePaths={routePaths}>
            <ErrorPage code={500} retry={retry} />
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
