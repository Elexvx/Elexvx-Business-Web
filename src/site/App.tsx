import type { Insight, NewsItem } from '../content/types';
import { LanguageProvider, type Locale } from './providers/i18n';
import { resolveRoute } from './routing/routes';

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
  const page = resolveRoute(path, insights, news).render();

  return (
    <LanguageProvider locale={locale} path={path}>
      {page}
    </LanguageProvider>
  );
};
