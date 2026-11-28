import type { Metadata } from 'next';
import { siteIdentity } from '../../data/site';
import { CANONICAL_ORIGIN, DEFAULT_SHARE_IMAGE_PATH, ENGLISH_BRAND_NAME } from '../../data/site-origins';
import type { Locale } from '../providers/i18n';
import { localizedBrandName } from '../seo/structured-data';
import { translateEnglish } from '../translation';
import type { RouteMeta } from './routes';

export const BRAND_KEYWORDS = {
  'zh-CN': ['宏翔商道-Elexvx', '宏翔商道', 'Elexvx', '人工智能', '数据智能'],
  en: [ENGLISH_BRAND_NAME, 'Elexvx', 'AI', 'data intelligence'],
} as const;

export const ROOT_METADATA_DEFAULTS: Record<
  Locale,
  {
    brandName: string;
    pageTitle: string;
    title: string;
    description: string;
    keywords: readonly string[];
  }
> = {
  'zh-CN': {
    brandName: siteIdentity.seoName,
    pageTitle: '人工智能与数据智能研发',
    title: `${siteIdentity.seoName} — 人工智能与数据智能研发`,
    description: siteIdentity.seoDescription,
    keywords: BRAND_KEYWORDS['zh-CN'],
  },
  en: {
    brandName: ENGLISH_BRAND_NAME,
    pageTitle: 'AI & Data Intelligence R&D',
    title: `${ENGLISH_BRAND_NAME} — AI & Data Intelligence R&D`,
    description:
      'AI and data intelligence research, products, company news, and collaboration opportunities from Hongxiang Shangdao-Elexvx.',
    keywords: BRAND_KEYWORDS.en,
  },
};

const METADATA_LIMITS = {
  titleMin: { 'zh-CN': 18, en: 36 },
  descriptionMax: { 'zh-CN': 160, en: 180 },
  minClippedDescription: 48,
} as const;

const EXACT_TITLE_CONTEXTS: Record<string, Record<Locale, string>> = {
  '/activities': { 'zh-CN': '项目合作', en: 'Projects and partnerships' },
  '/business': { 'zh-CN': '企业服务', en: 'Enterprise services' },
  '/careers': { 'zh-CN': '岗位招聘', en: 'Open positions' },
  '/company': { 'zh-CN': '企业信息', en: 'Company information' },
  '/company/design': { 'zh-CN': '设计规范', en: 'Design standards' },
  '/company/qualifications': { 'zh-CN': '企业资质', en: 'Company credentials' },
  '/company/brand': { 'zh-CN': '品牌规范', en: 'Brand guidelines' },
  '/company/team': { 'zh-CN': '团队介绍', en: 'Team information' },
  '/contact': { 'zh-CN': '合作联系', en: 'Contact and collaboration' },
  '/navigation': { 'zh-CN': '企业服务导航', en: 'Enterprise service directory' },
  '/news': { 'zh-CN': '公司动态', en: 'Company updates' },
  '/products': { 'zh-CN': '产品项目', en: 'Products and projects' },
  '/research': { 'zh-CN': 'AI 与数据智能', en: 'AI and data intelligence' },
  '/services': { 'zh-CN': '服务中心', en: 'Service center' },
  '/status': { 'zh-CN': '服务状态', en: 'Service status' },
  '/status/history': { 'zh-CN': '服务状态历史', en: 'Service status history' },
};

const PREFIX_TITLE_CONTEXTS: Array<[prefix: string, labels: Record<Locale, string>]> = [
  ['/activities/', { 'zh-CN': '活动报道', en: 'Event report' }],
  ['/business/', { 'zh-CN': '业务介绍', en: 'Business overview' }],
  ['/careers/', { 'zh-CN': '岗位招聘', en: 'Open positions' }],
  ['/cases/', { 'zh-CN': '合作案例', en: 'Collaboration case study' }],
  ['/company/team/', { 'zh-CN': '成员介绍', en: 'Team profile' }],
  ['/news/', { 'zh-CN': '新闻公告', en: 'Company news' }],
  ['/products/', { 'zh-CN': '产品介绍', en: 'Product overview' }],
  ['/research/', { 'zh-CN': '研究文章', en: 'Research article' }],
  ['/insights/', { 'zh-CN': '研究记录', en: 'Research notes' }],
];

const DEFAULT_TITLE_CONTEXT: Record<Locale, string> = {
  'zh-CN': '公司信息',
  en: 'Company information',
};

const normalizedPageName = (pageName: string) =>
  pageName
    .replace(
      /\s*(?:\||｜|·)\s*(?:宏翔商道(?:-Elexvx)?(?:\s*\/\s*Elexvx)?|Hongxiang Shangdao-Elexvx|Elexvx Research|宏翔商道企业服务导航)$/iu,
      ''
    )
    .trim();

export const brandedPageTitle = (pageName: string, locale: Locale = 'zh-CN') =>
  `${localizedBrandName(locale)} — ${normalizedPageName(pageName)}`;

export const brandedHomepageTitle = brandedPageTitle;

const titleContext = (path: string, locale: Locale): string => {
  const exact = EXACT_TITLE_CONTEXTS[path];
  if (exact) return exact[locale];
  const matched = PREFIX_TITLE_CONTEXTS.find(([prefix]) => path.startsWith(prefix));
  return matched ? matched[1][locale] : DEFAULT_TITLE_CONTEXT[locale];
};

const localizedText = (value: string, locale: Locale) => (locale === 'en' ? translateEnglish(value) : value);

const localizedTitle = (title: string, locale: Locale) => {
  const [section, ...rest] = title.split(' · ');
  const translated = localizedText(section, locale);
  return translated !== section ? [translated, ...rest].join(' · ') : localizedText(title, locale);
};

const pageTitle = (title: string) => title.replace(/\s*·\s*Elexvx Research$/u, '').trim();

const enrichTitle = (title: string, path: string, locale: Locale) => {
  if (path === '/' || title.length >= METADATA_LIMITS.titleMin[locale]) return title;
  const context = titleContext(path, locale);
  return title.includes(context) ? title : `${title} — ${context}`;
};

const withBrandDescription = (description: string, locale: Locale) => {
  const brand = localizedBrandName(locale);
  const normalized = description.trim();
  if (normalized.includes(brand)) return normalized;
  const suffix = locale === 'en' ? ` Official website of ${brand}.` : ` ${brand}官方网站。`;
  return normalized.length + suffix.length <= METADATA_LIMITS.descriptionMax[locale]
    ? `${normalized}${suffix}`
    : normalized;
};

const clipText = (text: string, limit: number, locale: Locale) => {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit - 1).trim();
  const sentenceEnd = Math.max(slice.lastIndexOf('。'), slice.lastIndexOf('. '));
  if (sentenceEnd >= Math.floor(limit * 0.65)) {
    return slice.slice(0, sentenceEnd + 1).trim();
  }
  const clipped = (locale === 'en' ? slice.replace(/\s+\S*$/u, '') : slice.replace(/[，、；：,.;:\s]+$/u, '')).trim();
  return `${clipped || slice}…`;
};

const compactDescription = (description: string, _title: string, locale: Locale) =>
  clipText(description.trim(), METADATA_LIMITS.descriptionMax[locale], locale);

const enrichDescription = (description: string, title: string, _path: string, locale: Locale) =>
  compactDescription(description, title, locale);

const buildMetadataAlternates = (path: string, canonical: string): NonNullable<Metadata['alternates']> => {
  const suffix = path === '/' ? '/' : `${path}/`;
  const chinesePath = `${siteIdentity.canonicalOrigin}${suffix}`;
  const englishPath = `${siteIdentity.canonicalOrigin}/en${suffix}`;
  return {
    canonical,
    languages: {
      'zh-CN': chinesePath,
      en: englishPath,
      'x-default': chinesePath,
    },
  };
};

const buildMetadataRobots = (isNoIndex: boolean): NonNullable<Metadata['robots']> => ({
  index: !isNoIndex,
  follow: !isNoIndex,
  googleBot: {
    index: !isNoIndex,
    follow: !isNoIndex,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
});

const buildSocialMetadata = ({
  meta,
  title,
  description,
  canonical,
  brandName,
  locale,
}: {
  meta: RouteMeta;
  title: string;
  description: string;
  canonical: string;
  brandName: string;
  locale: Locale;
}): Pick<Metadata, 'openGraph' | 'twitter'> => {
  const image = new URL(meta.image || DEFAULT_SHARE_IMAGE_PATH, siteIdentity.canonicalOrigin).href;
  const articleAuthor = meta.author && locale === 'en' ? brandName : meta.author;
  const openGraphArticle =
    meta.openGraphType === 'article'
      ? {
          type: 'article' as const,
          ...(meta.publishedAt ? { publishedTime: meta.publishedAt } : {}),
          ...(meta.updatedAt ? { modifiedTime: meta.updatedAt } : {}),
          ...(articleAuthor ? { authors: [articleAuthor] } : {}),
        }
      : { type: 'website' as const };

  return {
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    openGraph: {
      title,
      description,
      url: canonical,
      ...openGraphArticle,
      siteName: brandName,
      images: [{ url: image, alt: title }],
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
    },
  };
};

export const metadataForRoute = (meta: RouteMeta, path: string, locale: Locale = 'zh-CN'): Metadata => {
  const localePath = locale === 'en' ? `/en${path === '/' ? '' : path}` : path;
  const canonical = `${siteIdentity.canonicalOrigin}${localePath === '/' ? '/' : `${localePath}/`}`;
  const localizedPageTitle = pageTitle(
    locale === 'en' && meta.titleEn ? meta.titleEn : localizedTitle(meta.title, locale)
  );
  const brandName = localizedBrandName(locale);
  const title =
    path === '/'
      ? brandedHomepageTitle(ROOT_METADATA_DEFAULTS[locale].pageTitle, locale)
      : brandedPageTitle(enrichTitle(localizedPageTitle, path, locale), locale);
  const description = enrichDescription(
    withBrandDescription(
      locale === 'en' && meta.descriptionEn ? meta.descriptionEn : localizedText(meta.description, locale),
      locale
    ),
    localizedPageTitle,
    path,
    locale
  );

  return {
    title: { absolute: title },
    description,
    applicationName: brandName,
    keywords: [...BRAND_KEYWORDS[locale]],
    authors: [{ name: brandName, url: siteIdentity.canonicalOrigin }],
    creator: brandName,
    publisher: brandName,
    robots: buildMetadataRobots(meta.robots === 'noindex,nofollow'),
    alternates: buildMetadataAlternates(path, canonical),
    ...buildSocialMetadata({ meta, title, description, canonical, brandName, locale }),
  };
};

/** Builds localized metadata and reciprocal hreflang alternates for service utility pages. */
export const serviceMetadata = ({
  title,
  description,
  path,
  locale = 'zh-CN',
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
}): Metadata => {
  const brand = localizedBrandName(locale);
  const pageTitleText = brandedPageTitle(title, locale);
  const normalizedBasePath = path.replace(/\/+$/, '') || '/';
  const localizedPath = locale === 'en' ? `/en${path.startsWith('/') ? path : `/${path}`}` : path;
  const canonical = `${CANONICAL_ORIGIN}${localizedPath}`;
  const enrichedDescription = enrichDescription(
    withBrandDescription(description, locale),
    normalizedPageName(title),
    normalizedBasePath,
    locale
  );
  return {
    title: { absolute: pageTitleText },
    description: enrichedDescription,
    applicationName: brand,
    keywords: [...BRAND_KEYWORDS[locale]],
    authors: [{ name: brand, url: siteIdentity.canonicalOrigin }],
    creator: brand,
    publisher: brand,
    alternates: buildMetadataAlternates(normalizedBasePath, canonical),
    openGraph: {
      title: pageTitleText,
      description: enrichedDescription,
      url: canonical,
      siteName: brand,
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitleText,
      description: enrichedDescription,
      images: [DEFAULT_SHARE_IMAGE_PATH],
    },
    robots: buildMetadataRobots(false),
  };
};
