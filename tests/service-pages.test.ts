import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { StatusMonitor } from '../src/data/service-status';
import { navigationGroups } from '../src/data/research-navigation';
import { serviceNavigation, serviceNavigationLinks } from '../src/data/service-navigation';
import { documentationUrl, serviceRoutePaths } from '../src/data/service-routes';
import { ServicesPage } from '../src/site/services/services-page';
import { availabilityTone, formatDay, groupStatusMonitors } from '../src/site/services/status-utils';
import esaRedirects from '../src/server/esa/redirects.json';
import { describe, expect, it } from 'vitest';

describe('integrated service pages', () => {
  it('keeps the navigation snapshot complete', () => {
    expect(serviceNavigation).toHaveLength(7);
    expect(serviceNavigationLinks).toHaveLength(30);
    expect(serviceNavigationLinks.find((link) => link.name === 'AI雷达')).toMatchObject({
      url: 'https://codex-reset-radar.pages.dev/',
      description: 'Codex 模型与额度信息',
      icon: '/images/logos/ai-radar.png',
    });
    expect(serviceNavigationLinks.find((link) => link.name === 'Google Antigravity')).toMatchObject({
      url: 'https://antigravity.google.com/',
      description: 'Google 智能体开发平台',
      icon: '/images/logos/antigravity.webp',
    });
    expect(serviceNavigationLinks.find((link) => link.name === 'PageSpeed Insights')).toMatchObject({
      url: 'https://pagespeed.web.dev/',
      description: 'Google 网页性能诊断与优化工具',
      icon: '/images/logos/pagespeed.webp',
    });
    expect(serviceNavigationLinks.find((link) => link.name === 'Google AI Studio')).toBeUndefined();
    expect(serviceNavigationLinks.find((link) => link.name === '四川版权综合服务平台')).toMatchObject({
      url: 'https://www.sc-copyright.cn/#/registration',
      description: '作品著作权登记系统',
      icon: '/images/logos/jscopyright.webp',
    });
    expect(serviceNavigationLinks.find((link) => link.name === '宏翔商道（南京）科技发展有限公司')).toMatchObject({
      description: '企查查',
    });
    expect(serviceNavigationLinks.find((link) => link.name === '江苏宏翔商道劳务服务有限公司')).toMatchObject({
      description: '企查查',
    });
    expect(serviceNavigationLinks.find((link) => link.name === '南京林汐智觉科技有限公司')).toMatchObject({
      description: '企查查',
    });
    expect(serviceNavigationLinks.find((link) => link.name === '江苏函九科技有限公司')).toMatchObject({
      url: 'https://www.qcc.com/firm/b07076ac0fa22651571aee60d2b1f02d.html',
      description: '企查查',
      icon: '/images/logos/qcc.webp',
    });
    expect(serviceNavigationLinks.find((link) => link.name === '项目管理系统')).toBeUndefined();
    expect(serviceNavigationLinks.find((link) => link.name === 'ElexvxAI Lab')).toBeUndefined();
    expect(serviceNavigationLinks.find((link) => link.name === '企查查-科技')).toBeUndefined();
    expect(serviceNavigationLinks.find((link) => link.name === '企查查-劳务')).toBeUndefined();
    expect(serviceNavigationLinks.find((link) => link.name === '企查查-林汐智觉')).toBeUndefined();
    expect(serviceNavigationLinks.find((link) => link.name.startsWith('爱企查'))).toBeUndefined();
  });

  it('groups status monitors by the shared service configuration', () => {
    const monitors: StatusMonitor[] = [
      {
        id: 1,
        name: 'A01-企业官网',
        url: 'https://www.elexvx.com/',
        status: 2,
        type: 1,
        interval: 300,
        percent: 100,
        days: [],
        down: { times: 0, duration: 0 },
      },
      {
        id: 2,
        name: 'J01-Blog',
        url: 'https://blog.elexvx.com/',
        status: 2,
        type: 1,
        interval: 300,
        percent: 100,
        days: [],
        down: { times: 0, duration: 0 },
      },
    ];

    expect(groupStatusMonitors(monitors).map((group) => group.name)).toEqual(['企业服务', '公共服务']);
  });

  it('marks a zero-uptime current day as an outage while keeping unknown history gray', () => {
    expect(availabilityTone(0)).toBe('unknown');
    expect(availabilityTone(0, true)).toBe('error');
    expect(availabilityTone(100, true)).toBe('healthy');
  });

  it('formats availability dates consistently for all monitor rows', () => {
    const newYear = new Date(2026, 0, 1).getTime() / 1000;
    expect(formatDay(newYear)).toBe('1月1日');
    expect(formatDay(newYear + 12 * 60 * 60)).toBe('1月1日');
  });

  it('keeps service entry points in the same navigation source as the main site', () => {
    const services = navigationGroups.find((group) => group.id === 'services');

    expect(services?.paths).toEqual(['/services', '/navigation', '/status', '/status/history']);
    expect(services?.columns.flatMap((column) => column.links)).toEqual([
      { label: '服务', href: '/services/' },
      { label: '帮助文档', href: documentationUrl },
      { label: '企业导航', href: '/navigation/' },
      { label: '服务状态', href: '/status/' },
    ]);
  });

  it('keeps the shared route availability limited to internal service pages', () => {
    expect(serviceRoutePaths).toEqual(['/services', '/navigation', '/status', '/status/history']);
  });

  it('routes both service domains through the ESA router', () => {
    const redirects = esaRedirects as Array<{
      source: string;
      destination: string;
      has?: Array<{ type: string; value: string }>;
    }>;
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/',
          destination: '/navigation/',
          has: [{ type: 'host', value: 'nav.elexvx.com' }],
        }),
        expect.objectContaining({
          source: '/',
          destination: '/status/',
          has: [{ type: 'host', value: 'status.elexvx.com' }],
        }),
        expect.objectContaining({
          source: '/history',
          destination: '/status/history/',
          has: [{ type: 'host', value: 'status.elexvx.com' }],
        }),
        expect.objectContaining({
          source: '/history/',
          destination: '/status/history/',
          has: [{ type: 'host', value: 'status.elexvx.com' }],
        }),
      ])
    );
  });

  it('renders eager WebP card background images without hydration-gated previews', () => {
    const html = renderToStaticMarkup(createElement(ServicesPage));

    expect(html.match(/class="service-overview-card-bg"/g)).toHaveLength(3);
    expect(html).toContain('src="/visuals/services/documentation.webp"');
    expect(html).toContain('src="/visuals/services/navigation.webp"');
    expect(html).toContain('loading="eager"');
    expect(html.toLowerCase()).toContain('fetchpriority="high"');
    expect(html).not.toContain('data-preview');
    expect(html).not.toContain('/visuals/services/documentation.jpg');
  });
});
