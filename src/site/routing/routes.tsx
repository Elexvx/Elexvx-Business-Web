import { publishedResearch } from '../../data/research-articles';
import { QualificationsPage } from '../pages/qualifications';
import { DesignPage } from '../pages/design';
import { homeContent } from '../../data/page-content';
import { jobs } from '../../data/jobs';
import { publishedActivities } from '../../data/activities';
import { publishedCaseStudies } from '../../data/case-studies';
import { isDisabledPath } from '../../data/disabled-sections';
import type { ReactNode } from 'react';
import { teamMembers } from '../../data/team';
import { businessLines, getProject, getScenario, researchDirections, siteIdentity } from '../../data/site';
import type { Insight, NewsItem } from '../../content/types';
import {
  ActivitiesPage,
  ActivityPage,
  CaseStudyPage,
  ProductCatalogPage,
  ProductDetailPage,
  ArchivePage,
  BrandPage,
  BusinessLinePage,
  BusinessPage,
  CapabilitiesPage,
  CareersPage,
  JobPage,
  CompanyPage,
  ContactPage,
  HomePage,
  InsightPage,
  InsightsPage,
  NewsPage,
  NewsItemPage,
  NotFoundPage,
  ProjectPage,
  ProjectsPage,
  ResearchDirectionPage,
  ResearchPage,
  ScenarioPage,
  ScenariosPage,
  TeamPage,
  TeamMemberPage,
} from '../pages/index';

export type RouteMeta = {
  title: string;
  description: string;
  robots?: 'index,follow' | 'noindex,nofollow';
};

export type SiteRoute = {
  path: string;
  meta: RouteMeta;
  render: () => ReactNode;
};

const titleFor = (section: string) => `${section} · ${siteIdentity.researchName}`;

const staticRoutes: SiteRoute[] = [
  {
    path: '/activities',
    meta: { title: titleFor('活动'), description: 'Elexvx 活动记录与交流。' },
    render: () => <ActivitiesPage />,
  },
  {
    path: '/',
    meta: { title: siteIdentity.researchName, description: siteIdentity.description },
    render: () => <HomePage />,
  },
  {
    path: '/research',
    meta: {
      title: titleFor('研究方向'),
      description: '浏览全部已发布的研究文章。',
    },
    render: () => <ResearchPage />,
  },
  {
    path: '/capabilities',
    meta: { title: titleFor('研发能力'), description: '从问题定义、数据与模型，到真实场景验证的研发方法。' },
    render: () => <CapabilitiesPage />,
  },
  {
    path: '/projects',
    meta: { title: titleFor('产品与成果'), description: '以项目、产品和系统原型说明研究如何进入现实。' },
    render: () => <ProjectsPage />,
  },
  {
    path: '/scenarios',
    meta: { title: titleFor('行业场景'), description: '以行业场景组织真实问题，而不是用服务标签替代现场理解。' },
    render: () => <ScenariosPage />,
  },
  {
    path: '/insights',
    meta: { title: titleFor('技术文章'), description: 'Elexvx Research 的研究记录、工程方法与技术文章。' },
    render: () => <InsightsPage />,
  },
  {
    path: '/news',
    meta: { title: titleFor('最新动态'), description: '宏翔商道 / Elexvx 的公司公告、业务动态与历史新闻。' },
    render: () => <NewsPage />,
  },
  {
    path: '/company',
    meta: {
      title: titleFor('公司与业务'),
      description: '宏翔商道 / Elexvx 与 Elexvx Research 的公司主体、研究关系和并行业务。',
    },
    render: () => <CompanyPage />,
  },
  {
    path: '/company/team',
    meta: { title: titleFor('团队'), description: 'Elexvx Research 的研究与工程协作结构。' },
    render: () => <TeamPage />,
  },
  {
    path: '/company/design',
    meta: {
      title: titleFor('设计规范'),
      description: 'Elexvx 官网的标题、页面布局、间距与响应式设计规范，提供 design.md 下载。',
    },
    render: () => <DesignPage />,
  },
  {
    path: '/company/qualifications',
    meta: { title: titleFor('企业资质'), description: '宏翔商道 / Elexvx 企业资质与证书展示。' },
    render: () => <QualificationsPage />,
  },
  {
    path: '/company/brand',
    meta: { title: titleFor('品牌'), description: 'Elexvx 与 Elexvx Research 的网页品牌使用方式。' },
    render: () => <BrandPage />,
  },
  {
    path: '/business',
    meta: { title: titleFor('并行业务'), description: 'Elexvx 公司主体的人力、知识产权和供应链并行业务。' },
    render: () => <BusinessPage />,
  },
  {
    path: '/careers',
    meta: { title: titleFor('加入我们'), description: '加入关注真实问题、技术研发和工程系统的团队。' },
    render: () => <CareersPage />,
  },
  {
    path: '/contact',
    meta: { title: titleFor('开放合作'), description: '从一个真实的技术问题开始，开启研究合作。' },
    render: () => <ContactPage />,
  },
  {
    path: '/archive',
    meta: {
      title: titleFor('旧文归档'),
      description: '旧站内容归档，不代表 Elexvx Research 的新研究主线。',
      robots: 'noindex,nofollow',
    },
    render: () => <ArchivePage />,
  },
];

const originalRedirectRoutes: Record<string, string> = {
  '/service/hr-services': '/business/human-resources',
  '/service/trademark-agency': '/business/intellectual-property',
  '/service/supply-chain': '/business/supply-chain',
  '/company/about': '/company',
  '/company/leadership': '/company/team',
  '/company/contact': '/contact',
  '/company/careers': '/careers',
  '/blog': '/insights',
  '/latest-news': '/news',
  '/stories': '/news',
  '/technology': '/news',
  '/exam': '/news',
  '/technology/2025-07-01-01': '/news/technology-2025-07-01-01',
  '/stories/2025-07-01-01': '/news/stories-2025-07-01-01',
  '/latest-news/2026-01-01-01': '/news/2026-01-01-01',
  '/latest-news/2026-01-14-01': '/news/2026-01-14-01',
  '/latest-news/2026-06-09-01': '/news/2026-06-09-01',
  '/latest-news/2025-07-16-01': '/news/2025-07-16-01',
  '/latest-news/2025-07-17-01': '/news/2025-07-17-01',
  '/latest-news/2025-08-21-01': '/news/2025-08-21-01',
  '/latest-news/2024-12-31-01': '/news/2024-12-31-01',
};

export const redirectRoutes = Object.fromEntries(
  Object.entries(originalRedirectRoutes).filter(([from, to]) => !isDisabledPath(from) && !isDisabledPath(to))
);

const configuredRoutes = (insights: Insight[], news: NewsItem[] = []): SiteRoute[] => [
  ...staticRoutes,
  {
    path: '/products',
    meta: { title: titleFor('产品'), description: '了解 Elexvx 的产品。' },
    render: () => <ProductCatalogPage />,
  },
  ...homeContent.product.items.map((product) => ({
    path: product.href,
    meta: { title: titleFor(product.name), description: product.description },
    render: () => <ProductDetailPage slug={product.slug} />,
  })),
  ...jobs.map((job) => ({
    path: `/careers/${job.id}`,
    meta: { title: titleFor(job.title), description: job.description || job.title },
    render: () => <JobPage id={job.id} />,
  })),
  ...publishedResearch.map((item) => ({
    path: `/research/${item.slug}`,
    meta: { title: titleFor(item.title), description: item.excerpt },
    render: () => <ActivityPage slug={item.slug} research />,
  })),
  ...publishedActivities.map((item) => ({
    path: `/activities/${item.slug}`,
    meta: { title: titleFor(item.title), description: item.excerpt },
    render: () => <ActivityPage slug={item.slug} />,
  })),
  ...publishedCaseStudies.map((item) => ({
    path: `/cases/${item.slug}`,
    meta: { title: titleFor(item.title), description: item.excerpt },
    render: () => <CaseStudyPage slug={item.slug} />,
  })),
  ...teamMembers.map((member) => ({
    path: `/company/team/${member.id}`,
    meta: { title: titleFor(member.name), description: member.position },
    render: () => <TeamMemberPage id={member.id} />,
  })),
  ...researchDirections.map((direction) => {
    const { slug } = direction;
    return {
      path: `/research/${slug}`,
      meta: { title: titleFor(direction.title), description: direction.summary },
      render: () => <ResearchDirectionPage slug={slug} />,
    };
  }),
  ...['industrial-safety'].map((slug) => {
    const project = getProject(slug)!;
    return {
      path: `/projects/${slug}`,
      meta: { title: titleFor(project.title), description: project.output },
      render: () => <ProjectPage slug={slug} />,
    };
  }),
  ...['industrial-operations', 'knowledge-work', 'responsible-ai'].map((slug) => {
    const scenario = getScenario(slug)!;
    return {
      path: `/scenarios/${slug}`,
      meta: { title: titleFor(scenario.title), description: scenario.summary },
      render: () => <ScenarioPage slug={slug} />,
    };
  }),
  ...businessLines.map((line) => ({
    path: line.href,
    meta: { title: titleFor(line.title), description: line.summary },
    render: () => <BusinessLinePage slug={line.slug} />,
  })),
  ...insights
    .filter((insight) => insight.status === 'published')
    .map((insight) => ({
      path: `/insights/${insight.slug}`,
      meta: { title: titleFor(insight.title), description: insight.excerpt },
      render: () => <InsightPage slug={insight.slug} />,
    })),
  ...news
    .filter((item) => item.status === 'published')
    .map((item) => ({
      path: `/news/${item.slug}`,
      meta: { title: titleFor(item.title), description: item.excerpt },
      render: () => <NewsItemPage slug={item.slug} />,
    })),
];

export const allRoutes = (insights: Insight[], news: NewsItem[] = []): SiteRoute[] =>
  configuredRoutes(insights, news).filter((route) => !isDisabledPath(route.path));

const normalizePath = (path: string) => {
  const pathname = path.split('?')[0].split('#')[0] || '/';
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
};

export const resolveRoute = (path: string, insights: Insight[], news: NewsItem[] = []): SiteRoute => {
  const normalized = normalizePath(path);
  const route = allRoutes(insights, news).find((candidate) => candidate.path === normalized);
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

export const getStaticRoutes = (insights: Insight[], news: NewsItem[] = []) => allRoutes(insights, news);
export const normalizeRoutePath = normalizePath;
