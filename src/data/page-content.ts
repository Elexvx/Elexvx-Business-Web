export type ContentAction = {
  label: string;
  href: string;
};

export type HeroMedia = {
  src: string;
  alt: string;
};

export type PageHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: ContentAction;
  secondaryAction?: ContentAction;
  media: HeroMedia;
};

export type TileContent = {
  tone: 'light' | 'dark' | 'parchment';
  eyebrow: string;
  title: string;
  description?: string;
};

export type LatestActivityContent = {
  enabled: boolean;
  eyebrow: string;
  status: string;
  title: string;
  description: string;
  action: ContentAction;
  media: HeroMedia;
};

const visuals = {
  research: {
    src: '/visuals/research-gradient.jpg',
    alt: '珊瑚色、杏色与淡紫色交融的抽象渐变色域',
  },
  aiData: {
    src: '/visuals/ai-data-gradient.jpg',
    alt: '蓝色、青色、紫色与珊瑚色交融的抽象渐变色域',
  },
  industrial: {
    src: '/visuals/industrial-intelligence-gradient.jpg',
    alt: '矿物绿、琥珀色与灰蓝色交叠的抽象渐变色域',
  },
  safety: {
    src: '/visuals/ai-safety-gradient.jpg',
    alt: '靛蓝、紫色与浅蓝色柔和交叠的抽象渐变色域',
  },
  system: {
    src: '/visuals/system-gradient.jpg',
    alt: '青绿色、蓝色与黄绿色流动交汇的抽象渐变色域',
  },
} satisfies Record<string, HeroMedia>;

export const homeContent = {
  hero: {
    // Set enabled to true and fill in the priority message to replace the default hero.
    important: { enabled: false, title: '', description: '', image: '', action: { label: '', href: '' } },
    image: '/visuals/research-gradient.jpg',
    title: '想象力，真的没有边界',
    description:
      '宏翔商道 / Elexvx 是一家跨行业研发公司，以 AI 与数据智能为核心，面向工业现场、知识工作与负责任的 AI 应用，构建可验证的技术系统。',
  },
  latestActivity: {
    enabled: true,
    eyebrow: 'LATEST ACTIVITY',
    status: '正在进行',
    title: 'Elexvx 最新活动',
    description: '当前活动正在进行中，进展、参与方式和后续安排会在这里持续更新。',
    action: { label: '查看最新动态', href: '/news' },
    media: visuals.aiData,
  } satisfies LatestActivityContent,
  directions: {
    eyebrow: 'RESEARCH DIRECTIONS',
    title: '研究方向，面向真实约束。',
    action: { label: '查看研究总览', href: '/research' },
  },
  publications: {
    eyebrow: 'RESEARCH NOTES',
    title: '研究与技术',
    action: { label: '查看全部发布', href: '/insights' },
    standard: {
      image: visuals.research,
      eyebrow: 'PUBLICATION STANDARD',
      title: '研究内容必须可以被追溯。',
      description: '文章、研究记录与技术输出分级呈现；没有完成来源和证据核验的内容，不进入公开列表。',
      href: '/company/brand',
    },
  },
  news: {
    eyebrow: 'NEWSROOM',
    title: '最近新闻',
    action: { label: '查看更多', href: '/news' },
    cards: [
      {
        image: visuals.research,
        eyebrow: 'NEWS DESK',
        title: '新闻发布区已经建立。',
        description: '首条新闻将在主体、时间、事实来源和公开口径确认后发布；旧站资讯继续保留在归档中。',
        href: '/news',
      },
      {
        image: visuals.aiData,
        eyebrow: 'EDITORIAL BOUNDARY',
        title: '新闻与研究内容分开管理。',
        description: '新闻回答“发生了什么”，研究内容回答“我们发现了什么”，两类内容不混排、不互相包装。',
        href: '/company/brand',
      },
    ],
  },
  cases: {
    eyebrow: 'COOPERATION CASES',
    title: '合作案例',
    action: { label: '查看案例', href: '/cases/kaicheng-international-journal-publishing-system' },
  },
  product: {
    eyebrow: 'PRODUCTS',
    title: '主要产品',
    action: { label: '全部产品', href: '/products' },
    items: [
      {
        name: 'Lumira',
        slug: 'lumira',
        image: '/products/lumira-cover-textured.png',
        href: '/products/lumira',
        category: '企业管理平台',
        description: '面向企业管理场景的 SaaS 平台，支持本地部署与容器化部署。',
      },
      {
        name: 'BookKin',
        slug: 'bookkin',
        image: '/products/bookkin-cover-textured.png',
        href: '/products/bookkin',
        category: '家庭电子书库',
        description:
          '开源、自托管的家庭电子书库与个人藏书管理平台，支持 EPUB / PDF 阅读、藏书整理，以及独立的阅读进度与私人笔记。',
      },
    ],
  },
  closing: {
    title: '开始与 Elexvx 合作',
    action: { label: '开放合作', href: '/contact' },
  },
} as const;

export const pageContent = {
  research: {
    hero: {
      eyebrow: 'ELEXVX RESEARCH',
      title: '我们研究什么，决定我们如何研发。',
      description: '研究方向共同构成 Elexvx Research 面向真实世界的技术问题地图。',
      primaryAction: { label: '查看技术成果', href: '/projects' },
      secondaryAction: { label: '了解研发能力', href: '/capabilities' },
      media: visuals.research,
    },
    directions: {
      eyebrow: 'THREE DIRECTIONS',
      title: '不是业务分类，而是持续追问的技术方向。',
      description: '每个方向都从问题、方法和输出开始，内容会随着实际研究持续更新。',
    },
    closing: {
      tone: 'light',
      eyebrow: 'HOW WE WORK',
      title: '研究方向最终要回到具体场景。',
      description: '我们把研究问题放在数据、设备、模型和人的共同约束中验证。',
    } satisfies TileContent,
  },
  direction: {
    primaryAction: { label: '查看相关成果', href: '/projects' },
    secondaryAction: { label: '全部研究方向', href: '/research' },
    methods: {
      eyebrow: 'METHODS',
      title: '研究方法，是方向变成能力的地方。',
      description: '公开内容会逐步说明我们如何采集信息、建立模型、验证系统，以及哪些问题仍然没有答案。',
    },
    outputs: { eyebrow: 'OUTPUTS', title: '从这个方向已经产生了什么。' },
    insights: { eyebrow: 'RELATED INSIGHTS', title: '把方向变成可以被阅读的研究记录。' },
    emptyOutputs: '相关成果正在整理，首版先保留研究结构和公开边界。',
    emptyInsights: '相关技术文章正在整理。',
  },
  capabilities: {
    hero: {
      eyebrow: 'R&D CAPABILITIES',
      title: '让研发过程可以被看见、被复盘、被继续。',
      description: '我们同时做可复用的自主产品，也承接面向真实问题的定制研发；共同点是把过程和边界说清楚。',
      primaryAction: { label: '开放技术合作', href: '/contact' },
      secondaryAction: { label: '查看项目成果', href: '/projects' },
      media: visuals.system,
    },
    loop: { eyebrow: 'THE R&D LOOP', title: '每一次交付，都应该成为下一次研发的起点。' },
    delivery: {
      tone: 'light',
      eyebrow: 'DELIVERY MODES',
      title: '从可复用产品，到定制研发。',
      description: '两种方式服务于同一个目标：在具体场景中形成可被验证的技术成果。',
      items: [
        {
          eyebrow: '01 / REUSABLE',
          title: '自主产品',
          description: '把反复出现的问题沉淀为可以被复用、被迭代的产品能力。',
        },
        {
          eyebrow: '02 / CUSTOM',
          title: '定制研发',
          description: '从合作方的真实问题出发，共同完成问题定义、系统构建和场景验证。',
        },
      ],
    },
  },
  projects: {
    hero: {
      eyebrow: 'PROJECTS & OUTCOMES',
      title: '用可说明的成果，回答研究有没有进入现实。',
      description: '这里展示产品、原型与项目系统；每一项内容都会注明阶段和证据边界。',
      primaryAction: { label: '讨论一个技术问题', href: '/contact' },
      secondaryAction: { label: '研究方向', href: '/research' },
      media: visuals.system,
    },
    list: { eyebrow: 'PUBLIC OUTPUTS', title: '目前公开的项目结构。' },
  },
  project: {
    primaryAction: { label: '讨论相关合作', href: '/contact' },
    secondaryAction: { label: '全部项目成果', href: '/projects' },
    question: { tone: 'dark', eyebrow: 'THE QUESTION', title: '问题先于方案。' } satisfies TileContent,
    approach: {
      tone: 'light',
      eyebrow: 'THE APPROACH',
      title: '把数据、模型和工作流放进同一个系统。',
    } satisfies TileContent,
    evidence: {
      tone: 'parchment',
      eyebrow: 'EVIDENCE',
      title: '证据必须和结论放在一起。',
      description:
        '当前项目以内部技术材料作为公开内容的基础；后续会在素材和审核完成后补充更完整的图像、文档与评测记录。',
    } satisfies TileContent,
    evidenceFacts: {
      direction: '研究方向',
      scenario: '行业场景',
      stage: '项目阶段',
      boundary: '公开边界',
      uncategorized: '未分类',
      pending: '待补充',
      prototype: '原型 / 场景验证',
      boundaryValue: '结构已整理，具体指标待核验',
    },
  },
  scenarios: {
    hero: {
      eyebrow: 'INDUSTRY SCENARIOS',
      title: '技术能力只有进入场景，才会遇到真正的问题。',
      description: '我们以场景组织研发问题，而不是用行业标签替代对现场的理解。',
      primaryAction: { label: '查看项目成果', href: '/projects' },
      secondaryAction: { label: '研究方向', href: '/research' },
      media: visuals.industrial,
    },
  },
  scenario: {
    primaryAction: { label: '开放场景合作', href: '/contact' },
    secondaryAction: { label: '全部行业场景', href: '/scenarios' },
    question: {
      tone: 'dark',
      eyebrow: 'SCENARIO / QUESTION',
      title: '先理解现场，再决定系统。',
      description: '场景页用于说明问题的环境、参与者、约束与可验证输出；它不是一张服务价目表。',
    } satisfies TileContent,
    projects: { eyebrow: 'RELATED PROJECTS', title: '在这个场景中产生的成果。' },
    emptyProjects: '相关项目正在整理。',
  },
  insights: {
    hero: {
      eyebrow: 'INSIGHTS',
      title: '研究要留下记录，技术才不会只存在于一次交付里。',
      description: '中文优先，保留必要的 English technical terms；只公开已经说明来源和边界的内容。',
      primaryAction: { label: '查看研究方向', href: '/research' },
      secondaryAction: { label: '旧文归档', href: '/archive' },
      media: visuals.aiData,
    },
    list: { eyebrow: 'NEW RESEARCH NOTES', title: '从问题、方法和限制开始阅读。' },
  },
  news: {
    hero: {
      eyebrow: 'LATEST UPDATES',
      title: '最近新闻',
      description: '公司公告、业务动态与阶段性记录统一收录在这里，并按发布时间持续更新。',
      primaryAction: { label: '回到首页', href: '/' },
      secondaryAction: { label: '技术文章', href: '/insights' },
      media: visuals.research,
    },
    list: { eyebrow: 'NEWSROOM', title: '按时间查看全部动态。' },
  },
  company: {
    hero: {
      eyebrow: 'ELEXVX COMPANY',
      title: '关于我们',
      description: '我们是一家跨行业研发公司，以 AI 与数据智能为核心，把真实问题做成可验证的技术系统。',
      primaryAction: { label: '查看并行业务', href: '/business' },
      secondaryAction: { label: '了解团队', href: '/company/team' },
      media: visuals.research,
    },
    principles: {
      tone: 'dark',
      eyebrow: 'COMPANY PRINCIPLES',
      title: '把边界说清楚，也是一种研发能力。',
      description: '我们希望每一项对外内容都能够说明它从哪里来、现在处于什么阶段，以及下一步要验证什么。',
    } satisfies TileContent,
  },
  business: {
    hero: {
      eyebrow: 'ELEXVX COMPANY / BUSINESS',
      title: '并行业务',
      description: '公司主体承接多元业务，研究主线继续回答更复杂的问题。',
      primaryAction: { label: '联系公司', href: '/contact' },
      secondaryAction: { label: '关于公司', href: '/company' },
      media: visuals.system,
    },
  },
  businessLine: {
    primaryAction: { label: '联系公司', href: '/contact' },
    secondaryAction: { label: '全部并行业务', href: '/business' },
    detail: {
      tone: 'parchment',
      eyebrow: 'COMPANY BUSINESS',
      title: '独立呈现，清晰承接。',
      description:
        '这部分内容属于 Elexvx 公司主体的并行业务，不会冒充 Elexvx Research 的研究成果。首版保留结构和入口，具体服务内容后续按正式材料补充。',
    } satisfies TileContent,
    facts: [
      { label: '业务状态', value: '并行业务入口' },
      { label: '内容状态', value: '结构占位，待正式材料补充' },
    ],
  },
  team: {
    hero: {
      eyebrow: 'ELEXVX TEAM',
      title: '团队',
      description: '研究、工程与现场经验，在同一个问题上相遇。',
      primaryAction: { label: '查看加入机会', href: '/careers' },
      secondaryAction: { label: '关于公司', href: '/company' },
      media: visuals.research,
    },
    organization: {
      tone: 'dark',
      eyebrow: 'ORGANIZATION',
      title: '从研究问题，到工程系统，再到长期运营。',
      description: '团队信息正在重新整理，公开内容会遵循姓名、职务和研究范围的事实边界。',
    } satisfies TileContent,
  },
  careers: {
    hero: {
      eyebrow: 'ELEXVX CAREERS',
      title: '加入宏翔商道',
      description: '和认真做事的人一起，把真实问题变成可以使用的系统。',
      primaryAction: { label: '联系招聘团队', href: '/contact' },
      secondaryAction: { label: '了解团队', href: '/company/team' },
      media: visuals.safety,
    },
    positions: {
      tone: 'light',
      eyebrow: 'OPEN POSITIONS',
      title: '岗位信息会随着研究方向一起更新。',
      description: '首版先展示加入入口，不把尚未确认的岗位、待遇或团队承诺写成公开事实。',
    } satisfies TileContent,
    call: {
      status: 'OPEN CALL',
      title: '技术研发、工程与研究协作',
      description: '请通过联系入口说明你的方向、作品和希望解决的问题。',
    },
  },
  contact: {
    hero: {
      eyebrow: 'ELEXVX CONTACT',
      title: '联系我们',
      description: '从一个真实问题开始，让一次对话走向可验证的合作。',
      primaryAction: { label: '发送合作邮件', href: 'mailto:contact@elexvx.com' },
      secondaryAction: { label: '查看研究方向', href: '/research' },
      media: visuals.system,
    },
    message: {
      tone: 'dark',
      eyebrow: 'A GOOD FIRST MESSAGE',
      title: '不需要先写一份完整需求。',
      description: '一段清楚的问题描述，往往比一串没有上下文的功能列表更适合开启研究合作。',
    } satisfies TileContent,
    prompts: [
      { label: '问题', value: '发生在哪里，谁正在面对它？' },
      { label: '约束', value: '数据、设备、流程和合规边界是什么？' },
      { label: '结果', value: '什么样的证据能够说明事情变好了？' },
    ],
  },
  brand: {
    hero: {
      eyebrow: 'ELEXVX BRAND',
      title: '品牌',
      description: '每一次表达，都应保持清楚、一致、可辨认。',
      primaryAction: { label: '回到研究首页', href: '/' },
      secondaryAction: { label: '关于公司', href: '/company' },
      media: visuals.research,
    },
    wordmark: {
      tone: 'parchment',
      eyebrow: 'WORDMARK',
      title: 'Elexvx / Elexvx Research',
      description: '研究品牌以可替换的工作名称呈现，不改变公司主体身份。',
    } satisfies TileContent,
  },
  archive: {
    hero: {
      eyebrow: 'ARCHIVE',
      title: '旧内容保留，但不代表新的研究主线。',
      description: '旧文章进入独立归档区；它们不参与首页、研究方向和新博客的内容排序。',
      primaryAction: { label: '阅读新技术文章', href: '/insights' },
      secondaryAction: { label: '了解公司', href: '/company' },
      media: visuals.research,
    },
    legacy: {
      tone: 'dark',
      eyebrow: 'LEGACY CONTENT',
      title: '归档区正在整理。',
      description: '旧站内容包含公司动态、业务宣传和早期技术材料；后续会按来源、时间和证据边界逐项整理。',
    } satisfies TileContent,
    status: 'NO INDEX',
    state: '不把旧叙事当作新定位',
  },
  notFound: {
    eyebrow: '404 / NOT FOUND',
    title: '这个路径还没有内容。',
    description: '回到研究首页，继续浏览研究方向、研发能力与项目成果。',
    action: { label: '回到首页', href: '/' },
  },
} as const;

export const getScenarioHeroMedia = (slug: string): HeroMedia =>
  slug === 'industrial-operations' ? visuals.industrial : slug === 'responsible-ai' ? visuals.safety : visuals.aiData;

export const getBusinessHeroMedia = (slug: string): HeroMedia =>
  slug === 'supply-chain' ? visuals.industrial : slug === 'intellectual-property' ? visuals.research : visuals.system;

export const staticPageHeroByPath: Record<string, PageHeroContent> = {
  '/research': pageContent.research.hero,
  '/capabilities': pageContent.capabilities.hero,
  '/projects': pageContent.projects.hero,
  '/scenarios': pageContent.scenarios.hero,
  '/insights': pageContent.insights.hero,
  '/news': pageContent.news.hero,
  '/company': pageContent.company.hero,
  '/business': pageContent.business.hero,
  '/company/team': pageContent.team.hero,
  '/careers': pageContent.careers.hero,
  '/contact': pageContent.contact.hero,
  '/company/brand': pageContent.brand.hero,
  '/archive': pageContent.archive.hero,
};
