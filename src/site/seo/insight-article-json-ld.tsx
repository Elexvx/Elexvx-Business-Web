import type { Insight } from '../../content/types';
import type { Locale } from '../providers/i18n';
import { buildArticleStructuredData, JsonLdScript, localizeStructuredText } from './structured-data';

export const insightArticleStructuredData = (insight: Insight, locale: Locale = 'zh-CN') =>
  buildArticleStructuredData({
    type: 'Article',
    path: `/insights/${insight.slug}/`,
    locale,
    title: insight.title,
    description: insight.excerpt,
    publishedAt: insight.publishedAt,
    modifiedAt: insight.updatedAt,
    cover: insight.cover,
    keywords: locale === 'en' ? (insight.keywordsEn ?? insight.keywords ?? []) : (insight.keywords ?? []),
    authorName: localizeStructuredText(insight.author, locale),
  });

export const InsightArticleJsonLd = ({ insight, locale = 'zh-CN' }: { insight: Insight; locale?: Locale }) => (
  <JsonLdScript data={insightArticleStructuredData(insight, locale)} />
);
