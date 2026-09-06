/**
 * 导航菜单数据集中管理
 * 统一管理所有导航链接，避免重复定义
 * 支持 header 和 footer 导航的统一配置
 */

interface NavLink {
  text: string;
  href: string;
  target?: string;
}

interface NavLinkGroup {
  text: string;
  links?: NavLink[];
  href?: string;
}

// ========================================
// 核心导航项定义
// ========================================

export const serviceLinks: NavLink[] = [
  {
    text: 'AI设计与训练',
    href: '/service/ai-design',
  },
  {
    text: '人力资源服务',
    href: '/service/hr-services',
  },
  {
    text: '商标代理服务',
    href: '/service/trademark-agency',
  },
  {
    text: '供应链服务',
    href: '/service/supply-chain',
  },
];

export const blogLinks: NavLink[] = [
  {
    text: '全部文章',
    href: '/blog',
  },
  {
    text: '分类页面',
    href: '/static/categories',
  },
  {
    text: '标签页面',
    href: '/static/tags',
  },
];

export const companyLinks: NavLink[] = [
  {
    text: '关于我们',
    href: '/company/about',
  },
  {
    text: '管理层',
    href: '/company/leadership',
  },
  {
    text: '商标品牌',
    href: '/company/brand',
  },
  {
    text: '招贤纳士',
    href: '/company/careers',
  },
  {
    text: '联系我们',
    href: '/company/contact',
  },
];

// ========================================
// Header 导航配置
// ========================================

export const headerNavLinks: NavLinkGroup[] = [
  {
    text: '主页',
    href: '/',
  },
  {
    text: '服务',
    links: serviceLinks,
  },
  {
    text: '文章',
    links: blogLinks,
  },
  {
    text: '公司',
    links: companyLinks,
  },
];

// ========================================
// Footer 导航配置
// ========================================

export const footerNavLinks = [
  {
    title: '核心服务',
    links: serviceLinks,
  },
  {
    title: '技术方案',
    links: [
      { text: '人工智能解决方案', href: '#' },
      { text: '数字化转型', href: '#' },
      { text: '智能制造', href: '#' },
      { text: '创新创业孵化', href: '#' },
    ],
  },
  {
    title: '公司信息',
    links: companyLinks,
  },
  {
    title: '资源中心',
    links: [
      { text: '常见问题', href: '#' },
      { text: '文档中心', href: '/blog' },
      { text: '案例研究', href: '#' },
    ],
  },
];

// ========================================
// 辅助函数
// ========================================

/**
 * 获取所有第一级导航链接（用于 sitemap、搜索等）
 */
export function getAllNavLinks(): NavLink[] {
  const allLinks: NavLink[] = [];
  
  // 添加 header 导航链接
  headerNavLinks.forEach(item => {
    if (item.href) {
      allLinks.push({ text: item.text, href: item.href });
    }
    if (item.links) {
      allLinks.push(...item.links);
    }
  });
  
  return allLinks;
}

/**
 * 根据 URL 匹配导航项
 */
export function findNavItemByHref(href: string): NavLink | undefined {
  return getAllNavLinks().find(link => link.href === href);
}

/**
 * 生成面包屑导航数据
 */
export function generateBreadcrumbs(currentPath: string): NavLink[] {
  const breadcrumbs: NavLink[] = [
    { text: '首页', href: '/' }
  ];
  
  const navLink = findNavItemByHref(currentPath);
  if (navLink) {
    breadcrumbs.push(navLink);
  }
  
  return breadcrumbs;
}

/**
 * 检查 URL 是否为活跃导航项
 */
export function isActiveNavItem(currentPath: string, navHref: string): boolean {
  return currentPath === navHref || currentPath.startsWith(navHref + '/');
}
