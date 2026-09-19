import type { Insight, NewsItem } from '../content/types';
import { toInsightSummary, toNewsSummary } from '../content/summaries';
import { ContentProvider } from './providers/content-context';
import { LanguageProvider, type Locale } from './providers/i18n';
import { EnglishLanguageProvider } from './providers/english-i18n';
import { getStaticRoutes, resolveRoute } from './routing/routes';
import { SiteShell } from './components/shell';
import { serviceRoutePaths } from '../data/service-routes';

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
  const routes = getStaticRoutes(insights, news);
  const page =
    path === '/' && homeHtml !== undefined ? (
      <SiteShell activePath="/" navTone="dark" className="site-shell-home" mainHtml={homeHtml} />
    ) : (
      route.render()
    );
  const content = (
    <ContentProvider
      insights={insights.map(toInsightSummary)}
      news={news.map(toNewsSummary)}
      routePaths={[...routes.map((item) => item.path), ...serviceRoutePaths]}
    >
      {page}
    </ContentProvider>
  );

  if (locale === 'en') return <EnglishLanguageProvider path={path}>{content}</EnglishLanguageProvider>;

  return (
    <LanguageProvider locale={locale} path={path}>
      {content}
    </LanguageProvider>
  );
};
