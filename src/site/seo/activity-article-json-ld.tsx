import type { Activity } from '../../data/activities';
import type { Locale } from '../providers/i18n';
import { buildArticleStructuredData, JsonLdScript, localizeStructuredText } from './structured-data';

export const activityArticleStructuredData = (
  item: Activity,
  section: 'research' | 'activities',
  locale: Locale = 'zh-CN'
) =>
  buildArticleStructuredData({
    type: 'Article',
    path: `/${section}/${item.slug}/`,
    locale,
    title: item.title,
    description: item.excerpt,
    publishedAt: item.publishedAt,
    modifiedAt: item.updatedAt || item.publishedAt,
    cover: item.cover,
    section: item.category || undefined,
    keywords: locale === 'en' ? item.keywordsEn || [] : item.keywords || [],
    authorName: localizeStructuredText(item.author, locale),
  });

export const ActivityArticleJsonLd = ({
  item,
  section,
  locale = 'zh-CN',
}: {
  item: Activity;
  section: 'research' | 'activities';
  locale?: Locale;
}) => <JsonLdScript data={activityArticleStructuredData(item, section, locale)} />;
