import type { NextConfig } from 'next';
import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadConfig = async (mode: 'development' | 'production'): Promise<NextConfig> => {
  vi.stubEnv('NODE_ENV', mode);
  vi.resetModules();
  const configPath = '../next.config.mjs';
  return (await import(configPath)).default;
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('development URL recovery', () => {
  it('serves both slash forms without adding new redirects to a stale browser cache', async () => {
    const nextConfig = await loadConfig('development');
    for (const pathname of [
      '/news',
      '/news/',
      '/research/category/chip-architecture',
      '/research/category/chip-architecture/',
      '/en/news/page/2',
      '/en/news/page/2/',
      '/products',
      '/products/',
    ]) {
      const response = await unstable_getResponseFromNextConfig({
        url: `http://127.0.0.1:5173${pathname}`,
        nextConfig,
      });
      expect(response.status, pathname).toBe(200);
      expect(response.headers.get('location'), pathname).toBeNull();
    }
  });

  it('lets the dev homepage remove cached redirects without clearing stored preferences', async () => {
    const nextConfig = await loadConfig('development');
    const response = await unstable_getResponseFromNextConfig({
      url: 'http://127.0.0.1:5173/?preview-recovery=1',
      nextConfig,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('clear-site-data')).toBe('"cache"');

    const asset = await unstable_getResponseFromNextConfig({
      url: 'http://127.0.0.1:5173/brand/elexvx-logo-white-600.webp',
      nextConfig,
    });
    expect(asset.headers.get('clear-site-data')).toBeNull();
  });

  it('keeps recovery headers out of the static production build', async () => {
    const nextConfig = await loadConfig('production');
    expect(nextConfig.output).toBe('export');
    expect(nextConfig.trailingSlash).toBe(true);
    expect(nextConfig.headers).toBeUndefined();
  });
});
