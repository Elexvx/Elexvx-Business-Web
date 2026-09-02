'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Insight, NewsItem } from '../content/types';

const ContentContext = createContext<Insight[]>([]);
const NewsContext = createContext<NewsItem[]>([]);

export const ContentProvider = ({
  insights,
  news,
  children,
}: {
  insights: Insight[];
  news: NewsItem[];
  children: ReactNode;
}) => (
  <ContentContext.Provider value={insights}>
    <NewsContext.Provider value={news}>{children}</NewsContext.Provider>
  </ContentContext.Provider>
);

export const useInsights = () => useContext(ContentContext);
export const usePublishedInsights = () => useInsights().filter((insight) => insight.status === 'published');
export const useNews = () => useContext(NewsContext);
export const usePublishedNews = () => useNews().filter((item) => item.status === 'published');
