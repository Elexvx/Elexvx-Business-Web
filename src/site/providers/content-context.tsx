'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { isDisabledPath } from '../../data/disabled-sections';
import { publishedResearch } from '../../data/research-articles';
import { createLinkAvailability } from '../../data/navigation-availability';
import type { Insight, NewsItem } from '../../content/types';

const ContentContext = createContext<Insight[]>([]);
const RoutePathsContext = createContext<string[]>([]);

const NewsContext = createContext<NewsItem[]>([]);

export const ContentProvider = ({
  insights,
  news,
  children,
  routePaths,
}: {
  insights: Insight[];
  news: NewsItem[];
  children: ReactNode;
  routePaths: string[];
}) => (
  <ContentContext.Provider value={insights.filter((item) => !isDisabledPath(`/insights/${item.slug}`))}>
    <NewsContext.Provider value={news.filter((item) => !isDisabledPath(`/news/${item.slug}`))}>
      <RoutePathsContext.Provider value={routePaths}>{children}</RoutePathsContext.Provider>
    </NewsContext.Provider>
  </ContentContext.Provider>
);

export const useInsights = () => useContext(ContentContext);
export const usePublishedInsights = () => useInsights().filter((insight) => insight.status === 'published');
export const useNews = () => useContext(NewsContext);
export const usePublishedNews = () => useNews().filter((item) => item.status === 'published');

export const useAvailableLink = () =>
  createLinkAvailability(useContext(RoutePathsContext), [
    ...usePublishedInsights().map((item) => item.directionSlug),
    ...publishedResearch.map((item) => item.slug),
  ]);
