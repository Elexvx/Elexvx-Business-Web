import vercelConfig from '../vercel.json';
import { redirectRoutes } from '../src/site/routing/routes';
import { describe, expect, it } from 'vitest';

type VercelRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: Array<{ type: string; value: string }>;
};

describe('redirect configuration', () => {
  it('keeps the static fallback pages and Vercel redirects in sync', () => {
    const configuredRedirects = Object.fromEntries(
      (vercelConfig.redirects as VercelRedirect[])
        .filter(({ has }) => !has?.some(({ type }) => type === 'host'))
        .map(({ source, destination }) => [source, destination])
    );

    expect(configuredRedirects).toEqual(redirectRoutes);
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
