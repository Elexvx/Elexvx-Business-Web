import type { Metadata } from 'next';
import { translateEnglish } from '../translation';
import { loadInsights } from '../../content/loader';
import { loadNews } from '../../content/news-loader';
import { siteIdentity } from '../../data/site';
import type { Locale } from '../providers/i18n';
import { resolveRoute } from './routes';

const englishMetadata: Record<string, string> = {
  'Elexvx Research': 'Elexvx Research',
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

const localizedTitle = (title: string, locale: Locale) => {
  const [section, ...rest] = title.split(' · ');
  const translated = translateMetadata(section, locale);
  return translated !== section ? [translated, ...rest].join(' · ') : locale === 'en' ? translateEnglish(title) : title;
};

export const nextMetadata = (path: string, locale: Locale = 'zh-CN'): Metadata => {
  const route = resolveRoute(path, loadInsights(), loadNews());
  const localePath = locale === 'en' ? `/en${path === '/' ? '' : path}` : path;
  const canonical = `${siteIdentity.canonicalOrigin}${localePath === '/' ? '/' : `${localePath}/`}`;
  const isNoIndex = route.meta.robots === 'noindex,nofollow';
  const title = localizedTitle(route.meta.title, locale);
  const description = translateMetadata(route.meta.description, locale);
  const chinesePath = `${siteIdentity.canonicalOrigin}${path === '/' ? '/' : `${path}/`}`;
  const englishPath = `${siteIdentity.canonicalOrigin}/en${path === '/' ? '/' : `${path}/`}`;

  return {
    title: { absolute: title },
    description,
    robots: { index: !isNoIndex, follow: !isNoIndex },
    alternates: {
      canonical,
      languages: {
        'zh-CN': chinesePath,
        en: englishPath,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
    },
  };
};
