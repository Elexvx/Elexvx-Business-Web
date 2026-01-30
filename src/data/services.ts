/**
 * 服务页面内容集中管理
 * 统一维护所有服务页面的内容：AI设计、HR服务、供应链、商标代理
 */

export interface ServicePageContent {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  steps: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  benefits: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  stats?: Array<{
    title: string;
    amount: number | string;
    suffix?: string;
  }>;
  cta?: {
    text: string;
    href: string;
  };
}

// ========================================
// AI 设计与训练服务
// ========================================

export const aiDesignService: ServicePageContent = {
  id: 'ai-design',
  name: 'AI设计与训练',
  title: 'AI设计与训练服务',
  subtitle: '企业级人工智能解决方案',
  description: '借助大模型、机器视觉等前沿AI技术，为企业提供可落地的AI产品，助力企业实现数字化转型与智能决策。',
  features: [
    {
      title: '大模型应用',
      description: '基于ChatGPT、GPT-4等大模型，快速开发AI应用，降低企业AI门槛。',
      icon: 'tabler:brain',
    },
    {
      title: '机器视觉',
      description: '图像识别、物体检测、OCR等视觉AI能力，赋能制造、物流、零售等行业。',
      icon: 'tabler:eye',
    },
    {
      title: '自然语言处理',
      description: '文本分析、情感识别、知识抽取等NLP能力，优化客服、内容管理等业务。',
      icon: 'tabler:language',
    },
    {
      title: '预测分析',
      description: '基于机器学习的预测模型，为企业提供数据驱动的决策支持。',
      icon: 'tabler:chart-line',
    },
  ],
  steps: [
    {
      title: '需求分析',
      description: '深入理解您的业务场景和痛点，制定AI解决方案',
    },
    {
      title: '模型开发',
      description: '数据采集、特征工程、模型训练和优化',
    },
    {
      title: '系统集成',
      description: '将AI模型集成到您的现有系统中',
    },
    {
      title: '上线部署',
      description: '全面测试、灰度发布、持续监控和优化',
    },
  ],
  benefits: [
    {
      title: '降低成本',
      description: '自动化流程，减少人力成本投入',
      icon: 'tabler:coin',
    },
    {
      title: '提升效率',
      description: '加快决策速度，提高业务效率',
      icon: 'tabler:rocket',
    },
    {
      title: '增强竞争力',
      description: '掌握前沿技术，获得市场优势',
      icon: 'tabler:trophy',
    },
  ],
};

// ========================================
// 人力资源服务
// ========================================

export const hrService: ServicePageContent = {
  id: 'hr-services',
  name: '人力资源服务',
  title: '人力资源服务',
  subtitle: 'HR综合解决方案',
  description: '包括劳务派遣、招聘背调、人才测评与职业发展平台，打造合规、高效、灵活的人才体系。',
  features: [
    {
      title: '劳务派遣',
      description: '合规的劳务派遣服务，灵活应对企业用工需求',
      icon: 'tabler:users-group',
    },
    {
      title: '招聘背调',
      description: '专业的背景调查，确保招聘质量',
      icon: 'tabler:search',
    },
    {
      title: '人才测评',
      description: '科学的心理测评和能力评估，发现优秀人才',
      icon: 'tabler:test-pipe',
    },
    {
      title: '职业发展',
      description: '个性化的职业发展规划，打造人才梯队',
      icon: 'tabler:trending-up',
    },
  ],
  steps: [
    {
      title: '需求评估',
      description: '了解企业的人才需求和发展目标',
    },
    {
      title: '方案设计',
      description: '根据需求设计HR服务解决方案',
    },
    {
      title: '实施执行',
      description: '招聘、背调、测评等服务的执行',
    },
    {
      title: '持续优化',
      description: '定期评估效果，持续改进服务',
    },
  ],
  benefits: [
    {
      title: '降低风险',
      description: '规范用工，降低法律风险',
      icon: 'tabler:shield-check',
    },
    {
      title: '提高招聘效率',
      description: '快速找到合适的人才',
      icon: 'tabler:clock',
    },
    {
      title: '优化人才结构',
      description: '建立完整的人才体系',
      icon: 'tabler:hierarchy-2',
    },
  ],
};

// ========================================
// 供应链服务
// ========================================

export const supplyChainService: ServicePageContent = {
  id: 'supply-chain',
  name: '供应链服务',
  title: '供应链管理服务',
  subtitle: '智慧供应链解决方案',
  description: '打通采购、生产、仓储、物流与贸易金融，全程可视化与预测性分析，帮助企业降本增效。',
  features: [
    {
      title: '采购管理',
      description: '优化采购流程，降低采购成本',
      icon: 'tabler:shopping-cart',
    },
    {
      title: '库存优化',
      description: '智能库存管理，减少积压和缺货',
      icon: 'tabler:box',
    },
    {
      title: '物流追踪',
      description: '实时物流可视化，掌握货物动向',
      icon: 'tabler:truck',
    },
    {
      title: '预测分析',
      description: '数据驱动的需求预测和计划',
      icon: 'tabler:chart-dots',
    },
  ],
  steps: [
    {
      title: '流程诊断',
      description: '分析现有供应链流程和瓶颈',
    },
    {
      title: '系统规划',
      description: '设计优化的供应链体系',
    },
    {
      title: '系统实施',
      description: '部署供应链管理系统',
    },
    {
      title: '持续运营',
      description: '监控效果，持续优化',
    },
  ],
  benefits: [
    {
      title: '降低成本',
      description: '减少库存，优化物流，降低整体成本',
      icon: 'tabler:coin',
    },
    {
      title: '提高效率',
      description: '缩短周期，提升响应速度',
      icon: 'tabler:rocket',
    },
    {
      title: '风险管理',
      description: '预见风险，提前应对',
      icon: 'tabler:shield-alert',
    },
  ],
};

// ========================================
// 商标代理服务
// ========================================

export const trademarkService: ServicePageContent = {
  id: 'trademark-agency',
  name: '商标代理服务',
  title: '商标代理服务',
  subtitle: '知识产权保护',
  description: '专业的商标注册、转让、续展等知识产权服务，全面保护您的品牌资产。',
  features: [
    {
      title: '商标注册',
      description: '专业的商标注册申请和代理服务',
      icon: 'tabler:certificate',
    },
    {
      title: '专利申请',
      description: '发明专利、实用新型、外观设计专利申请',
      icon: 'tabler:lightbulb',
    },
    {
      title: '版权登记',
      description: '保护您的创意作品和软件著作权',
      icon: 'tabler:copyright',
    },
    {
      title: '维权服务',
      description: '打击假冒伪劣，保护您的知识产权',
      icon: 'tabler:shield-check',
    },
  ],
  steps: [
    {
      title: '产品评估',
      description: '评估产品/品牌的知识产权保护需求',
    },
    {
      title: '申请策划',
      description: '制定最优的申请和保护策略',
    },
    {
      title: '申请代理',
      description: '完成商标、专利等申请程序',
    },
    {
      title: '维护管理',
      description: '定期续展，维护您的知识产权',
    },
  ],
  benefits: [
    {
      title: '法律保护',
      description: '获得法律保护，维护合法权益',
      icon: 'tabler:license',
    },
    {
      title: '品牌价值',
      description: '提升品牌价值和市场竞争力',
      icon: 'tabler:star',
    },
    {
      title: '资产增值',
      description: '知识产权成为企业资产',
      icon: 'tabler:trending-up',
    },
  ],
};

// ========================================
// 服务数据集合
// ========================================

export const servicesData: Record<string, ServicePageContent> = {
  'ai-design': aiDesignService,
  'hr-services': hrService,
  'supply-chain': supplyChainService,
  'trademark-agency': trademarkService,
};

// ========================================
// 辅助函数
// ========================================

/**
 * 获取服务内容
 */
export function getServiceContent(serviceId: string): ServicePageContent | undefined {
  return servicesData[serviceId];
}

/**
 * 获取所有服务
 */
export function getAllServices(): ServicePageContent[] {
  return Object.values(servicesData);
}

/**
 * 获取服务列表（简化）
 */
export function getServicesList(): Array<{ id: string; name: string; description: string }> {
  return Object.values(servicesData).map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
  }));
}

/**
 * 获取服务导航链接
 */
export function getServiceNavLinks() {
  return Object.values(servicesData).map(service => ({
    text: service.name,
    href: `/service/${service.id}`,
  }));
}
