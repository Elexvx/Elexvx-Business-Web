import type { Metadata } from 'next';
import { translateEnglish } from '../translation';
import { siteIdentity } from '../../data/site';
import type { Locale } from '../providers/i18n';
import type { RouteMeta } from './routes';

const englishMetadata: Record<string, string> = {
  'Elexvx Research': 'Elexvx Research',
  '宏翔商道-Elexvx（宏翔商道）是一家以人工智能与数据智能为核心的跨行业研发企业，官网发布研究成果、产品项目、公司业务、新闻公告与合作信息，持续回应真实世界的复杂技术问题。':
    'Hongxiang Shangdao-Elexvx is an AI and data intelligence R&D company publishing research, products, company news, and collaboration opportunities.',
  '面向真实世界复杂问题的 AI 与数据智能研发门户。':
    'An AI and data-intelligence research portal for complex real-world problems.',
  研究方向: 'Research',
  研发能力: 'Capabilities',
  产品与成果: 'Projects',
  行业场景: 'Scenarios',
  技术文章: 'Insights',
  最新动态: 'Latest updates',
  公司与业务: 'Company and business',
  团队: 'Team',
  品牌: 'Brand',
  并行业务: 'Business',
  加入我们: 'Careers',
  开放合作: 'Collaborate',
  旧文归档: 'Archive',
  'AI 与数据智能、工业智能与安全、LLM / AI 安全三个并列研究方向。':
    'Three parallel research directions: AI and data intelligence, industrial intelligence and safety, and LLM / AI safety.',
  '从问题定义、数据与模型，到真实场景验证的研发方法。':
    'An R&D method spanning problem framing, data and models, and validation in real contexts.',
  '以项目、产品和系统原型说明研究如何进入现实。':
    'Projects, products, and system prototypes showing how research enters reality.',
  '以行业场景组织真实问题，而不是用服务标签替代现场理解。':
    'Real problems organized by context rather than service labels.',
  'Elexvx Research 的研究记录、工程方法与技术文章。':
    'Research notes, engineering methods, and technical articles from Elexvx Research.',
  '宏翔商道 / Elexvx 与 Elexvx Research 的公司主体、研究关系和并行业务。':
    'The company, research relationship, and parallel business lines of Hongxiang Shangdao / Elexvx and Elexvx Research.',
  'Elexvx Research 的研究与工程协作结构。': 'The research and engineering collaboration structure of Elexvx Research.',
  'Elexvx 与 Elexvx Research 的网页品牌使用方式。': 'Web brand usage for Elexvx and Elexvx Research.',
  'Elexvx 公司主体的人力、知识产权和供应链并行业务。':
    'Human resources, intellectual property, and supply-chain business lines operated by Elexvx.',
  '加入关注真实问题、技术研发和工程系统的团队。':
    'Join a team focused on real problems, technical R&D, and engineered systems.',
  '从一个真实的技术问题开始，开启研究合作。': 'Begin a research collaboration with a real technical problem.',
  '旧站内容归档，不代表 Elexvx Research 的新研究主线。':
    'An archive of legacy material that does not represent the new Elexvx Research direction.',
  '宏翔商道 / Elexvx 的公司公告、业务动态与历史新闻。':
    'Company announcements, business updates, and historical news from Hongxiang Shangdao / Elexvx.',
  '宏翔商道-Elexvx 的公司公告、业务动态与历史新闻。':
    'Company announcements, business updates, and historical news from Hongxiang Shangdao-Elexvx.',
  '宏翔商道-Elexvx 与 Elexvx Research 的公司主体、研究关系和并行业务。':
    'The operating company, research relationship, and parallel business lines of Hongxiang Shangdao-Elexvx and Elexvx Research.',
  '宏翔商道-Elexvx 企业资质与证书展示。': 'Company qualifications and certificates for Hongxiang Shangdao-Elexvx.',
  'AI 与数据智能': 'AI & Data Intelligence',
  工业智能与安全: 'Industrial Intelligence & Safety',
  'LLM / AI 安全': 'LLM / AI Safety',
  '围绕数据理解、模型构建与系统反馈，探索能够进入真实工作流的智能能力。':
    'Exploring intelligent capabilities that enter real workflows through data understanding, model building, and system feedback.',
  '面向设备、作业和环境的变化，研究可感知、可预警、可追溯的工业系统。':
    'Researching industrial systems that sense, anticipate, and trace changes across equipment, operations, and environments.',
  '关注大模型应用中的安全边界、工程基础设施与面向人的责任设计。':
    'Researching safety boundaries, engineering infrastructure, and human-centered responsibility in LLM applications.',
  起重设备智能安全管理: 'Intelligent Safety Management for Lifting Equipment',
  '一套面向起重设备全生命周期的智能安全管理系统原型。':
    'A prototype intelligent safety management system for the full lifecycle of lifting equipment.',
  工业现场与设备运营: 'Industrial Operations',
  知识工作与复杂决策: 'Knowledge Work and Complex Decisions',
  '负责任的 AI 应用': 'Responsible AI Applications',
  '当设备、环境和人员同时变化，系统需要持续感知并帮助人做出判断。':
    'When equipment, environments, and people change together, systems must sense continuously and support human judgment.',
  '将分散的信息组织成清晰的上下文，让人和智能系统共同推进工作。':
    'Organize fragmented information into clear context so people and intelligent systems can work together.',
  '在能力、可解释性、安全边界与人的控制之间建立可被理解的关系。':
    'Make the relationship between capability, explainability, safety boundaries, and human control understandable.',
  人力资源服务: 'Human Resources',
  知识产权服务: 'Intellectual Property',
  供应链服务: 'Supply Chain',
  '与组织和人才相关的服务能力，作为公司并行业务独立呈现。':
    'Organization and talent services presented as an independent company business line.',
  '围绕品牌与知识产权资产的专业服务。': 'Professional services for brand and intellectual-property assets.',
  '面向商贸与供应链流程的业务能力。': 'Business capabilities for trade and supply-chain operations.',
  '先定义问题，再选择模型': 'Define the Problem Before Choosing the Model',
  让设备数据回到现场: 'Bring Equipment Data Back into Operations',
  '研究的起点不是模型名称，而是一个可以被描述、被验证、被继续追问的问题。':
    'Research starts not with a model name, but with a question that can be described, tested, and examined further.',
  '工业智能的第一步，不是增加一个仪表盘，而是让分散的现场信号重新进入同一个判断过程。':
    'The first step in industrial intelligence is not another dashboard, but bringing fragmented field signals back into one decision process.',
  未找到页面: 'Page not found',
  '这个路径还没有内容。': 'There is no content at this path yet.',
};

const translateMetadata = (value: string, locale: Locale) =>
  locale === 'en' ? (englishMetadata[value] ?? translateEnglish(value)) : value;

const brandKeywords = {
  'zh-CN': ['宏翔商道-Elexvx', '宏翔商道', 'Elexvx', '人工智能', '数据智能'],
  en: ['Hongxiang Shangdao-Elexvx', 'Elexvx', 'AI', 'data intelligence'],
} as const;

const localizedBrandName = (locale: Locale) => (locale === 'en' ? 'Hongxiang Shangdao-Elexvx' : siteIdentity.seoName);

const normalizedPageName = (pageName: string) =>
  pageName
    .replace(
      /\s*(?:\||｜|·)\s*(?:宏翔商道(?:-Elexvx)?(?:\s*\/\s*Elexvx)?|Hongxiang Shangdao-Elexvx|Elexvx Research|宏翔商道企业服务导航)$/iu,
      ''
    )
    .trim();

export const brandedPageTitle = (pageName: string, locale: Locale = 'zh-CN') =>
  `${localizedBrandName(locale)} — ${normalizedPageName(pageName)}`;

export const brandedHomepageTitle = (pageName: string, locale: Locale = 'zh-CN') =>
  `${localizedBrandName(locale)} — ${normalizedPageName(pageName)}`;

const titleContext = (path: string, locale: Locale) => {
  const contexts =
    locale === 'en'
      ? {
          activities: 'Projects and partnerships',
          activityArticle: 'Event report',
          business: 'Enterprise services',
          businessArticle: 'Business overview',
          careers: 'Open positions',
          cases: 'Collaboration case study',
          company: 'Company information',
          design: 'Design standards',
          qualifications: 'Company credentials',
          brand: 'Brand guidelines',
          team: 'Team information',
          teamMember: 'Team profile',
          contact: 'Contact and collaboration',
          news: 'Company updates',
          newsArticle: 'Company news',
          products: 'Products and projects',
          product: 'Product overview',
          research: 'AI and data intelligence',
          researchArticle: 'Research article',
          insights: 'Research notes',
        }
      : {
          activities: '项目合作',
          activityArticle: '活动报道',
          business: '企业服务',
          businessArticle: '业务介绍',
          careers: '岗位招聘',
          cases: '合作案例',
          company: '企业信息',
          design: '设计规范',
          qualifications: '企业资质',
          brand: '品牌规范',
          team: '团队介绍',
          teamMember: '成员介绍',
          contact: '合作联系',
          news: '公司动态',
          newsArticle: '新闻公告',
          products: '产品项目',
          product: '产品介绍',
          research: 'AI 与数据智能',
          researchArticle: '研究文章',
          insights: '研究记录',
        };

  if (path === '/activities') return contexts.activities;
  if (path.startsWith('/activities/')) return contexts.activityArticle;
  if (path === '/business') return contexts.business;
  if (path.startsWith('/business/')) return contexts.businessArticle;
  if (path === '/careers') return contexts.careers;
  if (path.startsWith('/careers/')) return contexts.careers;
  if (path.startsWith('/cases/')) return contexts.cases;
  if (path === '/company') return contexts.company;
  if (path === '/company/design') return contexts.design;
  if (path === '/company/qualifications') return contexts.qualifications;
  if (path === '/company/brand') return contexts.brand;
  if (path === '/company/team') return contexts.team;
  if (path.startsWith('/company/team/')) return contexts.teamMember;
  if (path === '/contact') return contexts.contact;
  if (path === '/news') return contexts.news;
  if (path.startsWith('/news/')) return contexts.newsArticle;
  if (path === '/products') return contexts.products;
  if (path.startsWith('/products/')) return contexts.product;
  if (path === '/research') return contexts.research;
  if (path.startsWith('/research/')) return contexts.researchArticle;
  if (path === '/insights') return contexts.insights;
  if (path.startsWith('/insights/')) return contexts.insights;
  return locale === 'en' ? 'Company information' : '公司信息';
};

const localizedTitle = (title: string, locale: Locale) => {
  const [section, ...rest] = title.split(' · ');
  const translated = translateMetadata(section, locale);
  return translated !== section ? [translated, ...rest].join(' · ') : locale === 'en' ? translateEnglish(title) : title;
};

const pageTitle = (title: string) => title.replace(/\s*·\s*Elexvx Research$/u, '').trim();

const enrichTitle = (title: string, path: string, locale: Locale) => {
  const minimumTitleLength = locale === 'en' ? 36 : 18;
  if (path === '/' || title.length >= minimumTitleLength) return title;
  const context = titleContext(path, locale);
  return title.includes(context) ? title : `${title} — ${context}`;
};

const withBrandDescription = (description: string, locale: Locale) => {
  const brand = locale === 'en' ? 'Hongxiang Shangdao-Elexvx' : siteIdentity.seoName;
  if (description.includes(brand)) return description;
  return locale === 'en' ? `${description} Official website of ${brand}.` : `${description} ${brand}官方网站。`;
};

const compactDescription = (description: string, title: string, locale: Locale) => {
  const maximumLength = locale === 'en' ? 180 : 160;
  if (description.length <= maximumLength) return description;

  const brand = localizedBrandName(locale);
  const pageContext = locale === 'en' ? ` Page focus: ${title}.` : ` 页面主题：“${title}”。`;
  const brandSuffix = locale === 'en' ? ` Official website of ${brand}.` : ` ${brand}官方网站。`;
  const source = description.replace(pageContext, '').replace(brandSuffix, '').trim();
  const suffix = `${pageContext}${brandSuffix}`;
  const availableLength = Math.max(24, maximumLength - suffix.length - 1);
  const clipped = source
    .slice(0, availableLength)
    .trim()
    .replace(/\s+\S*$/u, '')
    .trim();
  return `${clipped}…${suffix}`;
};

const enrichDescription = (description: string, title: string, path: string, locale: Locale) => {
  if (path === '/') return description;
  const minimumDescriptionLength = locale === 'en' ? 120 : 80;
  const pageContext = locale === 'en' ? `Page focus: ${title}.` : `页面主题：“${title}”。`;
  const shouldAddPageContext = path.startsWith('/news/') || description.length < minimumDescriptionLength;
  const contextualDescription =
    shouldAddPageContext && !description.includes(title) ? `${description} ${pageContext}` : description;
  if (contextualDescription.length >= minimumDescriptionLength)
    return compactDescription(contextualDescription, title, locale);
  const brand = localizedBrandName(locale);
  const context = titleContext(path, locale).toLowerCase();
  const supplement =
    locale === 'en'
      ? ` This official ${context} page provides relevant background and contact information from ${brand}.`
      : `本页属于${context}，提供官方背景、公开资料与相关联系入口，帮助了解主题内容及后续合作方式，信息以${brand}官方网站发布内容为准。`;
  return compactDescription(`${contextualDescription}${supplement}`, title, locale);
};

export const metadataForRoute = (meta: RouteMeta, path: string, locale: Locale = 'zh-CN'): Metadata => {
  const localePath = locale === 'en' ? `/en${path === '/' ? '' : path}` : path;
  const canonical = `${siteIdentity.canonicalOrigin}${localePath === '/' ? '/' : `${localePath}/`}`;
  const isNoIndex = meta.robots === 'noindex,nofollow';
  const localizedPageTitle = pageTitle(localizedTitle(meta.title, locale));
  const brandName = localizedBrandName(locale);
  const articleAuthor = meta.author && locale === 'en' ? brandName : meta.author;
  const title =
    path === '/'
      ? brandedHomepageTitle(locale === 'en' ? 'AI & Data Intelligence R&D' : '人工智能与数据智能研发', locale)
      : brandedPageTitle(enrichTitle(localizedPageTitle, path, locale), locale);
  const description = enrichDescription(
    withBrandDescription(translateMetadata(meta.description, locale), locale),
    localizedPageTitle,
    path,
    locale
  );
  const chinesePath = `${siteIdentity.canonicalOrigin}${path === '/' ? '/' : `${path}/`}`;
  const englishPath = `${siteIdentity.canonicalOrigin}/en${path === '/' ? '/' : `${path}/`}`;

  const image = new URL(meta.image || '/share/elexvx.png', siteIdentity.canonicalOrigin).href;
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
    title: { absolute: title },
    description,
    applicationName: brandName,
    keywords: [...brandKeywords[locale]],
    authors: [{ name: brandName, url: siteIdentity.canonicalOrigin }],
    creator: brandName,
    publisher: brandName,
    robots: {
      index: !isNoIndex,
      follow: !isNoIndex,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        'zh-CN': chinesePath,
        en: englishPath,
        'x-default': chinesePath,
      },
    },
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
