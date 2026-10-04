/**
 * Contact data restored from the original company contact page.
 * Source: commit f59b3f41a6e4ad95a350da2c8ab19c3abe75eb3c,
 * src/pages/company/contact.astro (primary email at L34; office cards at L38-L108;
 * department email cards at L111-L149).
 *
 * The HR entity name is visible on the business and service-license scans used by
 * src/pages/service/hr-services.astro (same commit, L96-L123). No legal names are
 * assigned to the other two office groups.
 */
export const primaryContactEmail = 'elexvx@elexvx.com';

export const departmentContactEmails = [
  { id: 'shareholders', department: '股东会', email: primaryContactEmail },
  { id: 'investment', department: '投资发展部', email: 'vc@elexvx.com' },
  { id: 'human-resources', department: '人事部', email: 'hr@elexvx.com' },
  { id: 'product-support', department: '产品支持', email: 'support@elexvx.com' },
  { id: 'software-technology', department: '软件技术部', email: 'it@elexvx.com' },
  { id: 'discipline-inspection', department: '支部纪检组', email: 'jw@elexvx.com' },
] as const;

export const contactOffices = [
  {
    id: 'research-center',
    title: '研发中心',
    region: '中国 · 江苏 · 南京 · 建邺区',
    address: '平良大街89号负一层韶华工坊773号',
    mapHref: 'https://ditu.amap.com/search?query=%E9%9F%B6%E5%8D%8E%E5%B7%A5%E5%9D%8A',
    businessCreditHref: 'https://aiqicha.baidu.com/company_detail_56215758055636',
  },
  {
    id: 'human-resources-office',
    title: '人力资源',
    region: '中国 · 江苏 · 南京 · 六合区',
    address: '金牛湖街道八百桥社区青龙市场街109号1928室',
    organizationName: '江苏宏翔商道劳务服务有限公司',
    mapHref: 'https://ditu.amap.com/place/B0GKJ5ZNLU',
    businessCreditHref: 'https://aiqicha.baidu.com/company_detail_56910435771118',
  },
  {
    id: 'trade-retail',
    title: '商贸零售',
    region: '中国 · 江苏 · 镇江 · 句容市',
    address: '宝华镇开发区121号',
    mapHref: 'https://ditu.amap.com/place/BZAQQH007U',
    businessCreditHref: 'https://aiqicha.baidu.com/company_detail_51228677772700',
  },
] as const;
