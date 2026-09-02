export type NavigationLink = { label: string; href: string };

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

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'research',
    label: '研究',
    englishTitle: 'RESEARCH',
    title: '探索研究方向',
    intro: '从数据、设备与模型出发，理解技术如何进入真实世界。',
    href: '/research',
    paths: ['/research'],
    columns: [
      {
        title: '研究方向',
        links: [
          { label: '研究方向总览', href: '/research' },
          { label: 'AI 与数据智能', href: '/research/ai-data' },
          { label: '工业智能与安全', href: '/research/industrial-intelligence' },
          { label: 'LLM / AI 安全', href: '/research/llm-ai-safety' },
        ],
      },
      {
        title: '研究入口',
        links: [
          { label: '研发能力', href: '/capabilities' },
          { label: '产品与成果', href: '/projects' },
          { label: '行业场景', href: '/scenarios' },
        ],
      },
      {
        title: '继续阅读',
        links: [
          { label: '技术文章', href: '/insights' },
          { label: '最新动态', href: '/news' },
          { label: '旧文归档', href: '/archive' },
        ],
      },
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
    columns: [
      {
        title: '研发方法',
        links: [
          { label: '研发能力总览', href: '/capabilities' },
          { label: '从问题出发', href: '/capabilities' },
          { label: '建立数据与模型', href: '/research/ai-data' },
          { label: '进入真实场景', href: '/scenarios' },
        ],
      },
      {
        title: '系统基础',
        links: [
          { label: '数据智能', href: '/research/ai-data' },
          { label: '工业物联与设备', href: '/research/industrial-intelligence' },
          { label: '模型安全与评测', href: '/research/llm-ai-safety' },
        ],
      },
      {
        title: '面向合作',
        links: [
          { label: '开放合作', href: '/contact' },
          { label: '了解公司主体', href: '/company' },
        ],
      },
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
    columns: [
      {
        title: '项目与产品',
        links: [
          { label: '产品与成果总览', href: '/projects' },
          { label: '起重设备智能安全管理', href: '/projects/industrial-safety' },
        ],
      },
      {
        title: '项目状态',
        links: [
          { label: '探索中的问题', href: '/projects' },
          { label: '系统原型', href: '/projects/industrial-safety' },
          { label: '进入工业现场', href: '/scenarios/industrial-operations' },
        ],
      },
      {
        title: '项目依据',
        links: [
          { label: '研究方向', href: '/research' },
          { label: '技术文章', href: '/insights' },
          { label: '开放合作', href: '/contact' },
        ],
      },
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
    columns: [
      {
        title: '行业场景',
        links: [
          { label: '行业场景总览', href: '/scenarios' },
          { label: '工业现场与设备运营', href: '/scenarios/industrial-operations' },
          { label: '知识工作与复杂决策', href: '/scenarios/knowledge-work' },
          { label: '负责任的 AI 应用', href: '/scenarios/responsible-ai' },
        ],
      },
      {
        title: '对应研究',
        links: [
          { label: '工业智能与安全', href: '/research/industrial-intelligence' },
          { label: 'LLM / AI 安全', href: '/research/llm-ai-safety' },
        ],
      },
      {
        title: '对应成果',
        links: [
          { label: '起重设备智能安全管理', href: '/projects/industrial-safety' },
          { label: '浏览全部成果', href: '/projects' },
        ],
      },
    ],
  },
  {
    id: 'read',
    label: '阅读',
    englishTitle: 'READ',
    title: '把研究过程写下来',
    intro: '文章、方法与旧内容，构成可被检验和继续讨论的技术记录。',
    href: '/insights',
    paths: ['/insights', '/news', '/archive'],
    columns: [
      {
        title: '技术文章',
        links: [
          { label: '文章总览', href: '/insights' },
          { label: '先定义问题，再选择模型', href: '/insights/question-before-model' },
          { label: '让设备数据回到现场', href: '/insights/industrial-safety-data' },
        ],
      },
      {
        title: '最新动态',
        links: [{ label: '动态总览', href: '/news' }],
      },
      {
        title: '按主题阅读',
        links: [
          { label: 'AI 与数据智能', href: '/research/ai-data' },
          { label: '工业智能与安全', href: '/research/industrial-intelligence' },
          { label: 'LLM / AI 安全', href: '/research/llm-ai-safety' },
        ],
      },
      {
        title: '历史内容',
        links: [
          { label: '旧文归档', href: '/archive' },
          { label: '关于内容依据', href: '/company/brand' },
        ],
      },
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
    columns: [
      {
        title: '公司',
        links: [
          { label: '关于公司', href: '/company' },
          { label: '团队', href: '/company/team' },
          { label: '品牌使用', href: '/company/brand' },
        ],
      },
      {
        title: '并行业务',
        links: [
          { label: '并行业务总览', href: '/business' },
          { label: '人力资源服务', href: '/business/human-resources' },
          { label: '知识产权服务', href: '/business/intellectual-property' },
          { label: '供应链服务', href: '/business/supply-chain' },
        ],
      },
      {
        title: '联系 Elexvx',
        links: [
          { label: '开放合作', href: '/contact' },
          { label: '加入我们', href: '/careers' },
        ],
      },
    ],
  },
];
