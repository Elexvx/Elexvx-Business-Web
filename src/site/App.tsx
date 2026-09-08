import { english } from './translation';
import type { Insight, NewsItem } from '../content/types';
import { ContentProvider } from './providers/content-context';
import { LanguageProvider, type Locale } from './providers/i18n';
import { getStaticRoutes, resolveRoute } from './routing/routes';
import { SiteShell } from './components/shell';

export const App = ({
  path,
  insights,
  news,
  locale = 'zh-CN',
  homeHtml,
}: {
  path: string;
  insights: Insight[];
  news: NewsItem[];
  locale?: Locale;
  homeHtml?: string;
}) => {
  const route = resolveRoute(path, insights, news);
  return (
    <LanguageProvider locale={locale} path={path} translations={locale === 'en' ? english : undefined}>
      <ContentProvider
        insights={insights}
        news={news}
        routePaths={getStaticRoutes(insights, news).map((item) => item.path)}
      >
        {path === '/' && homeHtml !== undefined ? (
          <SiteShell activePath="/" navTone="dark" className="site-shell-home" mainHtml={homeHtml} />
        ) : (
          route.render()
        )}
      </ContentProvider>
    </LanguageProvider>
  );
};
