import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  formatLocalReleaseTimestamp,
  formatReleaseTimestamp,
  getCountdownSnapshot,
  isReleaseReached,
  parseReleaseTimestamp,
  type HeroLaunchConfig,
} from '../src/site/components/hero-schedule';
import { HomeHero, HomeLaunchProvider } from '../src/site/components/home-hero';
import { HomeStaticMain } from '../src/site/components/home-static-main';
import { HomeWelcomeRest } from '../src/site/pages/home';
import { LanguageProvider } from '../src/site/providers/i18n';

vi.mock('#humite-content', () => ({
  humiteContent: {
    intro: {
      release: 'Example',
      title: '准备好了吗，下一幕开始。',
      description: '这是发布后的示例文案。',
      action: '了解更多',
      actionHref: '/products/example',
      showcase: { path: '/example/index.html', label: '示例', title: '示例演示' },
    },
    card: {
      name: 'Example',
      slug: 'example',
      image: '/example.png',
      href: '/products/example',
      category: 'Design',
      description: 'Example product',
    },
    english: {},
  },
}));

const sampleLaunch: HeroLaunchConfig = {
  enabled: true,
  releaseAt: '2026-12-01T00:00:00+08:00',
};

describe('hero release schedule', () => {
  it('parses valid ISO timestamps and rejects empty or invalid values', () => {
    expect(parseReleaseTimestamp('2026-12-01T00:00:00+08:00')).toBe(Date.parse('2026-12-01T00:00:00+08:00'));
    expect(parseReleaseTimestamp('')).toBeNull();
    expect(parseReleaseTimestamp('not-a-date')).toBeNull();
  });

  it('determines whether release time has been reached', () => {
    const releaseMs = Date.parse(sampleLaunch.releaseAt);
    expect(isReleaseReached(sampleLaunch, releaseMs - 1)).toBe(false);
    expect(isReleaseReached(sampleLaunch, releaseMs)).toBe(true);
    expect(isReleaseReached(sampleLaunch, releaseMs + 5000)).toBe(true);
    expect(isReleaseReached({ enabled: false, releaseAt: sampleLaunch.releaseAt }, releaseMs - 10_000)).toBe(true);
  });

  it('computes ceiling countdown units and progress before release', () => {
    const releaseMs = Date.parse(sampleLaunch.releaseAt);
    const remaining = 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000 - 200;
    const snapshot = getCountdownSnapshot(sampleLaunch.releaseAt, releaseMs - remaining);

    expect(snapshot.released).toBe(false);
    expect(snapshot.days).toBe(2);
    expect(snapshot.hours).toBe(3);
    expect(snapshot.minutes).toBe(4);
    expect(snapshot.seconds).toBe(5);
    expect(snapshot.progress).toBeGreaterThan(0.04);
    expect(snapshot.progress).toBeLessThan(1);
  });

  it('returns released snapshot once release time arrives', () => {
    const releaseMs = Date.parse(sampleLaunch.releaseAt);
    const snapshot = getCountdownSnapshot(sampleLaunch.releaseAt, releaseMs);

    expect(snapshot).toEqual({
      released: true,
      remainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progress: 1,
    });
  });

  it('formats release timestamp deterministically with its offset and converts to visitor timezones', () => {
    expect(formatReleaseTimestamp('2026-12-01T00:00:00+08:00')).toBe('2026-12-01 00:00 (UTC+08:00)');
    expect(formatReleaseTimestamp('2026-12-01T00:00:00Z')).toBe('2026-12-01 00:00 (UTC)');

    expect(formatLocalReleaseTimestamp('2026-12-01T00:00:00+08:00', 9 * 60)).toBe('2026-12-01 01:00 (UTC+09:00)');
    expect(formatLocalReleaseTimestamp('2026-12-01T00:00:00+08:00', -5 * 60)).toBe('2026-11-30 11:00 (UTC-05:00)');
    expect(formatLocalReleaseTimestamp('2026-12-01T00:00:00+08:00', 5 * 60 + 30)).toBe('2026-11-30 21:30 (UTC+05:30)');
    expect(formatLocalReleaseTimestamp('2026-12-01T00:00:00+08:00', 0)).toBe('2026-11-30 16:00 (UTC)');
  });
});

describe('HomeHero rendering', () => {
  it('renders the waiting stage before release time without exposing the hero showcase', () => {
    const html = renderToString(
      <LanguageProvider locale="zh-CN" path="/" autoRedirect={false}>
        <HomeLaunchProvider initialReleased={false} launch={sampleLaunch}>
          <HomeHero />
        </HomeLaunchProvider>
      </LanguageProvider>
    );

    expect(html).toContain('data-hero-phase="waiting"');
    expect(html).toContain('home-hero-particles');
    expect(html).toContain('<h1>先卖个关子<br/>精彩正在路上</h1>');
    expect(html).toContain('<p class="home-product-description">还不到亮相的时候，但值得等这一会儿。</p>');
    expect(html).toContain('role="timer"');
    expect(html).toContain(
      '<p class="home-hero-wait-schedule"><time dateTime="2026-12-01T00:00:00+08:00">2026-12-01 00:00 (UTC+08:00)</time></p>'
    );
    expect(html).toContain('--');
    expect(html).not.toContain('home-hero-wait-pill');
    expect(html).not.toContain('Example');
    expect(html).not.toContain('home-hero-standby-stage');
    expect(html).not.toContain('id="humite-preview"');
  });

  it('renders live countdown digits and timezone-converted schedule when provided', () => {
    const releaseMs = Date.parse(sampleLaunch.releaseAt);
    const html = renderToStaticMarkup(
      <LanguageProvider locale="zh-CN" path="/" autoRedirect={false}>
        <HomeLaunchProvider
          initialReleased={false}
          launch={sampleLaunch}
          initialNowMs={releaseMs - (3 * 3_600_000 + 12 * 60_000 + 9_000)}
          timeZoneOffsetMinutes={-5 * 60}
        >
          <HomeHero />
        </HomeLaunchProvider>
      </LanguageProvider>
    );

    expect(html).toContain('<span class="sr-only">00</span>');
    expect(html).toContain('<span class="sr-only">03</span>');
    expect(html).toContain('<span class="sr-only">12</span>');
    expect(html).toContain('<span class="sr-only">09</span>');
    expect(html).toContain('home-digit-slot');
    expect(html).toContain('2026-11-30 11:00 (UTC-05:00)');
  });

  it('renders the full hero content when released', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="zh-CN" path="/" autoRedirect={false}>
        <HomeLaunchProvider initialReleased={true} launch={sampleLaunch}>
          <HomeHero />
        </HomeLaunchProvider>
      </LanguageProvider>
    );

    expect(html).toContain('data-hero-phase="released"');
    expect(html).toContain('<h1>准备好了吗<br/>下一幕开始</h1>');
    expect(html).toContain('<p class="home-product-description">这是发布后的示例文案。</p>');
    expect(html).toContain('id="humite-preview"');
    expect(html).toContain('<div class="home-mac-screen"><noscript><iframe src="/example/index.html"');
    expect(html.split('<noscript>')[0]).not.toContain('<iframe');
    expect(html).not.toContain('home-hero-particles');
    expect(html).not.toContain('role="timer"');
  });

  it('translates all waiting stage copy into English on /en/', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="en" path="/" autoRedirect={false}>
        <HomeLaunchProvider initialReleased={false} launch={sampleLaunch}>
          <HomeHero />
        </HomeLaunchProvider>
      </LanguageProvider>
    );

    expect(html).toContain('Keeping a little secret until launch.');
    expect(html).toContain('Not quite time yet, but definitely worth the wait.');
    expect(html).not.toContain('Unlocks at');
    expect(html).not.toContain('Example');
    expect(html).not.toMatch(/[\u4e00-\u9fff]/);
  });

  it('splits Chinese ecosystem heading and description on punctuation below the hero', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="zh-CN" path="/" autoRedirect={false}>
        <HomeWelcomeRest items={[]} />
      </LanguageProvider>
    );

    expect(html).toContain('<h2 id="home-ecosystem-title">想象力<br/>真的没有边界</h2>');
    expect(html).toContain(
      '<p class="home-ecosystem-description">宏翔商道-Elexvx 是一家跨行业研发公司，以 AI 与数据智能为核心，聚焦企业管理、知识工作与负责任的 AI 应用，持续构建可验证的产品与系统。</p>'
    );
  });
});

it.each([false, true])('uses the same release state (%s) for the hero and featured products', (initialReleased) => {
  const html = renderToStaticMarkup(
    <LanguageProvider locale="en" path="/">
      <HomeStaticMain
        initialReleased={initialReleased}
        markup={{
          welcomeRest: '',
          newsAndResearch: '<section id="research"></section>',
          products: '<section id="products"><a href="/en/products/humite">Humite</a></section>',
          casesAndCompany: '<section id="cooperation-cases"></section>',
        }}
      />
    </LanguageProvider>
  );

  expect(html).toContain(`data-hero-phase="${initialReleased ? 'released' : 'waiting'}"`);
  expect(html.includes('class="home-products-locked"')).toBe(!initialReleased);
  expect(html.includes('Shh… the new release is backstage. See you at showtime!')).toBe(!initialReleased);
  expect(html.includes('href="/en/products/humite"')).toBe(initialReleased);
  expect(html.indexOf('id="research"')).toBeLessThan(html.indexOf('id="products"'));
  expect(html.indexOf('id="products"')).toBeLessThan(html.indexOf('id="cooperation-cases"'));
});

it('keeps already published featured products visible during another product’s countdown', () => {
  const publicProduct = '<a href="/products/public-product/">Public product</a>';
  const html = renderToStaticMarkup(
    <LanguageProvider locale="en" path="/">
      <HomeStaticMain
        initialReleased={false}
        markup={{
          welcomeRest: '',
          newsAndResearch: '',
          products: publicProduct + '<a href="/products/scheduled-product/">Scheduled product</a>',
          productsBeforeLaunch: publicProduct,
          casesAndCompany: '',
        }}
      />
    </LanguageProvider>
  );

  expect(html).toContain('role="timer"');
  expect(html).toContain(publicProduct);
  expect(html).not.toContain('/products/scheduled-product/');
  expect(html).not.toContain('class="home-products-locked"');
});
