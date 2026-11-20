import type { Insight, NewsItem } from '../../content/types';
import { publishedActivities } from '../../data/activities';
import { publishedResearch } from '../../data/research-articles';
import type { Locale } from '../providers/i18n';
import { ActivityArticleJsonLd } from './activity-article-json-ld';
import { InsightArticleJsonLd } from './insight-article-json-ld';
import { NewsArticleJsonLd } from './news-article-json-ld';

export const RouteArticleJsonLd = ({
  path,
  locale = 'zh-CN',
  insights,
  news,
}: {
  path: string;
  locale?: Locale;
  insights: Insight[];
  news: NewsItem[];
}) => {
  const research = publishedResearch.find((item) => path === `/research/${item.slug}`);
  if (research) return <ActivityArticleJsonLd item={research} section="research" locale={locale} />;

  const activity = publishedActivities.find((item) => path === `/activities/${item.slug}` && !item.externalUrl);
  if (activity) return <ActivityArticleJsonLd item={activity} section="activities" locale={locale} />;

  if (path.startsWith('/insights/')) {
    const slug = path.slice('/insights/'.length);
    const insight = insights.find((item) => item.slug === slug && item.status === 'published');
    if (insight) return <InsightArticleJsonLd insight={insight} locale={locale} />;
  }

  if (path.startsWith('/news/')) {
    const slug = path.slice('/news/'.length);
    const item = news.find((entry) => entry.slug === slug && entry.status === 'published');
    if (item) return <NewsArticleJsonLd item={item} locale={locale} />;
  }

  return null;
};
