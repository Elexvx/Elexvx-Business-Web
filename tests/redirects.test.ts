import vercelConfig from '../vercel.json';
import { redirectRoutes } from '../src/site/routing/routes';
import { describe, expect, it } from 'vitest';
import { getStaticRoutes } from '../src/site/routing/routes';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';

type VercelRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: Array<{ type: string; key?: string; value: string }>;
};

describe('redirect configuration', () => {
  it('keeps the static fallback pages and Vercel redirects in sync', () => {
    const configuredRedirects = Object.fromEntries(
      (vercelConfig.redirects as VercelRedirect[])
        .filter(({ has }) => !has?.length)
        .map(({ source, destination }) => [source, destination])
    );

    expect(configuredRedirects).toEqual(redirectRoutes);
  });

  it('redirects legacy category queries only to published category pages', () => {
    const routes = new Set(getStaticRoutes(loadInsights(), loadNews()).map((route) => route.path));
    const conditional = vercelConfig.redirects.filter(({ has }) => has?.some(({ type }) => type === 'query'));
    expect(conditional.length).toBe(32);
    for (const redirect of conditional) {
      expect(redirect.has).toEqual([expect.objectContaining({ type: 'query', key: 'category' })]);
      expect(redirect.permanent).toBe(true);
      expect(routes.has(redirect.destination.replace(/^\/en(?=\/)/, '').replace(/\/$/, ''))).toBe(true);
      expect(redirect.source).toMatch(/^\/(?:en\/)?(?:research|activities|news)\/?$/);
    }
  });

  it('keeps host-specific navigation and status entry points explicit', () => {
    const configuredHostRedirects = (vercelConfig.redirects as VercelRedirect[])
      .filter(({ has }) => has?.some(({ type }) => type === 'host'))
      .map(({ source, destination, has }) => ({
        source,
        destination,
        host: has?.find(({ type }) => type === 'host')?.value,
      }));

    expect(configuredHostRedirects).toEqual([
      { source: '/:path*', destination: 'https://www.elexvx.com/:path*', host: 'ai.elexvx.com' },
      { source: '/', destination: '/navigation/', host: 'nav.elexvx.com' },
      { source: '/', destination: '/status/', host: 'status.elexvx.com' },
      { source: '/history', destination: '/status/history/', host: 'status.elexvx.com' },
      { source: '/history/', destination: '/status/history/', host: 'status.elexvx.com' },
      { source: '/sitemap.xml', destination: '/navigation-sitemap.xml', host: 'nav.elexvx.com' },
      { source: '/robots.txt', destination: '/navigation-robots.txt', host: 'nav.elexvx.com' },
      { source: '/sitemap.xml', destination: '/status-sitemap.xml', host: 'status.elexvx.com' },
      { source: '/robots.txt', destination: '/status-robots.txt', host: 'status.elexvx.com' },
    ]);

    const aiHostRedirect = (vercelConfig.redirects as VercelRedirect[]).find(({ has }) =>
      has?.some(({ type, value }) => type === 'host' && value === 'ai.elexvx.com')
    );

    expect(aiHostRedirect?.permanent).toBe(true);
  });
});
