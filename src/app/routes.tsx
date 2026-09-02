import type { ReactNode } from 'react';
import { businessLines, getDirection, getProject, getScenario, siteIdentity } from '../data/site';
import type { Insight, NewsItem } from '../content/types';
import {
  ArchivePage,
  BrandPage,
  BusinessLinePage,
  BusinessPage,
  CapabilitiesPage,
  CareersPage,
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
} from './pages';

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
    path: '/',
    meta: { title: siteIdentity.researchName, description: siteIdentity.description },
    render: () => <HomePage />,
  },
  {
    path: '/research',
    meta: {
      title: titleFor('研究方向'),
      description: 'AI 与数据智能、工业智能与安全、LLM / AI 安全三个并列研究方向。',
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

export const redirectRoutes: Record<string, string> = {
  '/service/ai-design': '/research/ai-data',
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
  '/exam/2025-07-08-01': '/news/exam-2025-07-08-01',
};

export const allRoutes = (insights: Insight[], news: NewsItem[] = []): SiteRoute[] => [
  ...staticRoutes,
  ...['ai-data', 'industrial-intelligence', 'llm-ai-safety'].map((slug) => {
    const direction = getDirection(slug)!;
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
