/**
 * SEO 和页面元数据集中管理
 * 统一维护所有页面的元数据、描述、关键词等
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
}

// ========================================
// 页面元数据定义
// ========================================

export const pagesMetadata: Record<string, PageMetadata> = {
  // 主页
  home: {
    title: '宏翔商道 - AI驱动的综合性企业服务平台',
    description: '宏翔商道是一家集AI技术、人力资源、供应链管理、知识产权服务于一体的综合性企业，为客户提供数字化转型和智能化解决方案。',
    keywords: ['AI技术', '人力资源', '供应链', '知识产权', '企业服务'],
    ogType: 'website',
  },

  // 公司信息
  about: {
    title: '关于我们 - 宏翔商道',
    description: '了解宏翔商道的发展历程、核心价值观和企业文化。我们致力于用技术驱动商业创新。',
    keywords: ['公司简介', '企业文化', '发展历程', '核心价值观'],
  },

  leadership: {
    title: '管理层 - 宏翔商道',
    description: '了解宏翔商道核心管理团队，他们的背景、专业经验及领导愿景。',
    keywords: ['管理团队', '执行董事', '专业经历', '领导力'],
  },

  brand: {
    title: '商标品牌 - 宏翔商道',
    description: '宏翔商道品牌中心。汇集品牌规范、品牌语言与市场传播资源，确保全球传播的一致性与专业度。',
    keywords: ['品牌指南', 'LOGO', '品牌规范', '视觉识别'],
  },

  careers: {
    title: '招贤纳士 - 宏翔商道',
    description: '加入宏翔商道，与我们一起用AI技术改变世界。我们提供有竞争力的薪酬、完善的福利和广阔的发展空间。',
    keywords: ['招聘', '职位', '工作机会', '招聘信息'],
  },

  contact: {
    title: '联系我们 - 宏翔商道',
    description: '联系宏翔商道，我们很乐意为您解答任何问题。提供多种联系方式和在线咨询。',
    keywords: ['联系方式', '反馈表单', '在线客服', '公司地址'],
  },

  // 服务页面
  'service-ai-design': {
    title: 'AI设计与训练服务 - 企业级人工智能解决方案 | 宏翔商道',
    description: '借助大模型、机器视觉等前沿AI技术，为企业提供可落地的AI产品，助力企业数字化转型与智能决策。',
    keywords: ['AI设计', '机器学习', '人工智能', '智能化', '数字化转型'],
  },

  'service-hr': {
    title: '人力资源服务 - HR综合解决方案 | 宏翔商道',
    description: '包括劳务派遣、招聘背调、人才测评与职业发展平台，打造合规、高效、灵活的人才体系。',
    keywords: ['人力资源', '劳务派遣', '招聘', '人才管理', 'HR服务'],
  },

  'service-supply-chain': {
    title: '供应链管理服务 - 智慧供应链解决方案 | 宏翔商道',
    description: '打通采购、生产、仓储、物流与贸易金融，全程可视化与预测性分析，帮助企业降本增效。',
    keywords: ['供应链', '物流', '采购', '仓储', '供应链优化'],
  },

  'service-trademark': {
    title: '商标代理服务 - 知识产权保护 | 宏翔商道',
    description: '专业的商标注册、转让、续展等知识产权服务，全面保护您的品牌资产。',
    keywords: ['商标代理', '知识产权', '商标注册', '专利申请', '知识产权保护'],
  },

  // 博客与文章
  blog: {
    title: '文章中心 - 宏翔商道',
    description: '阅读宏翔商道的最新文章、行业资讯和专业见解，了解AI和企业服务的最新发展趋势。',
    keywords: ['文章', '博客', '行业资讯', '技术分享', '案例分析'],
  },

  categories: {
    title: '文章分类 - 宏翔商道',
    description: '按分类浏览宏翔商道的精选文章和专业内容。',
    keywords: ['分类', '文章', '内容分类'],
  },

  tags: {
    title: '标签 - 宏翔商道',
    description: '按标签浏览宏翔商道的文章和内容。',
    keywords: ['标签', '文章标签', '内容标签'],
  },
};

// ========================================
// 辅助函数
// ========================================

/**
 * 获取页面元数据
 * @param pageKey 页面标识符
 * @returns 页面元数据对象
 */
export function getPageMetadata(pageKey: string): PageMetadata | undefined {
  return pagesMetadata[pageKey];
}

/**
 * 获取所有页面元数据（用于 sitemap、SEO 分析等）
 */
export function getAllPagesMetadata(): Record<string, PageMetadata> {
  return pagesMetadata;
}

/**
 * 生成 SEO 标题
 * @param pageTitle 页面标题
 * @param suffix 后缀（默认追加 " | 宏翔商道"）
 */
export function generateSeoTitle(pageTitle: string, suffix: string = ' | 宏翔商道'): string {
  if (pageTitle.includes(suffix)) {
    return pageTitle;
  }
  return `${pageTitle}${suffix}`;
}

/**
 * 生成 Open Graph 标签数据
 */
export function generateOgTags(pageKey: string) {
  const metadata = getPageMetadata(pageKey);
  if (!metadata) return null;

  return {
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:type': metadata.ogType || 'website',
    'og:image': metadata.ogImage,
  };
}

/**
 * 生成 Twitter Card 标签数据
 */
export function generateTwitterTags(pageKey: string) {
  const metadata = getPageMetadata(pageKey);
  if (!metadata) return null;

  return {
    'twitter:card': metadata.twitterCard || 'summary',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.ogImage,
  };
}

/**
 * 获取规范的 URL（用于 canonical tag）
 */
export function getCanonicalUrl(path: string, baseUrl: string = 'https://www.hongxiangshangdao.com'): string {
  // 移除尾部斜杠，确保规范格式
  const cleanPath = path.replace(/\/$/, '') || '/';
  return `${baseUrl}${cleanPath}`;
}
