import { humiteContent } from '#humite-content';

type BrandLogo = {
  src: string;
  darkSrc?: string;
  width: number;
  height: number;
  format?: 'wide-wordmark' | 'wide-symbol' | 'overlap-symbol';
};

type HomeBrand = {
  name: string;
  logo: BrandLogo;
  showName?: boolean;
  colorful?: boolean;
};

// Use one lockup per brand; viewBoxes are trimmed to the artwork for consistent sizing.
export const homeBrands: HomeBrand[] = [
  {
    name: '阿里云',
    logo: { src: '/brand/ecosystem/alibaba-cloud-wordmark.svg', width: 644.19, height: 72, format: 'wide-wordmark' },
  },
  {
    name: '腾讯',
    colorful: true,
    logo: { src: '/brand/ecosystem/tencent.svg', width: 1014.92, height: 130.25, format: 'wide-wordmark' },
  },
  {
    name: 'Apple',
    logo: { src: '/brand/ecosystem/apple.svg', width: 2424.43, height: 829.96 },
  },
  {
    name: 'Google',
    colorful: true,
    logo: { src: '/brand/ecosystem/google-wordmark.svg', width: 749.99, height: 257.61 },
  },
  {
    name: 'GitHub',
    logo: { src: '/brand/ecosystem/github.svg', width: 105.85, height: 25 },
  },
  {
    name: 'OpenAI',
    logo: { src: '/brand/ecosystem/openai-wordmark.svg', width: 935.63, height: 231 },
  },
  {
    name: 'DeepSeek',
    colorful: true,
    logo: { src: '/brand/ecosystem/deepseek.svg', width: 1809.99, height: 384.28 },
  },
  {
    name: 'Grok',
    logo: { src: '/brand/ecosystem/grok.svg', width: 88.27, height: 33 },
  },
  {
    name: '桐谷霁屿',
    logo: { src: '/brand/ecosystem/tongujiyu.png', width: 1280, height: 1280, format: 'wide-symbol' },
    showName: true,
  },
  {
    name: '林汐智觉',
    logo: {
      src: '/brand/ecosystem/linxi-cognitive-tech.svg',
      darkSrc: '/brand/ecosystem/linxi-cognitive-tech-white.svg',
      width: 372,
      height: 432,
    },
    showName: true,
  },
  {
    name: 'TikTok',
    colorful: true,
    logo: { src: '/brand/ecosystem/tiktok.svg', width: 119.27, height: 29.74 },
  },
  {
    name: '支付宝',
    colorful: true,
    logo: { src: '/brand/ecosystem/alipay.svg', width: 856, height: 301 },
  },
  {
    name: '微信支付',
    colorful: true,
    logo: { src: '/brand/ecosystem/wechat-pay.svg', width: 1229.8, height: 1025 },
    showName: true,
  },
  {
    name: 'Visa',
    colorful: true,
    logo: { src: '/brand/ecosystem/visa.svg', width: 1000, height: 324.68 },
  },
  {
    name: 'Mastercard',
    colorful: true,
    logo: { src: '/brand/ecosystem/mastercard.svg', width: 465.5, height: 288.8, format: 'overlap-symbol' },
    showName: true,
  },
  {
    name: 'Google Cloud',
    colorful: true,
    logo: { src: '/brand/ecosystem/google-cloud.svg', width: 178, height: 30, format: 'wide-wordmark' },
  },
  {
    name: 'Vercel',
    logo: { src: '/brand/ecosystem/vercel.svg', width: 283, height: 64 },
  },
  {
    name: '集米荟',
    colorful: true,
    logo: { src: '/brand/ecosystem/jimihui.svg', width: 682, height: 682 },
    showName: true,
  },
  {
    name: '集数财务',
    colorful: true,
    logo: { src: '/brand/ecosystem/jishu-financial.svg', width: 380, height: 286 },
    showName: true,
  },
];

export const homeIntro = humiteContent?.intro ?? null;
