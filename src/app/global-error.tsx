'use client';
import '../styles/apple-system.css';
import { FestivalEffects } from '../site/components/festival-effects';
import { ThemeProvider } from '../site/providers/theme-provider';
import { ContentProvider } from '../site/providers/content-context';
import routePaths from '../data/route-paths.json';
import { ErrorPage } from '../site/components/error-page';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          <ContentProvider insights={[]} news={[]} routePaths={routePaths}>
            <ErrorPage code={500} retry={retry} />
          </ContentProvider>
          <FestivalEffects />
        </ThemeProvider>
      </body>
    </html>
  );
}
