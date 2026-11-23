import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

import { HomeHero, HomeLaunchProvider, HomeProductsLaunch } from '../src/site/components/home-hero';
import { HomeStaticMain } from '../src/site/components/home-static-main';
import { LanguageProvider } from '../src/site/providers/i18n';

vi.mock('#humite-content', () => ({ humiteContent: null }));

it('shows public content when the countdown expires in a build without release assets', () => {
  const releaseAt = '2026-12-01T00:00:00+08:00';
  const html = renderToStaticMarkup(
    <LanguageProvider locale="zh-CN" path="/" autoRedirect={false}>
      <HomeLaunchProvider launch={{ enabled: true, releaseAt }} initialNowMs={Date.parse(releaseAt)}>
        <HomeHero />
        <HomeProductsLaunch beforeLaunch={<a href="/products/public-product/">Public product</a>}>
          <a href="/products/scheduled-product/">Scheduled product</a>
        </HomeProductsLaunch>
      </HomeLaunchProvider>
    </LanguageProvider>
  );

  expect(html).toContain('data-hero-phase="released"');
  expect(html).toContain('<h1>Elexvx</h1>');
  expect(html).toContain('href="/products/public-product/"');
  expect(html).not.toContain('role="timer"');
  expect(html).not.toContain('home-products-locked');
  expect(html).not.toContain('/products/scheduled-product/');
});

it.each(['zh-CN', 'en'] as const)('keeps the countdown before release without release assets (%s)', (locale) => {
  const releaseAt = '2026-12-01T00:00:00+08:00';
  const html = renderToStaticMarkup(
    <LanguageProvider locale={locale} path="/" autoRedirect={false}>
      <HomeLaunchProvider launch={{ enabled: true, releaseAt }} initialNowMs={Date.parse(releaseAt) - 1}>
        <HomeHero />
      </HomeLaunchProvider>
    </LanguageProvider>
  );

  expect(html).toContain('data-hero-phase="waiting"');
  expect(html).toContain('role="timer"');
  expect(html).not.toContain('<h1>Elexvx</h1>');
});

it.each(['zh-CN', 'en'] as const)('renders an unlocked static homepage without release assets (%s)', (locale) => {
  const html = renderToStaticMarkup(
    <LanguageProvider locale={locale} path="/" autoRedirect={false}>
      <HomeStaticMain
        initialReleased={true}
        markup={{
          welcomeRest: '',
          newsAndResearch: '',
          products: '<a href="/products/scheduled-product/">Scheduled product</a>',
          casesAndCompany: '',
        }}
      />
    </LanguageProvider>
  );

  expect(html).toContain('data-hero-phase="released"');
  expect(html).toContain('<h1>Elexvx</h1>');
  expect(html).not.toContain('role="timer"');
  expect(html).not.toContain('home-products-locked');
  expect(html).not.toContain('/products/scheduled-product/');
});
