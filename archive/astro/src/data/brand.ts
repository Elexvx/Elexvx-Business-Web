/**
 * 品牌资源集中管理
 * 统一维护品牌资源、颜色规范、指导方针等
 */

export interface BrandAsset {
  src: string;
  alt: string;
  description?: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  rgb?: string;
  usage?: string;
}

export interface BrandGuideline {
  title: string;
  content: string;
  examples?: string[];
}

// ========================================
// 品牌视觉资产
// ========================================

export const brandLogos: BrandAsset[] = [
  {
    src: '~/assets/images/brand/elexvx-logo.svg',
    alt: 'Elexvx 主品牌标志',
    description: '标准版：品牌蓝单色，用于白色或浅色背景',
  },
  {
    src: '~/assets/images/brand/elexvx-logo-reverse.svg',
    alt: 'Elexvx 反白标志',
    description: '反白版：用于深色背景与数字界面',
  },
  {
    src: '~/assets/images/brand/elexvx-logo-black.svg',
    alt: 'Elexvx 单色黑标志',
    description: '单色版：用于限制颜色印刷或黑白媒体',
  },
];

export const brandColors: BrandColor[] = [
  {
    name: '品牌蓝',
    hex: '#0B3EA8',
    rgb: 'rgb(11, 62, 168)',
    usage: '主标识与重点品牌触点',
  },
  {
    name: '纯黑',
    hex: '#111111',
    rgb: 'rgb(17, 17, 17)',
    usage: '单色印刷与正文',
  },
  {
    name: '中性灰',
    hex: '#F5F5F5',
    rgb: 'rgb(245, 245, 245)',
    usage: '背景色、分割线',
  },
];

// ========================================
// 品牌指导方针
// ========================================

export const brandGuidelines: BrandGuideline[] = [
  {
    title: '标志使用',
    content: '主标志应始终保持原始比例；小于 96px 时改用独立图形标志',
    examples: ['主标志：Web 最小宽度 96px', '图形标志：Web 最小 16px / Print 最小 6mm'],
  },
  {
    title: '清晰空间',
    content: '标志四周至少保留图形标志中一条横杠高度的清晰空间',
    examples: ['标志周围不应放置其他元素', '保持足够的视觉距离'],
  },
  {
    title: '颜色应用',
    content: '优先使用品牌蓝单色版本；深色背景使用反白版本',
    examples: ['深色背景：使用反白版本', '黑白印刷：使用单色版本'],
  },
  {
    title: '禁止行为',
    content: '不要修改、拉伸、旋转或改变标志颜色',
    examples: ['禁止添加阴影或渐变', '禁止与其他图形组合'],
  },
];

// ========================================
// 字体规范
// ========================================

export interface FontFamily {
  name: string;
  family: string;
  usage: string;
  weights?: string[];
}

export const brandFonts: FontFamily[] = [
  {
    name: '品牌标题字体',
    family: 'Inter, sans-serif',
    usage: '用于所有标题和主要文本',
    weights: ['600', '700', '800'],
  },
  {
    name: '正文字体',
    family: 'Inter, sans-serif',
    usage: '用于正文和描述文本',
    weights: ['400', '500'],
  },
  {
    name: '中文字体',
    family: '思源黑体, sans-serif',
    usage: '中文内容优先使用',
    weights: ['400', '600'],
  },
];

// ========================================
// 辅助函数
// ========================================

/**
 * 获取品牌颜色值
 */
export function getBrandColor(colorName: string): string | undefined {
  const color = brandColors.find(c => c.name === colorName);
  return color?.hex;
}

/**
 * 获取所有品牌资源
 */
export function getAllBrandAssets() {
  return {
    logos: brandLogos,
    colors: brandColors,
    fonts: brandFonts,
    guidelines: brandGuidelines,
  };
}

/**
 * 按类别获取品牌指导
 */
export function getBrandGuidelineByTitle(title: string): BrandGuideline | undefined {
  return brandGuidelines.find(g => g.title === title);
}
