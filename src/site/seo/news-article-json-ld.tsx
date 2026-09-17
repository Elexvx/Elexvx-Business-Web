import type { NewsItem } from '../../content/types';
import { siteIdentity } from '../../data/site';
import type { Locale } from '../providers/i18n';
import { translateEnglish } from '../translation';

const localized = (value: string, locale: Locale) => (locale === 'en' ? translateEnglish(value) : value);

export const newsArticleStructuredData = (item: NewsItem, locale: Locale = 'zh-CN') => {
  const localePrefix = locale === 'en' ? '/en' : '';
  const canonical = `${siteIdentity.canonicalOrigin}${localePrefix}/news/${item.slug}/`;
  const author = localized(item.author, locale);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${canonical}#article`,
    headline: localized(item.title, locale),
    description: localized(item.excerpt, locale),
    datePublished: item.publishedAt,
    ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
    mainEntityOfPage: canonical,
    url: canonical,
    image: new URL(item.cover || '/share/elexvx.png', siteIdentity.canonicalOrigin).href,
    articleSection: localized(item.category, locale),
    keywords: item.tags.map((tag) => localized(tag, locale)),
    author: {
      '@type': 'Organization',
      name: author || siteIdentity.seoName,
      url: `${siteIdentity.canonicalOrigin}${localePrefix}/company/`,
    },
    publisher: { '@id': `${siteIdentity.canonicalOrigin}/#organization` },
    isPartOf: { '@id': `${siteIdentity.canonicalOrigin}/#website` },
    inLanguage: locale === 'en' ? 'en' : 'zh-CN',
  }).replace(/</g, '\\u003c');
};

export const NewsArticleJsonLd = ({ item, locale = 'zh-CN' }: { item: NewsItem; locale?: Locale }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: newsArticleStructuredData(item, locale) }} />
);
