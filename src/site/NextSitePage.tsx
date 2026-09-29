import { loadInsights } from '../content/loader';
import { loadNews } from '../content/news-loader';
import { App } from './App';
import type { Locale } from './providers/i18n';
import homeHtml from '../data/home-static.json';
import { publishedResearch } from '../data/research-articles';
import { publishedActivities } from '../data/activities';
import { ActivityArticleJsonLd } from './seo/activity-article-json-ld';

export const NextSitePage = ({ path, locale = 'zh-CN' }: { path: string; locale?: Locale }) => {
  const insights = loadInsights();
  const news = loadNews();
  const research = publishedResearch.find((item) => path === `/research/${item.slug}`);
  const activity = publishedActivities.find((item) => path === `/activities/${item.slug}` && !item.externalUrl);
  return (
    <>
      {research && <ActivityArticleJsonLd item={research} section="research" locale={locale} />}
      {activity && <ActivityArticleJsonLd item={activity} section="activities" locale={locale} />}
      <App
        path={path}
        insights={insights}
        news={news}
        locale={locale}
        homeHtml={process.env.NODE_ENV === 'production' && path === '/' ? homeHtml[locale] : undefined}
      />
    </>
  );
};
