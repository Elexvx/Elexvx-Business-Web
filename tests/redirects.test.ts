import vercelConfig from '../vercel.json';
import { redirectRoutes } from '../src/site/routing/routes';
import { describe, expect, it } from 'vitest';

type VercelRedirect = {
  source: string;
  destination: string;
};

describe('redirect configuration', () => {
  it('keeps the static fallback pages and Vercel redirects in sync', () => {
    const configuredRedirects = Object.fromEntries(
      (vercelConfig.redirects as VercelRedirect[]).map(({ source, destination }) => [source, destination])
    );

    expect(configuredRedirects).toEqual(redirectRoutes);
  });
});
