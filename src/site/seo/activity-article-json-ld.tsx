import type { Activity } from '../../data/activities';
import { siteIdentity } from '../../data/site';
import type { Locale } from '../providers/i18n';
import { translateEnglish } from '../translation';

export const activityArticleStructuredData = (
  item: Activity,
  section: 'research' | 'activities',
  locale: Locale = 'zh-CN'
) => {
  const prefix = locale === 'en' ? '/en' : '';
  const url = `${siteIdentity.canonicalOrigin}${prefix}/${section}/${item.slug}/`;
  const localized = (value: string) => (locale === 'en' ? translateEnglish(value) : value);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: localized(item.title),
    description: localized(item.excerpt),
    datePublished: item.publishedAt,
    dateModified: item.updatedAt || item.publishedAt,
    mainEntityOfPage: url,
    url,
    image: new URL(item.cover || '/share/elexvx.png', siteIdentity.canonicalOrigin).href,
    ...(item.category ? { articleSection: localized(item.category) } : {}),
    keywords: locale === 'en' ? item.keywordsEn || [] : item.keywords || [],
    author: {
      '@type': 'Organization',
      name: localized(item.author) || (locale === 'en' ? 'Hongxiang Shangdao-Elexvx' : siteIdentity.seoName),
      url: `${siteIdentity.canonicalOrigin}${prefix}/company/`,
    },
    publisher: { '@id': `${siteIdentity.canonicalOrigin}/#organization` },
    isPartOf: { '@id': `${siteIdentity.canonicalOrigin}/#website` },
    inLanguage: locale,
  }).replace(/</g, '\\u003c');
};

export const ActivityArticleJsonLd = ({
  item,
  section,
  locale,
}: {
  item: Activity;
  section: 'research' | 'activities';
  locale: Locale;
}) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: activityArticleStructuredData(item, section, locale) }}
  />
);
