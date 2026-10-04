import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectEsaOutput } from '../scripts/check-esa-output.mjs';

const origin = 'https://www.elexvx.com';
const roots: string[] = [];

async function createRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'elexvx-esa-output-'));
  roots.push(root);
  return root;
}

async function writeRoute(root: string, route: string, html: string) {
  const segments = route.split('/').filter(Boolean);
  const directory = path.join(root, ...segments);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html, 'utf8');
}

function page(route: string, title: string, alternates: Array<{ language: string; href: string }> = []) {
  const alternateTags = alternates
    .map(({ language, href }) => `<link rel="alternate" hreflang="${language}" href="${href}"/>`)
    .join('');
  return `<!doctype html><html lang="${route.startsWith('/en/') ? 'en' : 'zh-CN'}"><head><title>${title}</title><meta name="robots" content="index,follow"/><link rel="canonical" href="${origin}${route}"/>${alternateTags}</head><body><main><h1>${title}</h1><p>This is enough visible body content for a published route.</p></main></body></html>`;
}

async function writeSitemap(root: string, routes: string[]) {
  const entries = routes.map((route) => `<url><loc>${origin}${route}</loc></url>`).join('');
  await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0"?><urlset>${entries}</urlset>`, 'utf8');
}

async function createLocalizedPair(root: string) {
  const chinese = '/contact/';
  const english = '/en/contact/';
  await writeRoute(
    root,
    chinese,
    page(chinese, '联系我们', [
      { language: 'zh-CN', href: `${origin}${chinese}` },
      { language: 'en', href: `${origin}${english}` },
      { language: 'x-default', href: `${origin}${chinese}` },
    ])
  );
  await writeRoute(
    root,
    english,
    page(english, 'Contact us', [
      { language: 'zh-CN', href: `${origin}${chinese}` },
      { language: 'en', href: `${origin}${english}` },
      { language: 'x-default', href: `${origin}${chinese}` },
    ])
  );
  await writeSitemap(root, [chinese, english]);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('ESA static output gate', () => {
  it('accepts exported zh/en pages with reciprocal links and a Chinese-only service utility', async () => {
    const root = await createRoot();
    await createLocalizedPair(root);
    await writeRoute(root, '/status/', page('/status/', '服务状态'));
    await writeSitemap(root, ['/contact/', '/en/contact/', '/status/']);

    const result = await inspectEsaOutput({ root, redirects: [] });

    expect(result.errors).toEqual([]);
    expect(result.pages).toBe(3);
  });

  it('fails when a sitemap URL has no exported HTML file', async () => {
    const root = await createRoot();
    await writeRoute(root, '/contact/', page('/contact/', '联系我们'));
    await writeSitemap(root, ['/contact/', '/en/contact/']);

    const result = await inspectEsaOutput({ root, redirects: [] });

    expect(result.errors).toContain(
      `Sitemap target has no static HTML file: ${origin}/en/contact/ -> en/contact/index.html`
    );
  });

  it('fails for a Next.js error export, a bad canonical, and an empty main region', async () => {
    const root = await createRoot();
    const brokenRoute = '/research/industrial-intelligence/';
    await writeRoute(
      root,
      brokenRoute,
      page(brokenRoute, 'Research')
        .replace('<!doctype html><html', '<!doctype html><html id="__next_error__"')
        .replace(`<link rel="canonical" href="${origin}${brokenRoute}"/>`, `<link rel="canonical" href="${origin}/"/>`)
        .replace(
          '<main><h1>Research</h1><p>This is enough visible body content for a published route.</p></main>',
          '<main><h1></h1><p></p></main>'
        )
    );
    await writeSitemap(root, [brokenRoute]);

    const result = await inspectEsaOutput({ root, redirects: [] });

    expect(result.errors.some((error) => error.includes('Next.js error document'))).toBe(true);
    expect(result.errors.some((error) => error.includes('Canonical does not match sitemap URL'))).toBe(true);
    expect(result.errors.some((error) => error.includes('no valid main content'))).toBe(true);
  });

  it('fails when a noindex error export is omitted from the sitemap', async () => {
    const root = await createRoot();
    await writeRoute(root, '/', page('/', '首页'));
    await writeRoute(
      root,
      '/en/research/retired/',
      page('/en/research/retired/', 'Page not found')
        .replace('<meta name="robots" content="index,follow"/>', '<meta name="robots" content="noindex,nofollow"/>')
        .replace('<!doctype html><html', '<!doctype html><html id="__next_error__"')
    );
    await writeSitemap(root, ['/']);

    const result = await inspectEsaOutput({ root, redirects: [] });

    expect(result.errors.some((error) => error.includes('Next.js error document outside or inside the sitemap'))).toBe(
      true
    );
    expect(result.errors.some((error) => error.includes('noindex page-not-found document'))).toBe(true);
  });

  it('fails when a hreflang target is missing or a language pair is not reciprocal', async () => {
    const root = await createRoot();
    const chinese = '/contact/';
    const english = '/en/contact/';
    await writeRoute(root, chinese, page(chinese, '联系我们', [{ language: 'en', href: `${origin}${english}` }]));
    await writeRoute(root, english, page(english, 'Contact us'));
    await writeSitemap(root, [chinese, english]);

    const result = await inspectEsaOutput({ root, redirects: [] });

    expect(result.errors.some((error) => error.includes('Hreflang is not reciprocal'))).toBe(true);
    expect(result.errors.some((error) => error.includes('missing its Chinese hreflang alternate'))).toBe(true);

    const missingTargetRoot = await createRoot();
    await writeRoute(
      missingTargetRoot,
      chinese,
      page(chinese, '联系我们', [{ language: 'en', href: `${origin}${english}` }])
    );
    await writeSitemap(missingTargetRoot, [chinese]);
    const missingTarget = await inspectEsaOutput({ root: missingTargetRoot, redirects: [] });
    expect(missingTarget.errors.some((error) => error.includes('Hreflang target has no static HTML file'))).toBe(true);
  });

  it('fails if a 404 or redirect fallback remains in the ESA static directory', async () => {
    const root = await createRoot();
    await writeRoute(root, '/contact/', page('/contact/', '联系我们'));
    await writeSitemap(root, ['/contact/']);
    await writeFile(path.join(root, '404.html'), '<main><h1>Not found</h1></main>', 'utf8');
    await writeRoute(root, '/_not-found/', '<main><h1>Internal not found</h1></main>');
    await writeRoute(root, '/legacy/', page('/legacy/', '旧地址'));

    const result = await inspectEsaOutput({
      root,
      redirects: [{ source: '/legacy/', destination: '/contact/', permanent: true }],
    });

    expect(result.errors.some((error) => error.includes('expose 404.html'))).toBe(true);
    expect(result.errors.some((error) => error.includes('internal /_not-found/'))).toBe(true);
    expect(result.errors.some((error) => error.includes('static fallback that can shadow its redirect'))).toBe(true);
  });
});
