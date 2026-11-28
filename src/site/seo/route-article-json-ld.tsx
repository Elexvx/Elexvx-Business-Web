import type { Insight, NewsItem } from '../../content/types';
import { publishedActivities } from '../../data/activities';
import { homeContent } from '../../data/page-content';
import { publishedResearch } from '../../data/research-articles';
import type { Locale } from '../providers/i18n';
import { resolveRoute } from '../routing/routes';
import { ActivityArticleJsonLd } from './activity-article-json-ld';
import { InsightArticleJsonLd } from './insight-article-json-ld';
import { NewsArticleJsonLd } from './news-article-json-ld';
import { buildBreadcrumbStructuredData, buildSoftwareApplicationStructuredData, JsonLdScript } from './structured-data';

const articleJsonLd = ({
  path,
  locale,
  insights,
  news,
}: {
  path: string;
  locale: Locale;
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

  const product = homeContent.product.items.find((item) => path === item.href);
  if (product) {
    return (
      <JsonLdScript
        data={buildSoftwareApplicationStructuredData({
          path,
          locale,
          name: product.name,
          description: product.description,
          image: product.image,
        })}
      />
    );
  }

  return null;
};

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
  const route = resolveRoute(path, insights, news);
  const breadcrumb =
    path !== '/' && route.meta.robots !== 'noindex,nofollow' ? (
      <JsonLdScript
        data={buildBreadcrumbStructuredData({
          path,
          locale,
          title: locale === 'en' && route.meta.titleEn ? route.meta.titleEn : route.meta.title,
        })}
      />
    ) : null;

  return (
    <>
      {breadcrumb}
      {articleJsonLd({ path, locale, insights, news })}
    </>
  );
};
