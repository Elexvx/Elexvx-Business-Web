export const qualificationCategories = [
  { id: 'honors', title: '荣誉资质', englishTitle: 'Honors' },
  { id: 'business', title: '经营资质', englishTitle: 'Business qualifications' },
  { id: 'ip', title: '知识产权', englishTitle: 'Intellectual property' },
] as const;

export const intellectualPropertyCategories = [
  { id: 'trademark', title: '商标', englishTitle: 'Trademarks' },
  { id: 'software', title: '软件著作权', englishTitle: 'Software copyrights' },
  { id: 'patent', title: '专利', englishTitle: 'Patents' },
  { id: 'copyright', title: '著作权', englishTitle: 'Copyrights' },
] as const;

type Qualification = {
  id: string;
  title: string;
  englishTitle: string;
  image: string;
  registration?: string;
  registeredAt?: string;
  category: (typeof qualificationCategories)[number]['id'];
  subtype?: (typeof intellectualPropertyCategories)[number]['id'];
};

// User-supplied materials; preserve original images without modifying certificate content.
export const qualifications: Qualification[] = [
  {
    id: 'software-2026SR0501747',
    title: '起重机械工业物联网预警运维平台 V1.0',
    englishTitle: 'Lifting Machinery Industrial IoT Early Warning and Maintenance Platform V1.0',
    image: '/company/qualifications/software-2026SR0501747.png',
    category: 'ip',
    subtype: 'software',
    registration: '2026SR0501747',
    registeredAt: '2026-03-27',
  },
  {
    id: 'technology-sme',
    title: '国家级科技型中小企业',
    englishTitle: 'Technology-based SME',
    image: '/company/qualifications/technology-sme.png',
    category: 'honors',
  },
  {
    id: 'labor-dispatch',
    title: '劳务派遣经营许可证',
    englishTitle: 'Labor dispatch business license',
    image: '/company/qualifications/labor-dispatch-license.png',
    category: 'business',
  },
  {
    id: 'trademark-83097947',
    title: 'elexvx 商标注册证（第35类）',
    englishTitle: 'elexvx trademark registration (Class 35)',
    image: '/company/qualifications/elexvx-trademark-83097947.png',
    category: 'ip',
    subtype: 'trademark',
  },
];
