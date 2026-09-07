export const qualificationCategories = [
  { id: 'honors', title: '荣誉资质', englishTitle: 'Honors' },
  { id: 'business', title: '经营资质', englishTitle: 'Business qualifications' },
  { id: 'ip', title: '知识产权', englishTitle: 'Intellectual property' },
] as const;

export const intellectualPropertyCategories = [
  { id: 'patent', title: '实用新型专利', englishTitle: 'Utility model patents' },
  { id: 'trademark', title: '商标注册证书', englishTitle: 'Trademark registrations' },
  { id: 'software', title: '软件著作权', englishTitle: 'Software copyrights' },
  { id: 'copyright', title: '作品登记证书', englishTitle: 'Work registration certificates' },
] as const;

type Qualification = {
  id: string;
  title: string;
  englishTitle: string;
  image: string;
  category: (typeof qualificationCategories)[number]['id'];
  subtype?: (typeof intellectualPropertyCategories)[number]['id'];
};

// User-supplied materials; qualification image files include a light embedded display watermark.
export const qualifications: Qualification[] = [
{
  "id": "campus-portal",
  "title": "基于SpringBoot和VUE技术校园信息门户的设计",
  "englishTitle": "Campus Information Portal Design Based on SpringBoot and Vue",
  "image": "/company/qualifications/campus-portal-1.png",
  "category": "ip",
  "subtype": "copyright",
},
{
  "id": "crane-plan",
  "title": "集成AI与工业物联网的起重设备安全防护系统项目计划书",
  "englishTitle": "AI and Industrial IoT Crane Safety System Project Plan",
  "image": "/company/qualifications/crane-plan-1.png",
  "category": "ip",
  "subtype": "copyright",
},
{
  "id": "elexvx-artwork",
  "title": "elexvx图案标识",
  "englishTitle": "elexvx Visual Identity",
  "image": "/company/qualifications/elexvx-artwork-1.png",
  "category": "ip",
  "subtype": "copyright",
},
{
  "id": "elexvx-dci",
  "title": "elexvx图案标识 DCI 申领信息",
  "englishTitle": "elexvx Visual Identity DCI Application Information",
  "image": "/company/qualifications/elexvx-dci-1.png",
  "category": "ip",
  "subtype": "copyright"
},
{
  "id": "patent-2026200816889",
  "title": "一种港口起重设备磁吸传感器固定装置",
  "englishTitle": "Magnetic Sensor Mounting Device for Port Lifting Equipment",
  "image": "/company/qualifications/patent-acceptance-2026200816889.png",
  "category": "ip",
  "subtype": "patent",
},
  {
    id: 'software-2026SR0501747',
    title: '起重机械工业物联网预警运维平台',
    englishTitle: 'Lifting Machinery Industrial IoT Early Warning and Maintenance Platform',
    image: '/company/qualifications/software-2026SR0501747.png',
    category: 'ip',
    subtype: 'software',
  },
  {
    id: 'software-2023SR0755057',
    title: '服务器资源在线管理系统',
    englishTitle: 'Server Resource Online Management System',
    image: '/company/qualifications/software-2023SR0755057.jpg',
    category: 'ip',
    subtype: 'software',
  },
  {
    id: 'software-2022SR1632187',
    title: '起重设备智能一体化监控系统',
    englishTitle: 'Integrated Intelligent Monitoring System for Lifting Equipment',
    image: '/company/qualifications/software-2022SR1632187.png',
    category: 'ip',
    subtype: 'software',
  },
  {
    id: 'technology-sme',
    title: '国家级科技型中小企业',
    englishTitle: 'Technology-based SME',
    image: '/company/qualifications/technology-sme.png',
    category: 'honors',
  },
  {
    id: 'aaa-credit-enterprise',
    title: 'AAA级信用企业',
    englishTitle: 'AAA Credit Enterprise',
    image: '/company/qualifications/aaa-credit-enterprise.jpg',
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
    title: 'elexvx 商标注册证',
    englishTitle: 'elexvx trademark registration',
    image: '/company/qualifications/elexvx-trademark-83097947.png',
    category: 'ip',
    subtype: 'trademark',
  },
];
