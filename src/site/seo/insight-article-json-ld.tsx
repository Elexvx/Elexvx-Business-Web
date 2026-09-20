import type { Insight } from '../../content/types';
import { siteIdentity } from '../../data/site';
import type { Locale } from '../providers/i18n';
import { translateEnglish } from '../translation';

const localized = (value: string, locale: Locale) => (locale === 'en' ? translateEnglish(value) : value);

export const insightArticleStructuredData = (insight: Insight, locale: Locale = 'zh-CN') => {
  const localePrefix = locale === 'en' ? '/en' : '';
  const canonical = `${siteIdentity.canonicalOrigin}${localePrefix}/insights/${insight.slug}/`;
  const keywords = locale === 'en' ? (insight.keywordsEn ?? insight.keywords ?? []) : (insight.keywords ?? []);
  const author = localized(insight.author, locale);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: localized(insight.title, locale),
    description: localized(insight.excerpt, locale),
    datePublished: insight.publishedAt,
    ...(insight.updatedAt ? { dateModified: insight.updatedAt } : {}),
    mainEntityOfPage: canonical,
    url: canonical,
    image: new URL(insight.cover || '/share/elexvx.png', siteIdentity.canonicalOrigin).href,
    keywords,
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

export const InsightArticleJsonLd = ({ insight, locale = 'zh-CN' }: { insight: Insight; locale?: Locale }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: insightArticleStructuredData(insight, locale) }}
  />
);
