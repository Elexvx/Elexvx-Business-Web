'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { isDisabledPath } from '../../data/disabled-sections';
import { createLinkAvailability } from '../../data/navigation-availability';
import { navigationGroups, withNewsCategories, type NavigationGroup } from '../../data/research-navigation';
import { toInsightSummary, toNewsSummary } from '../../content/summaries';
import type { Insight, InsightSummary, NewsItem, NewsSummary } from '../../content/types';

const ContentContext = createContext<InsightSummary[]>([]);
const RoutePathsContext = createContext<string[]>([]);

const NewsContext = createContext<NewsSummary[]>([]);

export const ContentProvider = ({
  insights,
  news,
  children,
  routePaths,
}: {
  insights: ReadonlyArray<Insight | InsightSummary>;
  news: ReadonlyArray<NewsItem | NewsSummary>;
  children: ReactNode;
  routePaths: string[];
}) => {
  const availableInsights = useMemo(
    () => insights.filter((item) => !isDisabledPath(`/insights/${item.slug}`)).map(toInsightSummary),
    [insights]
  );
  const availableNews = useMemo(
    () => news.filter((item) => !isDisabledPath(`/news/${item.slug}`)).map(toNewsSummary),
    [news]
  );

  return (
    <ContentContext.Provider value={availableInsights}>
      <NewsContext.Provider value={availableNews}>
        <RoutePathsContext.Provider value={routePaths}>{children}</RoutePathsContext.Provider>
      </NewsContext.Provider>
    </ContentContext.Provider>
  );
};

export const useInsights = () => useContext(ContentContext);
export const usePublishedInsights = () => {
  const insights = useInsights();
  return useMemo(() => insights.filter((insight) => insight.status === 'published'), [insights]);
};
export const useNews = () => useContext(NewsContext);
export const usePublishedNews = () => {
  const news = useNews();
  return useMemo(() => news.filter((item) => item.status === 'published'), [news]);
};

export const useAvailableLink = () => {
  const routePaths = useContext(RoutePathsContext);
  return useMemo(() => createLinkAvailability(routePaths), [routePaths]);
};

export const useVisibleNavigationGroups = (): NavigationGroup[] => {
  const isAvailableLink = useAvailableLink();
  const publishedNews = usePublishedNews();

  return useMemo(() => {
    const newsCategories = publishedNews.map((item) => item.category);
    return withNewsCategories(navigationGroups, newsCategories)
      .map((group) => ({
        ...group,
        columns: group.columns
          .map((column) => ({
            ...column,
            links: column.links.filter((link) => isAvailableLink(link.href)),
          }))
          .filter((column) => column.links.length > 0),
      }))
      .filter((group) => isAvailableLink(group.href) && group.columns.length > 0);
  }, [isAvailableLink, publishedNews]);
};
