import { loadInsights } from '../content/loader';
import { loadNews } from '../content/news-loader';
import type { Insight, NewsItem } from '../content/types';
import { App } from './App';
import type { Locale } from './providers/i18n';
import { RouteArticleJsonLd } from './seo/route-article-json-ld';

export const NextSitePage = ({
  path,
  locale = 'zh-CN',
  insights,
  news,
}: {
  path: string;
  locale?: Locale;
  insights?: Insight[];
  news?: NewsItem[];
}) => {
  const resolvedInsights = insights ?? loadInsights();
  const resolvedNews = news ?? loadNews();
  return (
    <>
      <RouteArticleJsonLd path={path} locale={locale} insights={resolvedInsights} news={resolvedNews} />
      <App path={path} insights={resolvedInsights} news={resolvedNews} locale={locale} />
    </>
  );
};
