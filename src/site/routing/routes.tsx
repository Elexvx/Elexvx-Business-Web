import { publishedResearch } from '../../data/research-articles';
import {
  articleCategories,
  articleCategoryId,
  articleCategoryPath,
  type ArticleSection,
} from '../../data/article-categories';
import { newsInCategory, newsPageCount, newsPageHref } from '../../data/news-pagination';
import { translateEnglish } from '../translation';
import { homeContent } from '../../data/page-content';
import { isHumiteProductPath } from '../../data/humite-launch.mjs';
import { startCollaborationAction } from '../../data/contact';
import { jobs } from '../../data/jobs';
import { publishedActivities, toActivitySummary } from '../../data/activities';
import { publishedCaseStudies, toCaseStudySummary } from '../../data/case-studies';
import { isDisabledPath } from '../../data/disabled-sections';
import redirects from '../../server/esa/redirects.json';
import type { ReactNode } from 'react';
import { teamMembers } from '../../data/team';
import { businessLines, projects, researchDirections, scenarios, siteIdentity } from '../../data/site';
import type { Insight, NewsItem } from '../../content/types';
import { ActivitiesPage, ActivityPage } from '../pages/activities';
import { CareersPage, JobPage } from '../pages/careers';
import { CaseStudyPage } from '../pages/case-studies';
import { BrandPage, BusinessLinePage, BusinessPage, CompanyPage, ContactPage } from '../pages/company';
import { DesignPage } from '../pages/design';
import { HomePage } from '../pages/home';
import { ProductCatalogPage, ProductDetailPage } from '../pages/product-catalog';
import { CapabilitiesPage, ProjectPage, ProjectsPage, ScenarioPage, ScenariosPage } from '../pages/projects';
import { ArchivePage, InsightPage, NewsItemPage, NewsPage } from '../pages/publications';
import { QualificationsPage } from '../pages/qualifications';
import { ResearchDirectionPage, ResearchPage } from '../pages/research';
import { NotFoundPage } from '../pages/shared';
import { SitemapPage } from '../pages/sitemap';
import { TeamMemberPage, TeamPage } from '../pages/team';

export type RouteMeta = {
  title: string;
  description: string;
  titleEn?: string;
  descriptionEn?: string;
  image?: string;
  robots?: 'index,follow' | 'noindex,nofollow';
  openGraphType?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
};

type SiteRoute = {
  path: string;
  meta: RouteMeta;
  render: () => ReactNode;
};

type RedirectRule = {
  source: string;
  destination: string;
  has?: Array<{ type: string }>;
};

const researchItems = publishedResearch.map(toActivitySummary);
const activityItems = publishedActivities.map(toActivitySummary);
const caseStudyItems = publishedCaseStudies.map(toCaseStudySummary);

const latestContentDate = (items: ReadonlyArray<{ publishedAt: string; updatedAt?: string }>) =>
  items
    .map((item) => item.updatedAt || item.publishedAt)
    .sort()
    .at(-1);

const articleMeta = (item: {
  title: string;
  excerpt: string;
  cover?: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
}): RouteMeta => ({
  title: item.title,
  description: item.excerpt,
  image: item.cover,
  openGraphType: 'article',
  publishedAt: item.publishedAt,
  ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
  author: item.author,
});

const categoryRoutes = (section: Exclude<ArticleSection, 'news'>): SiteRoute[] => {
  const items = section === 'research' ? researchItems : activityItems;
  const sectionLabel = section === 'research' ? '研究' : '活动';
  return articleCategories(section, items).map(({ id, label }) => ({
    path: articleCategoryPath(section, id).replace(/\/$/, ''),
    meta: {
      title: `${label} · ${sectionLabel}`,
      titleEn: `${translateEnglish(label)} · ${translateEnglish(sectionLabel)}`,
      description: `浏览 Elexvx 已发布的${label}${sectionLabel}内容、文章摘要与发布时间。`,
      descriptionEn: `Browse published ${translateEnglish(label)} ${translateEnglish(sectionLabel).toLowerCase()} from Elexvx, including article summaries and publication dates.`,
      updatedAt: latestContentDate(items.filter((item) => articleCategoryId(section, item) === id)),
    },
    render: () =>
      section === 'research' ? (
        <ResearchPage items={researchItems} initialCategory={id} />
      ) : (
        <ActivitiesPage items={activityItems} initialCategory={id} />
      ),
  }));
};

const newsListRoutes = (news: NewsItem[]): SiteRoute[] => {
  const published = news.filter((item) => item.status === 'published');
  return [{ id: 'all', label: '最新动态' }, ...articleCategories('news', published)].flatMap(({ id, label }) => {
    const items = newsInCategory(published, id);
    const all = id === 'all';
    const title = all ? label : `${label} · 新闻`;
    const titleEn = all ? translateEnglish(label) : `${translateEnglish(label)} · News`;
    const description = all
      ? '宏翔商道-Elexvx 的公司公告、业务动态与历史新闻。'
      : `浏览 Elexvx 已发布的${label}新闻内容、文章摘要与发布时间。`;
    const descriptionEn = all
      ? translateEnglish(description)
      : `Browse published ${translateEnglish(label)} news from Elexvx, including article summaries and publication dates.`;
    const updatedAt = latestContentDate(items);

    return Array.from({ length: newsPageCount(items.length) }, (_, index) => {
      const page = index + 1;
      return {
        path: newsPageHref(id, page).slice(0, -1),
        meta: {
          title: page === 1 ? title : `${title} · 第 ${page} 页`,
          titleEn: page === 1 ? titleEn : `${titleEn} · Page ${page}`,
          description,
          descriptionEn,
          updatedAt,
        },
        render: () => <NewsPage initialCategory={id} page={page} />,
      };
    });
  });
};

const staticRoutes: SiteRoute[] = [
  {
    path: '/activities',
    meta: {
      title: '活动',
      description: 'Elexvx 活动记录与交流。',
      updatedAt: latestContentDate(activityItems),
    },
    render: () => <ActivitiesPage items={activityItems} />,
  },
  {
    path: '/',
    meta: { title: siteIdentity.researchName, description: siteIdentity.seoDescription },
    render: () => <HomePage activities={activityItems} research={researchItems} />,
  },
  {
    path: '/research',
    meta: {
      title: '研究方向',
      description: '浏览全部已发布的研究文章。',
      updatedAt: latestContentDate(researchItems),
    },
    render: () => <ResearchPage items={researchItems} />,
  },
  {
    path: '/capabilities',
    meta: { title: '研发能力', description: '从问题定义、数据与模型，到真实场景验证的研发方法。' },
    render: () => <CapabilitiesPage />,
  },
  {
    path: '/projects',
    meta: { title: '产品与成果', description: '以项目、产品和系统原型说明研究如何进入现实。' },
    render: () => <ProjectsPage />,
  },
  {
    path: '/scenarios',
    meta: { title: '行业场景', description: '以行业场景组织真实问题，而不是用服务标签替代现场理解。' },
    render: () => <ScenariosPage />,
  },
  {
    path: '/company',
    meta: {
      title: '公司与业务',
      description: '宏翔商道-Elexvx 与 Elexvx Research 的公司主体、研究关系和并行业务。',
    },
    render: () => <CompanyPage />,
  },
  {
    path: '/company/team',
    meta: { title: '团队', description: 'Elexvx Research 的研究与工程协作结构。' },
    render: () => <TeamPage />,
  },
  {
    path: '/company/design',
    meta: {
      title: '设计规范',
      description: 'Elexvx 官网的标题、页面布局、间距与响应式设计规范，提供 design.md 下载。',
    },
    render: () => <DesignPage />,
  },
  {
    path: '/company/qualifications',
    meta: { title: '企业资质', description: '宏翔商道-Elexvx 企业资质与证书展示。' },
    render: () => <QualificationsPage />,
  },
  {
    path: '/company/brand',
    meta: { title: '品牌', description: 'Elexvx 与 Elexvx Research 的网页品牌使用方式。' },
    render: () => <BrandPage />,
  },
  {
    path: '/business',
    meta: { title: '并行业务', description: 'Elexvx 公司主体的人力、知识产权和供应链并行业务。' },
    render: () => <BusinessPage />,
  },
  {
    path: '/careers',
    meta: { title: '加入 Elexvx', description: '加入关注真实问题、技术研发和工程系统的团队。' },
    render: () => <CareersPage />,
  },
  {
    path: '/contact',
    meta: { title: startCollaborationAction.label, description: '从一个真实的技术问题开始，开启研究合作。' },
    render: () => <ContactPage />,
  },
  {
    path: '/archive',
    meta: {
      title: '旧文归档',
      description: '旧站内容归档，不代表 Elexvx Research 的新研究主线。',
      robots: 'noindex,nofollow',
    },
    render: () => <ArchivePage />,
  },
];

export const redirectRoutes: Record<string, string> = Object.fromEntries(
  (redirects as RedirectRule[])
    .filter(({ has, source, destination }) => !has?.length && !isDisabledPath(source) && !isDisabledPath(destination))
    .filter(
      ({ destination }) => process.env.NEXT_PUBLIC_HUMITE_PUBLISHED === 'true' || !isHumiteProductPath(destination)
    )
    .map(({ source, destination }) => [source, destination])
);

const staticSectionRoutes = (news: NewsItem[]): SiteRoute[] => [
  ...staticRoutes,
  ...categoryRoutes('research'),
  ...categoryRoutes('activities'),
  ...newsListRoutes(news),
];

const productRoutes = (): SiteRoute[] => [
  {
    path: '/products',
    meta: { title: '产品', description: '了解 Elexvx 的产品。' },
    render: () => <ProductCatalogPage />,
  },
  ...homeContent.product.items.map((product) => ({
    path: product.href,
    meta: { title: product.name, description: product.description },
    render: () => <ProductDetailPage slug={product.slug} />,
  })),
];

const publicationRoutes = (insights: Insight[], news: NewsItem[]): SiteRoute[] => [
  ...publishedResearch.map((item) => ({
    path: `/research/${item.slug}`,
    meta: articleMeta(item),
    render: () => <ActivityPage item={item} related={researchItems} section="research" />,
  })),
  ...publishedActivities
    .filter((item) => !item.externalUrl)
    .map((item) => ({
      path: `/activities/${item.slug}`,
      meta: articleMeta(item),
      render: () => <ActivityPage item={item} related={activityItems} />,
    })),
  ...publishedCaseStudies.map((item) => ({
    path: `/cases/${item.slug}`,
    meta: articleMeta({ ...item, updatedAt: undefined }),
    render: () => <CaseStudyPage item={item} related={caseStudyItems} />,
  })),
  ...insights
    .filter((insight) => insight.status === 'published')
    .map((insight) => ({
      path: `/insights/${insight.slug}`,
      meta: articleMeta(insight),
      render: () => <InsightPage insight={insight} />,
    })),
  ...news
    .filter((item) => item.status === 'published')
    .map((item) => ({
      path: `/news/${item.slug}`,
      meta: articleMeta(item),
      render: () => <NewsItemPage item={item} />,
    })),
];

const sitemapRoute = (publications: SiteRoute[]): SiteRoute => {
  const articles = [...publications]
    .sort((a, b) => (b.meta.publishedAt ?? '').localeCompare(a.meta.publishedAt ?? ''))
    .map(({ path, meta }) => ({ href: `${path}/`, label: meta.title }));

  return {
    path: '/sitemap',
    meta: {
      title: '站点地图',
      description: '按栏目浏览 Elexvx 官网的页面和已发布文章，包括研究、活动、新闻与合作案例。',
      descriptionEn:
        'Browse Elexvx website sections and published articles, including research, event reports, company news and case studies.',
    },
    render: () => <SitemapPage articles={articles} />,
  };
};

const organizationRoutes = (): SiteRoute[] => [
  ...jobs.map((job) => ({
    path: `/careers/${job.id}`,
    meta: { title: job.title, description: job.description || job.title },
    render: () => <JobPage id={job.id} />,
  })),
  ...teamMembers.map((member) => ({
    path: `/company/team/${member.id}`,
    meta: { title: member.name, description: member.position },
    render: () => <TeamMemberPage id={member.id} />,
  })),
  ...researchDirections.map((direction) => ({
    path: `/research/${direction.slug}`,
    meta: { title: direction.title, description: direction.summary },
    render: () => <ResearchDirectionPage slug={direction.slug} />,
  })),
  ...businessLines.map((line) => ({
    path: line.href,
    meta: { title: line.title, description: line.summary },
    render: () => <BusinessLinePage slug={line.slug} />,
  })),
];

const disabledCatalogRoutes = (): SiteRoute[] => [
  ...projects.map((project) => ({
    path: `/projects/${project.slug}`,
    meta: { title: project.title, description: project.output },
    render: () => <ProjectPage slug={project.slug} />,
  })),
  ...scenarios.map((scenario) => ({
    path: `/scenarios/${scenario.slug}`,
    meta: { title: scenario.title, description: scenario.summary },
    render: () => <ScenarioPage slug={scenario.slug} />,
  })),
];

const configuredRoutes = (insights: Insight[], news: NewsItem[] = []): SiteRoute[] => {
  const publications = publicationRoutes(insights, news);
  return [
    ...staticSectionRoutes(news),
    sitemapRoute(publications),
    ...productRoutes(),
    ...publications,
    ...organizationRoutes(),
    ...disabledCatalogRoutes(),
  ];
};

type RouteIndex = {
  routes: SiteRoute[];
  byPath: Map<string, SiteRoute>;
};

let routeIndexCache: { insights: Insight[]; news: NewsItem[]; index: RouteIndex } | undefined;

const getRouteIndex = (insights: Insight[], news: NewsItem[] = []): RouteIndex => {
  if (routeIndexCache?.insights === insights && routeIndexCache.news === news) return routeIndexCache.index;

  const routes = configuredRoutes(insights, news).filter((route) => !isDisabledPath(route.path));
  const index: RouteIndex = { routes, byPath: new Map(routes.map((route) => [route.path, route])) };
  routeIndexCache = { insights, news, index };
  return index;
};

export const normalizeRoutePath = (path: string) => {
  const pathname = path.split('?')[0].split('#')[0] || '/';
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
};

export const resolveRoute = (path: string, insights: Insight[], news: NewsItem[] = []): SiteRoute => {
  const normalized = normalizeRoutePath(path);
  const route = getRouteIndex(insights, news).byPath.get(normalized);
  return (
    route ?? {
      path: normalized,
      meta: {
        title: `未找到页面 · ${siteIdentity.researchName}`,
        description: '这个路径还没有内容。',
        robots: 'noindex,nofollow',
      },
      render: () => <NotFoundPage />,
    }
  );
};

export const getStaticRoutes = (insights: Insight[], news: NewsItem[] = []): SiteRoute[] =>
  getRouteIndex(insights, news).routes;
