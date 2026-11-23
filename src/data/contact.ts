export const primaryContactEmail = 'elexvx@elexvx.com';
export const hrContactEmail = 'hr@elexvx.com';

export const startCollaborationAction = { label: '开始合作', href: '/contact' } as const;

export const departmentContactEmails = [
  { id: 'shareholders', department: '股东会', email: primaryContactEmail },
  { id: 'investment', department: '投资发展部', email: 'vc@elexvx.com' },
  { id: 'human-resources', department: '人事部', email: hrContactEmail },
  { id: 'product-support', department: '产品支持', email: 'support@elexvx.com' },
  { id: 'software-technology', department: '软件技术部', email: 'it@elexvx.com' },
  { id: 'discipline-inspection', department: '支部纪检组', email: 'jw@elexvx.com' },
] as const;

export const contactOffices = [
  {
    id: 'research-center',
    title: '研发中心',
    region: null,
    address: '南京市建邺区邺城路19号B座14楼青奥模数空间1417-43室',
    organizationName: '宏翔商道（南京）科技发展有限公司',
    businessCreditHref: 'https://www.qcc.com/firm/2edfb36b4a31a1194203251df76a2371.html',
  },
  {
    id: 'human-resources-office',
    title: '人力资源',
    region: null,
    address: '金牛湖街道八百桥社区青龙市场街109号1928室',
    organizationName: '江苏宏翔商道劳务服务有限公司',
    businessCreditHref: 'https://aiqicha.baidu.com/company_detail_56910435771118',
  },
  {
    id: 'trade-retail',
    title: '商贸零售',
    region: '中国 · 江苏 · 镇江 · 句容市',
    address: '宝华镇开发区121号',
    businessCreditHref: 'https://aiqicha.baidu.com/company_detail_51228677772700',
  },
] as const;
