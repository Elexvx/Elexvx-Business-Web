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

const plainBodyText = (body: string) =>
  body
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, ' ')
    .replace(/^#{1,6}\s+.*$/gmu, ' ')
    .replace(/^>\s?/gmu, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/[*_`~]+/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();

const buildArticleDescription = (excerpt: string, body: string, minimumLength = 115): string => {
  const base = excerpt.trim();
  if (base.length >= minimumLength) return base;
  const sentences = plainBodyText(body)
    .split(/(?<=[。！？])/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 8 && !base.includes(sentence));
  let combined = base;
  for (const sentence of sentences) {
    if (combined.length >= minimumLength) break;
    combined =
      combined.endsWith('。') || combined.endsWith('！') || combined.endsWith('？')
        ? `${combined}${sentence}`
        : `${combined}。${sentence}`;
  }
  return combined;
};

const latestContentDate = (items: ReadonlyArray<{ publishedAt: string; updatedAt?: string }>) =>
  items
    .map((item) => item.updatedAt || item.publishedAt)
    .sort()
    .at(-1);

const articleMeta = (item: {
  title: string;
  excerpt: string;
  excerptEn?: string;
  body?: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
}): RouteMeta => ({
  title: item.title,
  description: item.body ? buildArticleDescription(item.excerpt, item.body) : item.excerpt,
  descriptionEn: item.excerptEn ?? translateEnglish(item.excerpt),
  image: (item as { cover?: string }).cover,
  openGraphType: 'article',
  publishedAt: item.publishedAt,
  ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
  author: item.author,
});

const CATEGORY_META_DESCRIPTIONS: Record<
  Exclude<ArticleSection, 'news'>,
  Record<string, Record<'zh-CN' | 'en', string>>
> = {
  research: {
    'chip-architecture': {
      'zh-CN':
        '汇总 Elexvx Research 在芯片架构与多芯粒互连方向的研究文章，聚焦面向 MoE 推理的 Chiplet 专家复用（CoMoE-Chip）与内存中心化架构演进等系统技术分析。',
      en: 'Research papers from Elexvx Research on chiplet architectures and interconnects, including CoMoE-Chip expert reuse for MoE inference and memory-centric system scaling.',
    },
    'inference-systems': {
      'zh-CN':
        '汇总 Elexvx Research 在大模型推理系统方向的研究文章，涵盖面向智能体多轮规划与工具调用工作流的生命周期感知 KV 缓存管理（AgentKV）及 GPU HBM、CXL、NVMe 多级存储调度架构研究。',
      en: 'Research papers from Elexvx Research on LLM inference systems, covering lifecycle-aware KV cache placement for agent workflows (AgentKV) and tiered memory scheduling.',
    },
    'quantization-compilation': {
      'zh-CN':
        '汇总 Elexvx Research 在模型量化与编译优化方向的研究文章，覆盖异构加速器可迁移 FP4 量化（TransFP4）与端侧 NPU 大模型编译框架 EdgeLLM-MLIR。',
      en: 'Research papers from Elexvx Research on quantization and compilation, covering portable FP4 quantization (TransFP4) and EdgeLLM-MLIR for edge NPUs.',
    },
  },
  activities: {
    'technical-exchange': {
      'zh-CN':
        '记录 Elexvx 参与的技术交流与教学实践现场，涵盖 2026 年南京市 AIGC 数字营销师资能力提升班课堂讲解、生成式工作流现场演示、教研团队多方研讨以及人工智能工具在教学与日常协作中的落地实践观察。',
      en: 'Event reports from Elexvx technical exchanges and classroom workshops, including the 2026 Nanjing AIGC digital marketing teacher development program.',
    },
    roadshows: {
      'zh-CN':
        '记录 Elexvx 参与的创业路演与项目评议活动，涵盖锦兮创见企业家精品路演中围绕学生资源运营、宠物文旅、AI 数字营销、跨境电商与健康管理五个创业项目的现场展示、财务剖析与专家点评问答全过程。',
      en: 'Recaps from Elexvx entrepreneurship roadshows and expert reviews, featuring project presentations across AI marketing, cross-border commerce, and digital platforms.',
    },
    'entrepreneur-exchanges': {
      'zh-CN':
        '汇集集米荟企业家交流、青奥模数空间分享会与南京本地企业家沙龙纪要，记录陶锦程、龚凯瑞等团队与创业代表围绕企业 IP 建设、创始人个人品牌、企业合规治理、产业协同与跨行业资源互补的深度对话与合作讨论。',
      en: 'Summaries of Jimihui and Qingao Moshu Space entrepreneur meetups featuring Tao Jincheng and Gong Kairui on brand identity, compliance, and cross-industry collaboration.',
    },
  },
};

const categoryRoutes = (section: Exclude<ArticleSection, 'news'>): SiteRoute[] => {
  const items = section === 'research' ? researchItems : activityItems;
  const sectionLabel = section === 'research' ? '研究' : '活动';
  return articleCategories(section, items).map(({ id, label }) => ({
    path: articleCategoryPath(section, id).replace(/\/$/, ''),
    meta: {
      title: `${label} · ${sectionLabel}`,
      titleEn: `${translateEnglish(label)} · ${translateEnglish(sectionLabel)}`,
      description:
        CATEGORY_META_DESCRIPTIONS[section][id]?.['zh-CN'] ??
        `浏览 Elexvx 已发布的${label}${sectionLabel}内容、文章摘要与发布时间，了解相关专题研究成果与实践记录。`,
      descriptionEn:
        CATEGORY_META_DESCRIPTIONS[section][id]?.en ??
        `Browse published ${translateEnglish(label)} ${translateEnglish(sectionLabel).toLowerCase()} from Elexvx, including article summaries and publication dates.`,
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

const NEWS_CATEGORY_META: Record<string, Record<'zh-CN' | 'en', string>> = {
  all: {
    'zh-CN':
      '集中发布宏翔商道-Elexvx 官方公司公告、历年对外股权投资与撤资退出信息披露、核心管理层人事任免与共青团组织公示、国家知识产权局商标代理机构备案信息、起重设备工业物联网研发纪实，以及江苏保安在线微信小程序报名与保安员证申领办事指南。',
    en: 'Official announcements, governance and investment disclosures, trademark registration milestones, R&D reports, and Jiangsu security officer exam guides from Hongxiang Shangdao-Elexvx.',
  },
  updates: {
    'zh-CN':
      '汇总宏翔商道（南京）科技发展有限公司历年发布的企业对外股权投资与退出公告、共青团支部书记任前公示、官网功能与业务站下线升级通知、国家商标代理机构备案消息，以及起重机械智能安全管理系统研发纪实等公司官方动态。',
    en: 'Official company updates from Hongxiang Shangdao covering equity investments, personnel notices, platform changes, trademark agency filing, and industrial safety R&D stories.',
  },
  guides: {
    'zh-CN':
      '系统整理江苏保安在线微信小程序个人注册、实名认证、在线缴费、考试报名与准考证查询实操指南，以及保安员证报考年龄与学历条件、江苏省报名所需材料清单、各地市考试收费标准、免试豁免规则与电子证照申领使用说明。',
    en: 'Step-by-step Jiangsu Security Online WeChat registration and security officer certificate guides covering eligibility, required documents, exam fees, and digital credentials.',
  },
};

const newsListRoutes = (news: NewsItem[]): SiteRoute[] => {
  const published = news.filter((item) => item.status === 'published');
  return [{ id: 'all', label: '最新动态' }, ...articleCategories('news', published)].flatMap(({ id, label }) => {
    const items = newsInCategory(published, id);
    const all = id === 'all';
    const title = all ? label : `${label} · 新闻`;
    const titleEn = all ? translateEnglish(label) : `${translateEnglish(label)} · News`;
    const baseDescription =
      NEWS_CATEGORY_META[id]?.['zh-CN'] ??
      `浏览 Elexvx 已发布的${label}新闻内容、文章摘要与发布时间，查阅相关公告与办事资料。`;
    const baseDescriptionEn =
      NEWS_CATEGORY_META[id]?.en ??
      `Browse published ${translateEnglish(label)} news from Elexvx, including article summaries and publication dates.`;
    const updatedAt = latestContentDate(items);

    return Array.from({ length: newsPageCount(items.length) }, (_, index) => {
      const page = index + 1;
      return {
        path: newsPageHref(id, page).slice(0, -1),
        meta: {
          title: page === 1 ? title : `${title} · 第 ${page} 页`,
          titleEn: page === 1 ? titleEn : `${titleEn} · Page ${page}`,
          description: page === 1 ? baseDescription : `${baseDescription}（第 ${page} 页）`,
          descriptionEn: page === 1 ? baseDescriptionEn : `${baseDescriptionEn} (Page ${page})`,
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
      description:
        '完整记录 Elexvx 参与的高校与企业技术交流、创业项目路演与企业家沙龙活动，涵盖南京市 AIGC 数字营销师资能力提升班课堂实践、锦兮创见企业家精品路演评议、集米荟线下互动交流及青奥模数空间企业家分享会纪要。',
      descriptionEn:
        'Reports from Elexvx technical workshops, entrepreneurship roadshows, and executive meetups, including Nanjing AIGC teacher training, Jinxi roadshows, and Jimihui sessions.',
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
      description:
        '围绕 AI 与数据智能、工业智能与安全、LLM / AI 安全三大研究方向，公开发布 MoE Chiplet 专家复用、AgentKV 缓存、TransFP4 量化、EdgeLLM-MLIR 编译与内存中心化推理架构论文。',
      descriptionEn:
        'Explore Elexvx Research across AI & data intelligence, industrial safety, and LLM safety, featuring papers on CoMoE-Chip, AgentKV, TransFP4, and EdgeLLM-MLIR.',
      updatedAt: latestContentDate(researchItems),
    },
    render: () => <ResearchPage items={researchItems} />,
  },
  {
    path: '/capabilities',
    meta: {
      title: '研发能力',
      description:
        '介绍宏翔商道-Elexvx 从问题定义、数据与模型构建到真实场景验证的四步研发闭环，同时提供可复用自主产品与面向行业现场的定制研发交付。',
      descriptionEn:
        'Learn how Elexvx turns complex real-world problems into verified systems through a four-stage R&D loop spanning reusable software products and custom engineering.',
    },
    render: () => <CapabilitiesPage />,
  },
  {
    path: '/projects',
    meta: {
      title: '产品与成果',
      description:
        '展示宏翔商道-Elexvx 公开的研发项目、系统原型与阶段性证据边界，包含面向起重设备全生命周期的多传感器监测与工业物联网预警运维平台等成果。',
      descriptionEn:
        'View Elexvx Research projects, prototypes, and evidence disclosures, including industrial IoT sensor monitoring and early-warning systems for lifting equipment.',
    },
    render: () => <ProjectsPage />,
  },
  {
    path: '/scenarios',
    meta: {
      title: '行业场景',
      description:
        '面向工业现场与设备运营、知识工作与复杂决策、负责任的 AI 应用三大真实场景，说明业务约束、现场痛点与可验证的技术系统落地方式。',
      descriptionEn:
        'Discover how Elexvx organizes R&D around real-world industrial operations, knowledge work decision support, and responsible AI deployment boundaries.',
    },
    render: () => <ScenariosPage />,
  },
  {
    path: '/company',
    meta: {
      title: '公司与业务',
      description:
        '介绍宏翔商道（南京）科技发展有限公司（Elexvx Inc）与 Elexvx Research 的组织定位、自 2020 年起从起重设备智能化到 AI 矩阵的发展历程、共享普惠价值观与四大业务板块。',
      descriptionEn:
        'Company overview of Hongxiang Shangdao-Elexvx and Elexvx Research, covering corporate milestones since 2020, AI product R&D, core values, and parallel business lines.',
    },
    render: () => <CompanyPage />,
  },
  {
    path: '/company/team',
    meta: {
      title: '团队',
      description:
        '全面介绍宏翔商道-Elexvx 核心管理与技术研发成员（陶锦程、孟小华、邱子枼）以及生态合作与投融资顾问团队（龚凯瑞、施浩宇、宋昊晟），详细展示各成员在人工智能系统研发、大模型安全合规、企业财务治理与创投项目孵化上的职责分工与协作结构。',
      descriptionEn:
        'Meet the Hongxiang Shangdao-Elexvx leadership, R&D leads, and ecosystem partners across AI systems, LLM safety, financial governance, and venture incubation.',
    },
    render: () => <TeamPage />,
  },
  {
    path: '/company/design',
    meta: {
      title: '设计规范',
      description:
        '公开展示 Elexvx 官网使用的衬线与无衬线标题正文字体尺度、内容区最大宽度、留白间距网格、浅深表面语义色阶与多端响应式断点设计规范，同时面向设计师与前端开发者提供完整 design.md 规范文档下载与复用说明。',
      descriptionEn:
        'Official Elexvx web design guidelines covering typographic scale, layout grids, spacing tokens, surface contrast, and responsive breakpoints, with design.md download.',
    },
    render: () => <DesignPage />,
  },
  {
    path: '/company/qualifications',
    meta: {
      title: '企业资质',
      description:
        '集中展示宏翔商道-Elexvx 获得的国家级科技型中小企业入库编号、AAA 级信用企业等级、劳务派遣经营许可证、elexvx 商标注册证，以及 3 项软件著作权、4 项作品登记证书、实用新型专利等 12 项企业官方资质与核验详情。',
      descriptionEn:
        'View 12 verified credentials of Hongxiang Shangdao-Elexvx, including National Technology-based SME recognition, AAA credit rating, trademarks, patents, and software copyrights.',
    },
    render: () => <QualificationsPage />,
  },
  {
    path: '/company/brand',
    meta: {
      title: '品牌',
      description:
        '说明 Elexvx 源自“Electrify Vision X”的命名寓意、品牌蓝 #0B3EA8 标准色、EX 图形与矢量字标最小宽度规范，以及“宏翔商道 ®”授权合作方的标识使用准则与法律声明。',
      descriptionEn:
        'Official Elexvx brand guidelines explaining the Electrify Vision X identity, #0B3EA8 brand blue, EX symbol proportions, wordmark rules, and authorized trademark usage.',
    },
    render: () => <BrandPage />,
  },
  {
    path: '/business',
    meta: {
      title: '并行业务',
      description:
        '详细介绍宏翔商道（Elexvx）公司主体在技术研发之外独立运营的三大并行业务：涵盖职业中介与持证劳务派遣的人力资源服务、已完成备案代理的商标专利与软著知识产权服务，以及打通采购仓储与履约物流的全链路供应链服务。',
      descriptionEn:
        'Explore the parallel enterprise service lines operated by Hongxiang Shangdao: human resources and labor dispatch, intellectual property agency, and supply chain management.',
    },
    render: () => <BusinessPage />,
  },
  {
    path: '/careers',
    meta: {
      title: '加入 Elexvx',
      description:
        '深入了解宏翔商道-Elexvx 注重真实产业技术问题、前沿算法科研成果转化与可验证工程交付的团队协作文化，查看人工智能系统研发、工业物联网工程、大模型安全研究及企业合规服务方向的合作岗位职责、加入路径与官方招聘联络邮箱信息。',
      descriptionEn:
        'Join Hongxiang Shangdao-Elexvx to work on real-world AI research, engineering systems, and product delivery. View open collaboration paths and recruiting contact details.',
    },
    render: () => <CareersPage />,
  },
  {
    path: '/contact',
    meta: {
      title: startCollaborationAction.label,
      description:
        '从真实业务诉求与技术问题出发开启高效合作，获取宏翔商道-Elexvx 官方联系邮箱（elexvx@elexvx.com）、AI 联合研发项目沟通路径、Humite 开源产品技术咨询，以及人力资源、知识产权代理与供应链业务合作对接入口。',
      descriptionEn:
        'Start a collaboration with Hongxiang Shangdao-Elexvx. Reach out via elexvx@elexvx.com for AI research partnerships, product inquiries, and enterprise service engagements.',
    },
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
    meta: {
      title: '产品',
      description:
        '集中展示宏翔商道-Elexvx 面向个人与技术社区公开发布的自研软件及工程产品项目，重点介绍开源自托管家庭数字藏书阁与「观文藏阁」三维明式书楼阅读系统 Humite，深入查看产品核心功能特性、前后端技术架构与自托管部署指南。',
      descriptionEn:
        'Explore software products developed by Hongxiang Shangdao-Elexvx, including Humite, an open-source self-hosted family digital library and 3D pavilion.',
    },
    render: () => <ProductCatalogPage />,
  },
  ...homeContent.product.items.map((product) => ({
    path: product.href,
    meta: {
      title: product.name,
      description:
        product.slug === 'humite'
          ? 'Humite（书林）是开源自托管家庭数字藏书阁，将 NAS 中的 EPUB 与 PDF 映射进两层明式三维书楼观文藏阁，支持 SHA-256 去重、账号隔离阅读笔记、TOTP 加密秘阁与 Docker 一键部署。'
          : product.description,
      descriptionEn:
        product.slug === 'humite'
          ? 'Humite is an open-source self-hosted family digital library mapping NAS EPUB and PDF holdings into the 3D Guanwen Library pavilion, with per-account notes and Docker deployment.'
          : translateEnglish(product.description),
    },
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
      description:
        '按研究方向、活动报道、新闻动态、合作案例、产品项目、核心团队、并行业务、服务中心与企业资质等全站栏目，结构化浏览宏翔商道-Elexvx 官方网站全部中英文公开页面、专题分类列表、开放产品资料及已发布研究与动态文章的完整站内导航索引。',
      descriptionEn:
        'Browse Elexvx website sections and published articles, including research, event reports, company news and case studies.',
    },
    render: () => <SitemapPage articles={articles} />,
  };
};

const TEAM_DESCRIPTIONS_EN: Record<string, string> = {
  taojincheng:
    'Tao Jincheng, General Manager and Party Branch Secretary of Hongxiang Shangdao (Nanjing) Technology Development, investor at Elexvx Capital Inc, and university entrepreneurship mentor.',
  mengxiaohua:
    'Meng Xiaohua, Chief Financial Officer and Director of Hongxiang Shangdao-Elexvx, leading corporate financial planning, cost control, and risk management since joining the workforce in 1995.',
  gongkairui:
    'Gong Kairui, Investment & Financing Adviser, Partner at Jiasu Capital, and Chairman of Baihuankj, focusing on youth education, venture incubation, and early-stage technology investments.',
  shihaoyu:
    'Shi Haoyu, Executive Director of Tonggu Jiyu (Nanjing) Technology Development, specializing in LLM security governance, prompt-injection defense (PTDCoreBase), and open-source AstrBot tooling.',
  songhaosheng:
    'Song Haosheng, Executive Director of Nanjing Linxi Zhijue Technology and Investment Manager at Jiasu Capital, focused on HarmonyOS app development, technology transfer, and early-stage investments.',
  qiuziye:
    'Qiu Ziye, R&D Department Lead at Elexvx managing the Zhiheng trustworthy enterprise agent execution project, coordinating verifiable tool calls, field-level lineage, and cross-team delivery.',
};

const DIRECTION_DESCRIPTIONS_EN: Record<string, string> = {
  'ai-data':
    'AI & Data Intelligence at Elexvx Research: exploring data collection and governance, model design and evaluation, and human-AI feedback loops that turn recorded data into actionable workflows.',
  'industrial-intelligence':
    'Industrial Intelligence & Safety at Elexvx Research: multi-sensor fusion, edge-cloud industrial protocols, and predictive risk maintenance for continuous monitoring of equipment and sites.',
  'llm-ai-safety':
    'LLM & AI Safety at Elexvx Research: studying safety boundaries, observability, evaluation benchmarks, and engineering infrastructure to keep large-model applications controllable and traceable.',
};

const BUSINESS_DESCRIPTIONS: Record<string, Record<'zh-CN' | 'en', string>> = {
  'human-resources': {
    'zh-CN':
      '宏翔商道人力资源服务围绕成长型与中大型企业组织发展及用工需求，依法提供职业中介、持证劳务派遣经营许可服务、岗前背景核查、用工风险合规评估与人才发展平台支持，构建稳健且灵活的一站式企业人力协作生态。',
    en: 'Hongxiang Shangdao Human Resources provides licensed labor dispatch, career placement, background verification, and talent development platforms for compliant enterprise workforce operations.',
  },
  'intellectual-property': {
    'zh-CN':
      '宏翔商道已完成国家知识产权局正规商标代理机构备案，面向科技企业与技术研发团队提供涵盖软件著作权与作品登记、商标注册、实用新型与发明专利申请及品牌合规维权的全链路知识产权代理服务，将研发成果沉淀为可防御资产。',
    en: 'Hongxiang Shangdao is a registered trademark agency offering end-to-end copyright registration, trademark filing, patent prosecution, and brand protection services for enterprise IP assets.',
  },
  'supply-chain': {
    'zh-CN':
      '宏翔商道供应链服务聚焦企业级商贸流通与生产制造业务场景，打通原料寻源采购、精细化仓储调拨与多式联运物流履约全链路，通过数字化实时数据看板与交付风险预警机制，协助客户实现采购成本、履约时效与合规稳健的最优平衡。',
    en: 'Hongxiang Shangdao Supply Chain integrates procurement, warehousing, and logistics fulfillment with digital dashboards and risk alerts to balance cost, lead time, and operational compliance.',
  },
};

const organizationRoutes = (): SiteRoute[] => [
  ...jobs.map((job) => ({
    path: `/careers/${job.id}`,
    meta: { title: job.title, description: job.description || job.title },
    render: () => <JobPage id={job.id} />,
  })),
  ...teamMembers.map((member) => ({
    path: `/company/team/${member.id}`,
    meta: {
      title: member.name,
      description: buildArticleDescription(`${member.name}，${member.position}。`, member.bio, 115),
      descriptionEn: TEAM_DESCRIPTIONS_EN[member.id],
    },
    render: () => <TeamMemberPage id={member.id} />,
  })),
  ...researchDirections.map((direction) => ({
    path: `/research/${direction.slug}`,
    meta: {
      title: direction.title,
      description: `${direction.title}研究方向聚焦“${direction.question}”——${direction.summary}核心方法涵盖${direction.methods.join('、')}，推动技术成果进入真实业务验证。`,
      descriptionEn: DIRECTION_DESCRIPTIONS_EN[direction.slug] ?? translateEnglish(direction.summary),
    },
    render: () => <ResearchDirectionPage slug={direction.slug} />,
  })),
  ...businessLines.map((line) => ({
    path: line.href,
    meta: {
      title: line.title,
      description: BUSINESS_DESCRIPTIONS[line.slug]?.['zh-CN'] ?? line.summary,
      descriptionEn: BUSINESS_DESCRIPTIONS[line.slug]?.en ?? translateEnglish(line.summary),
    },
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
