import redirects from '../src/server/esa/redirects.json';
import { isHumiteProductPath } from '../src/data/humite-launch.mjs';
import { ALLOWED_PUBLIC_HOSTS } from '../src/data/site-origins';
import { handleRequest } from '../src/server/esa/gateway';
import { redirectRoutes } from '../src/site/routing/routes';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getStaticRoutes } from '../src/site/routing/routes';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';

type HostingRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: Array<{ type: string; key?: string; value: string }>;
};

afterEach(() => vi.unstubAllEnvs());

describe('redirect configuration', () => {
  it.each(['false', 'true'])(
    'converges for all hosts, queries and slash variants (Humite published: %s)',
    async (published) => {
      vi.stubEnv('NEXT_PUBLIC_HUMITE_PUBLISHED', published);
      const rules = redirects as HostingRedirect[];
      const hosts = new Set([
        ...ALLOWED_PUBLIC_HOSTS,
        ...rules.flatMap(({ has }) => has?.filter(({ type }) => type === 'host').map(({ value }) => value) ?? []),
        'localhost:5173',
        '127.0.0.1:4174',
      ]);
      const gatewayHosts = new Set(Array.from(hosts, (host) => new URL(`https://${host}`).hostname));
      const context = { waitUntil: () => {} };
      const follow = async (start: URL) => {
        let url = start;
        const visited = new Set<string>();
        // External destinations belong to another service and must end this chain.
        while (gatewayHosts.has(url.hostname)) {
          const trace = [...visited, url.href].join(' -> ');
          expect(visited.has(url.href), `Redirect cycle: ${trace}`).toBe(false);
          expect(visited.size, `Too many redirects: ${trace}`).toBeLessThan(10);
          visited.add(url.href);
          const response = await handleRequest(new Request(url), context, {});
          if (response.status < 300 || response.status >= 400) return url;
          const location = response.headers.get('location');
          expect(location, `Missing redirect destination: ${trace}`).toBeTruthy();
          url = new URL(location!, url);
        }
        return url;
      };
      const terminalIdentity = (url: URL) => [url.origin, url.pathname.replace(/\/+$/, '') || '/', url.search];

      for (const rule of rules) {
        const paths = rule.source.includes(':path*')
          ? ['/', '/news', '/en/research', '/nested/page', '/robots.txt'].map((path) =>
              rule.source.replace('/:path*', path)
            )
          : [rule.source];
        for (const host of hosts) {
          for (const path of paths) {
            for (const withQuery of [false, true]) {
              const url = new URL(path, `https://${host}`);
              if (withQuery) url.searchParams.set('ref', 'redirect audit & check');
              for (const condition of rule.has ?? []) {
                if (condition.type === 'query' && condition.key) url.searchParams.set(condition.key, condition.value);
              }
              const withoutSlash = new URL(url);
              withoutSlash.pathname = url.pathname.replace(/\/+$/, '') || '/';
              const withSlash = new URL(withoutSlash);
              if (withSlash.pathname !== '/') withSlash.pathname += '/';
              const first = await follow(withoutSlash);
              const second = await follow(withSlash);
              expect(terminalIdentity(second), `Slash variants diverge: ${url.href}`).toEqual(terminalIdentity(first));
              for (const terminal of [first, second]) {
                expect(terminal.searchParams.getAll('ref'), `Query lost: ${url.href}`).toEqual(
                  url.searchParams.getAll('ref')
                );
              }
            }
          }
        }
      }
    }
  );

  it('keeps the static fallback pages and ESA redirects in sync', () => {
    const configuredRedirects = Object.fromEntries(
      (redirects as HostingRedirect[])
        .filter(({ has }) => !has?.length)
        .filter(
          ({ destination }) => process.env.NEXT_PUBLIC_HUMITE_PUBLISHED === 'true' || !isHumiteProductPath(destination)
        )
        .map(({ source, destination }) => [source, destination])
    );

    expect(configuredRedirects).toEqual(redirectRoutes);
  });

  it('redirects legacy category queries only to published category pages', () => {
    const routes = new Set(getStaticRoutes(loadInsights(), loadNews()).map((route) => route.path));
    const conditional = redirects.filter(({ has }) => has?.some(({ type }) => type === 'query'));
    expect(conditional.length).toBe(24);
    for (const redirect of conditional) {
      expect(redirect.has).toEqual([expect.objectContaining({ type: 'query', key: 'category' })]);
      expect(redirect.permanent).toBe(true);
      expect(routes.has(redirect.destination.replace(/^\/en(?=\/)/, '').replace(/\/$/, ''))).toBe(true);
      expect(redirect.source).toMatch(/^\/(?:en\/)?(?:research|activities|news)\/?$/);
    }
  });

  it('keeps host-specific navigation and status entry points explicit', () => {
    const configuredHostRedirects = (redirects as HostingRedirect[])
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

    const aiHostRedirect = (redirects as HostingRedirect[]).find(({ has }) =>
      has?.some(({ type, value }) => type === 'host' && value === 'ai.elexvx.com')
    );

    expect(aiHostRedirect?.permanent).toBe(true);
  });
});
