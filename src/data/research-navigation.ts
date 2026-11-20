import catalog from './navigation-catalog.json';
import { startCollaborationAction } from './contact';
import { newsCategorySlug } from './article-categories';
import { homeContent } from './page-content';
import { researchDirections } from './site';
import { documentationUrl, serviceRoutePaths } from './service-routes';
const { research: publishedResearch, activities: publishedActivities } = catalog;

type NavigationLink = { label: string; href: string };

export type NavigationGroup = {
  id: string;
  label: string;
  englishTitle: string;
  title: string;
  intro: string;
  href: string;
  paths: string[];
  columns: Array<{ title: string; links: NavigationLink[] }>;
};

type NavigationGroupDefinition = Omit<NavigationGroup, 'columns'> & {
  links: NavigationLink[];
};

const navigationDefinitions: NavigationGroupDefinition[] = [
  {
    id: 'research',
    label: '研究',
    englishTitle: 'RESEARCH',
    title: '探索研究方向',
    intro: '从数据、设备与模型出发，理解技术如何进入真实世界。',
    href: '/research',
    paths: ['/research', '/insights', '/archive'],
    links: [
      ...Array.from(new Map(publishedResearch.map((item) => [item.categorySlug, item.category])).entries()).map(
        ([slug, label]) => ({ label: label || '研究', href: `/research/category/${slug}/` })
      ),
      ...researchDirections.map((direction) => ({ label: direction.title, href: `/research/${direction.slug}` })),
      { label: '研发能力', href: '/capabilities' },
      { label: '产品与成果', href: '/projects' },
      { label: '行业场景', href: '/scenarios' },
      { label: '旧文归档', href: '/archive' },
    ],
  },
  {
    id: 'activities',
    label: '活动',
    englishTitle: 'ACTIVITIES',
    title: '探索活动',
    intro: '活动记录与交流。',
    href: '/activities',
    paths: ['/activities'],
    links: Array.from(new Map(publishedActivities.map((item) => [item.categorySlug, item.category])).entries()).map(
      ([slug, label]) => ({ label: label || '活动', href: `/activities/category/${slug}/` })
    ),
  },
  {
    id: 'news',
    label: '新闻',
    englishTitle: 'NEWS',
    title: '探索新闻',
    intro: '公司公告与最新新闻。',
    href: '/news',
    paths: ['/news'],
    links: [],
  },
  {
    id: 'products',
    label: '产品',
    englishTitle: 'PRODUCTS',
    title: '探索产品',
    intro: '了解我们的产品。',
    href: '/products',
    paths: ['/products'],
    links: homeContent.product.items.map((product) => ({ label: product.name, href: product.href })),
  },
  {
    id: 'services',
    label: '服务',
    englishTitle: 'SERVICES',
    title: '进入 Elexvx 服务中心',
    intro: '访问帮助文档、企业服务导航与平台运行状态。',
    href: '/services/',
    paths: [...serviceRoutePaths],
    links: [
      { label: '帮助文档', href: documentationUrl },
      { label: '企业导航', href: '/navigation/' },
      { label: '服务状态', href: '/status/' },
    ],
  },
  {
    id: 'company',
    label: 'Elexvx',
    englishTitle: 'ELEXVX',
    title: '了解公司与研究主体',
    intro: '宏翔商道 / Elexvx 是公司主体，Elexvx Research 是可替换的研究工作名称。',
    href: '/company',
    paths: ['/company', '/business', '/careers', '/contact'],
    links: [
      { label: '团队', href: '/company/team' },
      { label: '企业资质', href: '/company/qualifications' },
      { label: '品牌使用', href: '/company/brand' },
      { label: '设计规范', href: '/company/design' },
      { label: '联系我们', href: '/contact' },
      { label: '加入 Elexvx', href: '/careers' },
    ],
  },
  {
    id: 'capabilities',
    label: '能力',
    englishTitle: 'BUILD',
    title: '从问题到系统',
    intro: '把研究问题转化为可以验证、交付和继续发展的技术系统。',
    href: '/capabilities',
    paths: ['/capabilities'],
    links: [
      { label: '进入真实场景', href: '/scenarios' },
      { label: '模型安全与评测', href: '/research/llm-ai-safety' },
      startCollaborationAction,
      { label: '了解公司主体', href: '/company' },
    ],
  },
  {
    id: 'outcomes',
    label: '成果',
    englishTitle: 'OUTCOMES',
    title: '看见研究如何落地',
    intro: '用项目、产品和系统原型，说明研究已经走到哪里。',
    href: '/projects',
    paths: ['/projects'],
    links: [
      { label: '系统原型', href: '/projects/industrial-safety' },
      { label: '进入工业现场', href: '/scenarios/industrial-operations' },
      { label: '技术文章', href: '/research' },
      startCollaborationAction,
    ],
  },
  {
    id: 'scenarios',
    label: '场景',
    englishTitle: 'CONTEXT',
    title: '从真实场景理解问题',
    intro: '设备、组织和人的约束，是技术系统必须面对的上下文。',
    href: '/scenarios',
    paths: ['/scenarios'],
    links: [
      { label: '工业现场与设备运营', href: '/scenarios/industrial-operations' },
      { label: '知识工作与复杂决策', href: '/scenarios/knowledge-work' },
      { label: '负责任的 AI 应用', href: '/scenarios/responsible-ai' },
      { label: 'LLM / AI 安全', href: '/research/llm-ai-safety' },
      { label: '起重设备智能安全管理', href: '/projects/industrial-safety' },
      { label: '浏览全部成果', href: '/projects' },
    ],
  },
];

// Every menu uses the same hierarchy: one overview, then its child destinations.
export const navigationGroups: NavigationGroup[] = navigationDefinitions.map(({ links, ...group }) => {
  const uniqueChildren = [
    ...new Map(links.filter((link) => link.href !== group.href).map((link) => [link.href, link])).values(),
  ];
  const overviewLabel = group.id === 'services' ? '服务' : group.id === 'company' ? '关于我们' : '总览';
  return {
    ...group,
    columns: [
      {
        title: group.id === 'services' ? '服务入口' : overviewLabel,
        links: [{ label: overviewLabel, href: group.href }],
      },
      ...(uniqueChildren.length
        ? [
            {
              title: group.id === 'research' ? '研究方向与入口' : group.id === 'activities' ? '分类' : '了解更多',
              links: uniqueChildren,
            },
          ]
        : []),
    ],
  };
});

/**
 * News categories come from the published content context, so the shared
 * navigation can stay client-safe while still reflecting the live newsroom.
 */
export const withNewsCategories = (groups: NavigationGroup[], categories: string[]) => {
  const categoryLinks = [...new Set(categories.map((category) => category.trim()).filter(Boolean))].map((category) => ({
    label: category,
    href: `/news/category/${newsCategorySlug(category)}/`,
  }));

  if (!categoryLinks.length) return groups;

  return groups.map((group) => {
    if (group.id !== 'news') return group;

    const categoryColumn = group.columns.find((column) => column.title === '分类');
    if (categoryColumn) return group;

    return {
      ...group,
      columns: [...group.columns, { title: '分类', links: categoryLinks }],
    };
  });
};
