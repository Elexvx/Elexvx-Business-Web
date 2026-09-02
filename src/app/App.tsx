'use client';

import type { Insight, NewsItem } from '../content/types';
import { ContentProvider } from './content-context';
import { LanguageProvider, type Locale } from './i18n';
import { resolveRoute } from './routes';

export const App = ({
  path,
  insights,
  news,
  locale = 'zh-CN',
}: {
  path: string;
  insights: Insight[];
  news: NewsItem[];
  locale?: Locale;
}) => {
  const route = resolveRoute(path, insights, news);
  return (
    <LanguageProvider locale={locale} path={path}>
      <ContentProvider insights={insights} news={news}>
        {route.render()}
      </ContentProvider>
    </LanguageProvider>
  );
};
