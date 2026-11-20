import type { Insight, InsightSummary, NewsItem, NewsSummary } from './types';

export const omitFields = <T extends Record<string, unknown>, K extends keyof T>(item: T, ...keys: K[]): Omit<T, K> => {
  const excluded = new Set<PropertyKey>(keys);
  return Object.fromEntries(Object.entries(item).filter(([key]) => !excluded.has(key))) as Omit<T, K>;
};

/** Keep article bodies on the server/detail route instead of the global client context. */
export const toInsightSummary = (item: Insight | InsightSummary): InsightSummary =>
  'body' in item ? omitFields(item, 'body') : item;

export const toNewsSummary = (item: NewsItem | NewsSummary): NewsSummary =>
  'body' in item ? omitFields(item, 'body') : item;
