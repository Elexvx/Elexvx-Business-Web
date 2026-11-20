import type { NewsItem } from '../../content/types';
import type { Locale } from '../providers/i18n';
import { buildArticleStructuredData, JsonLdScript, localizeStructuredText } from './structured-data';

export const newsArticleStructuredData = (item: NewsItem, locale: Locale = 'zh-CN') =>
  buildArticleStructuredData({
    type: 'NewsArticle',
    path: `/news/${item.slug}/`,
    locale,
    title: item.title,
    description: item.excerpt,
    publishedAt: item.publishedAt,
    modifiedAt: item.updatedAt,
    cover: item.cover,
    section: item.category,
    keywords: item.tags.map((tag) => localizeStructuredText(tag, locale)),
    authorName: localizeStructuredText(item.author, locale),
  });

export const NewsArticleJsonLd = ({ item, locale = 'zh-CN' }: { item: NewsItem; locale?: Locale }) => (
  <JsonLdScript data={newsArticleStructuredData(item, locale)} />
);
