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

export type BreadcrumbInput = {
  path: string;
  locale: Locale;
  title: string;
};

const BREADCRUMB_PARENTS: Array<{ prefix: string; path: string; label: Record<Locale, string> }> = [
  { prefix: '/research/', path: '/research', label: { 'zh-CN': '研究方向', en: 'Research' } },
  { prefix: '/insights/', path: '/research', label: { 'zh-CN': '研究方向', en: 'Research' } },
  { prefix: '/activities/', path: '/activities', label: { 'zh-CN': '活动', en: 'Activities' } },
  { prefix: '/news/', path: '/news', label: { 'zh-CN': '最新动态', en: 'Latest updates' } },
  { prefix: '/products/', path: '/products', label: { 'zh-CN': '产品', en: 'Products' } },
  { prefix: '/company/', path: '/company', label: { 'zh-CN': '公司与业务', en: 'Company and business' } },
  { prefix: '/company/team/', path: '/company/team', label: { 'zh-CN': '团队', en: 'Team' } },
  { prefix: '/business/', path: '/business', label: { 'zh-CN': '并行业务', en: 'Business' } },
  { prefix: '/careers/', path: '/careers', label: { 'zh-CN': '加入 Elexvx', en: 'Join Elexvx' } },
];

/** Builds schema.org BreadcrumbList JSON-LD for non-root indexable pages. */
export const buildBreadcrumbStructuredData = ({ path, locale, title }: BreadcrumbInput): string => {
  const localePrefix = locale === 'en' ? '/en' : '';
  const toUrl = (targetPath: string) =>
    `${siteIdentity.canonicalOrigin}${localePrefix}${targetPath === '/' ? '/' : `${targetPath}/`}`;
  const items: Array<{ name: string; item: string }> = [{ name: locale === 'en' ? 'Home' : '首页', item: toUrl('/') }];
  for (const parent of BREADCRUMB_PARENTS) {
    if (path.startsWith(parent.prefix) && path !== parent.path) {
      items.push({ name: parent.label[locale], item: toUrl(parent.path) });
    }
  }
  const cleanTitle = localizeStructuredText(title, locale)
    .replace(/\s*·\s*Elexvx Research$/u, '')
    .trim();
  items.push({ name: cleanTitle, item: toUrl(path) });

  return serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  });
};

export type SoftwareProductInput = {
  path: string;
  locale: Locale;
  name: string;
  description: string;
  image?: string;
};

/** Builds schema.org SoftwareApplication JSON-LD for published product detail pages. */
export const buildSoftwareApplicationStructuredData = ({
  path,
  locale,
  name,
  description,
  image,
}: SoftwareProductInput): string => {
  const localePrefix = locale === 'en' ? '/en' : '';
  const url = `${siteIdentity.canonicalOrigin}${localePrefix}${path}/`;
  return serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: localizeStructuredText(name, locale),
    description: localizeStructuredText(description, locale),
    url,
    image: new URL(image || DEFAULT_SHARE_IMAGE_PATH, siteIdentity.canonicalOrigin).href,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web, Docker, Linux, macOS, Windows',
    publisher: { '@id': `${siteIdentity.canonicalOrigin}/#organization` },
    inLanguage: locale,
  });
};

export const JsonLdScript = ({ data }: { data: string }) =>
  createElement('script', { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: data } });
