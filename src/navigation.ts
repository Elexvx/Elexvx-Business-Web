import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';
import { headerNavLinks, footerNavLinks } from './data/navigation';

/**
 * Header 导航配置
 * 数据来源：src/data/navigation.ts
 */
export const headerData = {
  links: headerNavLinks,
  // actions: [{ text: '下载', href: 'https://github.com/onwidget/astrowind', target: '_blank' }],
};


// 页面底部修改位置 开始 *****************************
/**
 * Footer 导航配置
 * 数据来源：src/data/navigation.ts
 */
export const footerData = {
  links: footerNavLinks,
  secondaryLinks: [
    { text: '服务条款', href: getPermalink('/md/terms') },
    { text: '隐私政策', href: getPermalink('/md/privacy') },
  ],
  socialLinks: [
    // { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    // { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    // { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    // { ariaLabel: 'Github', icon: 'tabler:brand-github', href: '#' },
  ],
  wechatQrcode: getAsset('/images/wechat-qr.svg'),
  footNote: `
    宏翔商道 &copy 2024 - 2025 · Redesigned by Elexvx Inc
    <br>备案号：<a target="_blank" class="text-blue-600 underline dark:text-muted" href="https://beian.miit.gov.cn/">苏ICP备2025160017号</a> | <a class="text-blue-600 underline dark:text-muted" target="_blank" href="https://status.elexvx.com/">网站运行正常</a>
  `,
};
// 页面底部修改位置 结束 *****************************
//  <img class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 rtl:mr-0 rtl:ml-1.5 float-left rtl:float-right rounded-sm" src="https://onwidget.com/favicon/favicon-32x32.png" alt="onWidget logo" loading="lazy"></img>
