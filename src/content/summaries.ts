import type { Insight, InsightSummary, NewsItem, NewsSummary } from './types';

/** Keep article bodies on the server/detail route instead of the global client context. */
export const toInsightSummary = (item: Insight | InsightSummary): InsightSummary => {
  if (!('body' in item)) return item;
  const { body, ...summary } = item;
  void body;
  return summary;
};

export const toNewsSummary = (item: NewsItem | NewsSummary): NewsSummary => {
  if (!('body' in item)) return item;
  const { body, ...summary } = item;
  void body;
  return summary;
};
