import type { StatusMonitor } from '../src/data/service-status';
import { navigationGroups } from '../src/data/research-navigation';
import { serviceNavigation, serviceNavigationLinks } from '../src/data/service-navigation';
import { serviceRoutePaths } from '../src/data/service-routes';
import { availabilityTone, formatDay, groupStatusMonitors } from '../src/site/services/status-utils';
import vercelConfig from '../vercel.json';
import { describe, expect, it } from 'vitest';

describe('integrated service pages', () => {
  it('keeps the navigation snapshot complete', () => {
    expect(serviceNavigation).toHaveLength(6);
    expect(serviceNavigationLinks).toHaveLength(34);
    expect(serviceNavigationLinks.find((link) => link.name === 'AI雷达')).toMatchObject({
      url: 'https://codex-reset-radar.pages.dev/',
      description: 'Codex 模型与额度信息',
      icon: '/images/logos/ai-radar.png',
    });
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

    expect(services?.paths).toEqual(['/services', '/services/docs', '/navigation', '/status', '/status/history']);
    expect(services?.columns.flatMap((column) => column.links)).toEqual([
      { label: '服务', href: '/services/' },
      { label: '帮助文档', href: '/services/docs/' },
      { label: '企业导航', href: '/navigation/' },
      { label: '服务状态', href: '/status/' },
    ]);
  });

  it('keeps the service hub and documentation route in shared availability', () => {
    expect(serviceRoutePaths).toEqual(['/services', '/services/docs', '/navigation', '/status', '/status/history']);
  });

  it('routes both service domains through the same Vercel project', () => {
    const redirects = vercelConfig.redirects as Array<{
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
});
