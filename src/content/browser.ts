import { insightFromSource, sortInsights } from './normalize';
import { newsFromSource, sortNews } from './news';
import type { Insight } from './types';

const rawSources = import.meta.glob('../../articles/insights/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const browserInsights: Insight[] = sortInsights(
  Object.entries(rawSources).map(([filename, source]) => insightFromSource(source, filename))
);

const rawNewsSources = import.meta.glob('../../articles/news/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export const browserNews = sortNews(
  Object.entries(rawNewsSources).map(([filename, source]) => newsFromSource(source, filename))
);
