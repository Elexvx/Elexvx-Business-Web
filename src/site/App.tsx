'use client';

import type { Insight, NewsItem } from '../content/types';
import { ContentProvider } from './providers/content-context';
import { LanguageProvider, type Locale } from './providers/i18n';
import { getStaticRoutes, resolveRoute } from './routing/routes';

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
      <ContentProvider
        insights={insights}
        news={news}
        routePaths={getStaticRoutes(insights, news).map((item) => item.path)}
      >
        {route.render()}
      </ContentProvider>
    </LanguageProvider>
  );
};
