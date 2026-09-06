/**
 * 首页内容数据集中管理
 * 统一维护首页的所有内容区块：服务、推荐、统计、FAQ等
 */

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  href?: string;
}

export interface TestimonialItem {
  testimonial: string;
  name: string;
  job: string;
  image: { src: string; alt: string };
}

export interface StatItem {
  title: string;
  amount: string | number;
  suffix?: string;
}

export interface FaqItem {
  title: string;
  description: string;
}

export interface CallToActionItem {
  text?: string;
  href: string;
  variant?: string;
  target?: string;
  icon?: string;
}

// ========================================
// 核心业务/服务区块
// ========================================

export const homeServices: ServiceItem[] = [
  {
    title: 'AI设计与训练',
    description: '借助大模型、机器视觉，帮我我们快速孵化可落地的 AI 产品，助力客户实现数字化转型与智能决策。',
    icon: 'tabler:server-2',
    href: '/service/ai-design',
  },
  {
    title: '知识产权设计',
    description: '包括设计、开发、商标注册、专利授权等，确保您的产品或服务在知识产权法律方面得到保护。',
    icon: 'tabler:microscope',
    href: '/service/trademark-agency',
  },
  {
    title: '人力资源服务',
    description: '包括劳务派遣、招聘背调、人才测评与职业发展平台，打造合规、高效、灵活的人才体系。',
    icon: 'tabler:users',
    href: '/service/hr-services',
  },
  {
    title: '供应链服务',
    description: '打通采购、生产、仓储、物流与贸易金融，全程可视化与预测性分析，帮助企业降本增效、优化库存。',
    icon: 'tabler:trolley',
    href: '/service/supply-chain',
  },
];

// ========================================
// 用户评价/推荐
// ========================================

export const homeTestimonials: TestimonialItem[] = [
  {
    testimonial: `宏翔商道的 AI 质检系统让我们的产线缺陷率直降 25%，数据说话最有说服力。`,
    name: 'Li Wei',
    job: '智慧制造部经理',
    image: {
      src: '~/assets/images/evaluate/1.jpg',
      alt: 'Li Wei',
    },
  },
  {
    testimonial: `整合采购平台上线后，周转资金周期缩短一半，供应链韧性明显提升。`,
    name: 'Chen Rui',
    job: '供应链总监',
    image: {
      src: '~/assets/images/evaluate/2.jpg',
      alt: 'Chen Rui',
    },
  },
  {
    testimonial: `推荐系统精度达 95%+，成功帮我们发现高潜人才。省时省力，投资回报率远超预期。`,
    name: 'Zhang Lin',
    job: 'HR总经理',
    image: {
      src: '~/assets/images/evaluate/3.jpg',
      alt: 'Zhang Lin',
    },
  },
  {
    testimonial: `API 接入简单，技术支持响应快。无缝集成到我们的现有系统中，数据实时同步。`,
    name: 'Wang Hui',
    job: '技术总监',
    image: {
      src: '~/assets/images/evaluate/4.jpg',
      alt: 'Wang Hui',
    },
  },
];

// ========================================
// 统计数据
// ========================================

export const homeStats: StatItem[] = [
  {
    title: '合作企业',
    amount: 500,
    suffix: '+',
  },
  {
    title: '已解决项目',
    amount: 5000,
    suffix: '+',
  },
  {
    title: '平均年增长',
    amount: 45,
    suffix: '%',
  },
  {
    title: '客户满意度',
    amount: 99,
    suffix: '%',
  },
];

// ========================================
// 常见问题
// ========================================

export const homeFaqs: FaqItem[] = [
  {
    title: '宏翔商道的核心优势是什么？',
    description:
      '我们结合前沿的AI技术、深厚的行业经验，为企业提供定制化的数字化转型解决方案。超过500家企业信任我们的服务。',
  },
  {
    title: '如何联系宏翔商道获取报价？',
    description:
      '您可以通过在线表单、电话、邮件等多种方式联系我们。我们的专家团队会在24小时内与您取得联系，为您提供定制化的解决方案。',
  },
  {
    title: '实施周期通常需要多长？',
    description:
      '项目周期因规模和复杂度而异。小型项目通常2-4周，中等项目4-8周，大型项目8-12周。我们会为您制定详细的实施计划。',
  },
  {
    title: '是否提供后续的技术支持？',
    description:
      '是的，我们提供全面的技术支持和维护服务。包括系统监控、性能优化、安全更新等，确保您的系统持续稳定运行。',
  },
  {
    title: '是否支持定制开发？',
    description:
      '完全支持。我们拥有经验丰富的开发团队，可以根据您的特殊需求进行定制开发和集成。',
  },
  {
    title: '数据安全性有保障吗？',
    description:
      '我们采用企业级的安全措施，包括数据加密、定期备份、访问控制等。所有数据严格遵守GDPR和国内隐私法规。',
  },
];

// ========================================
// 行动号召
// ========================================

export const homeCtaActions: CallToActionItem[] = [
  {
    text: '工作机会',
    href: '/company/careers',
    variant: 'uiverse',
  },
];

// ========================================
// Hero 区块配置
// ========================================

export const homeHeroConfig = {
  title: {
    highlight: 'AI',
    rest: '改变世界',
  },
  subtitle: '集合了科技发展、劳务服务、供应链管理等服务的综合性企业，我们为企业提供全面、多元化的解决方案。助力企业高效运营，推动创新与可持续发展。',
  actions: [
    {
      variant: 'custom',
      text: '探索产品',
      href: '/service/ai-design',
    },
  ],
};

// ========================================
// 辅助函数
// ========================================

/**
 * 获取所有首页内容
 */
export function getHomePageContent() {
  return {
    hero: homeHeroConfig,
    services: homeServices,
    testimonials: homeTestimonials,
    stats: homeStats,
    faqs: homeFaqs,
    ctaActions: homeCtaActions,
  };
}

/**
 * 获取服务项数量
 */
export function getServiceCount(): number {
  return homeServices.length;
}

/**
 * 按图标获取服务项
 */
export function getServiceByIcon(icon: string): ServiceItem | undefined {
  return homeServices.find(service => service.icon === icon);
}

/**
 * 获取高精度评价数（用于随机展示）
 */
export function getRandomTestimonials(count: number = 3): TestimonialItem[] {
  const shuffled = [...homeTestimonials].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
