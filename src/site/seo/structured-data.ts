import { createElement } from 'react';
import { primaryContactEmail } from '../../data/contact';
import { siteIdentity } from '../../data/site';
import { DEFAULT_SHARE_IMAGE_PATH, ENGLISH_BRAND_NAME } from '../../data/site-origins';
import type { Locale } from '../providers/i18n';
import { translateEnglish } from '../translation';

export const localizedBrandName = (locale: Locale): string =>
  locale === 'en' ? ENGLISH_BRAND_NAME : siteIdentity.seoName;

export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

export const localizeStructuredText = (value: string, locale: Locale): string =>
  locale === 'en' ? translateEnglish(value) : value;

type ArticleStructuredDataInput = {
  type: 'Article' | 'NewsArticle';
  path: string;
  locale: Locale;
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt?: string;
  cover?: string;
  section?: string;
  keywords: string[];
  authorName?: string;
};

/** Builds schema.org Article / NewsArticle JSON-LD safely for inline script tags. */
export const buildArticleStructuredData = ({
  type,
  path,
  locale,
  title,
  description,
  publishedAt,
  modifiedAt,
  cover,
  section,
  keywords,
  authorName,
}: ArticleStructuredDataInput): string => {
  const localePrefix = locale === 'en' ? '/en' : '';
  const url = `${siteIdentity.canonicalOrigin}${localePrefix}${path}`;
  return serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#article`,
    headline: localizeStructuredText(title, locale),
    description: localizeStructuredText(description, locale),
    datePublished: publishedAt,
    ...(modifiedAt ? { dateModified: modifiedAt } : {}),
    mainEntityOfPage: url,
    url,
    image: new URL(cover || DEFAULT_SHARE_IMAGE_PATH, siteIdentity.canonicalOrigin).href,
    ...(section ? { articleSection: localizeStructuredText(section, locale) } : {}),
    keywords,
    author: {
      '@type': 'Organization',
      name: authorName || localizedBrandName(locale),
      url: `${siteIdentity.canonicalOrigin}${localePrefix}/company/`,
    },
    publisher: { '@id': `${siteIdentity.canonicalOrigin}/#organization` },
    isPartOf: { '@id': `${siteIdentity.canonicalOrigin}/#website` },
    inLanguage: locale,
  });
};

export const siteStructuredData = (locale: Locale = 'zh-CN'): string => {
  const isEn = locale === 'en';
  const organizationId = `${siteIdentity.canonicalOrigin}/#organization`;
  const name = isEn ? ENGLISH_BRAND_NAME : siteIdentity.seoName;
  const description = isEn ? translateEnglish(siteIdentity.seoDescription) : siteIdentity.seoDescription;
  return serializeJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name,
        legalName: isEn
          ? 'Hongxiang Shangdao (Nanjing) Technology Development Co., Ltd.'
          : '宏翔商道（南京）科技发展有限公司',
        alternateName: isEn ? ['Hongxiang Shangdao', 'Elexvx'] : ['宏翔商道', 'Elexvx'],
        description,
        url: isEn ? `${siteIdentity.canonicalOrigin}/en/` : `${siteIdentity.canonicalOrigin}/`,
        logo: `${siteIdentity.canonicalOrigin}/brand/elexvx-logo-black-600.webp`,
        email: primaryContactEmail,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteIdentity.canonicalOrigin}/#website`,
        name,
        alternateName: isEn ? ['Hongxiang Shangdao', 'Elexvx'] : ['宏翔商道', 'Elexvx'],
        description,
        url: isEn ? `${siteIdentity.canonicalOrigin}/en/` : `${siteIdentity.canonicalOrigin}/`,
        publisher: { '@id': organizationId },
        inLanguage: isEn ? ['en', 'zh-CN'] : ['zh-CN', 'en'],
      },
    ],
  });
};

export const JsonLdScript = ({ data }: { data: string }) =>
  createElement('script', { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: data } });
