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
    src: '~/assets/images/brand/1.png',
    alt: '宏翔商道品牌标志',
    description: '标准版：全彩渐变，仅限白底或亮度 >95% 的浅色背景',
  },
  {
    src: '~/assets/images/brand/2.png',
    alt: '宏翔商道品牌标志反白',
    description: '反白版：用于深色背景',
  },
  {
    src: '~/assets/images/brand/3.png',
    alt: '宏翔商道品牌标志单色',
    description: '单色版：用于限制颜色印刷或黑白媒体',
  },
];

export const brandColors: BrandColor[] = [
  {
    name: '品牌蓝',
    hex: '#0066FF',
    rgb: 'rgb(0, 102, 255)',
    usage: '主色调，用于主要界面元素',
  },
  {
    name: '辅助绿',
    hex: '#00CC99',
    rgb: 'rgb(0, 204, 153)',
    usage: '成功状态、强调色',
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
    content: '标志应始终以原始纵横比显示，最小尺寸为 80px × 80px',
    examples: ['Web: 最小 40px', 'Print: 最小 1cm'],
  },
  {
    title: '清晰空间',
    content: '标志周围必须保持清晰空间，距离至少为标志高度的 25%',
    examples: ['标志周围不应放置其他元素', '保持足够的视觉距离'],
  },
  {
    title: '颜色应用',
    content: '优先使用全彩版本。在限制颜色的情况下，使用单色版本',
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
