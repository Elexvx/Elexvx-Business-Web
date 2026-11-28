import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider, LocalizedTitle, useI18n } from '../src/site/providers/i18n';
import { translateEnglish } from '../src/site/translation';
import { existingEnglish, translateWithDictionary } from '../src/site/translation-base';
import { navigationGroups, withNewsCategories } from '../src/data/research-navigation';
import { parseMarkdown } from '../src/content/markdown';
import { documentationUrl } from '../src/data/service-routes';
import EnglishNotFound from '../src/app/en/not-found';
import { metadata as englishNotFoundMetadata } from '../src/app/en/404/page';
import { Footer } from '../src/site/components/footer';
import { ThemeProvider } from '../src/site/providers/theme-provider';
import { EnglishLanguageProvider } from '../src/site/providers/english-i18n';
import { NavigationPage } from '../src/site/services/navigation-page';
import { ServicesPage } from '../src/site/services/services-page';
import { StatusErrorState, StatusLogin, StatusPanel, StatusSkeleton } from '../src/site/services/status-components';
import { createDemoStatusData } from '../src/site/services/status-demo';
import { StatusHistory } from '../src/site/services/status-history';
import research from '../content/site/research.json';
import activities from '../content/site/activities.json';

function Links() {
  const { href, switchHref } = useI18n();
  return (
    <>
      {[
        '/research?category=chip-architecture',
        '/research/moe-chiplet-expert-reuse',
        '/research/category/chip-architecture?view=list#articles',
        '/en/news/',
        '/activities/jinxi-2026/hello.svg',
        '/brand/logo.svg',
        '/services/',
        '/navigation/',
        '/status/',
        '/status/history/?days=7',
        documentationUrl,
        '#reference-1',
        'https://www.elexvx.com/research/moe-chiplet-expert-reuse',
        'https://example.com/research/article',
      ].map((url) => (
        <a key={url} href={href(url)}>
          {url}
        </a>
      ))}
      <a data-language-switch="true" href={switchHref}>
        Switch language
      </a>
    </>
  );
}
describe('English publishing', () => {
  it('hides the language menu when rendered without a language provider', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <Footer />
      </ThemeProvider>
    );
    expect(html).not.toContain('footer-language-switcher');
    expect(html).toContain('Cookie 设置');
    expect(html).toContain('@elexvx_demo');
  });
  it.each(['zh-CN', 'en'] as const)('preserves the language menu on normal %s pages', (locale) => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <LanguageProvider locale={locale} path="/research">
          <Footer />
        </LanguageProvider>
      </ThemeProvider>
    );
    expect(html).toContain('footer-language-switcher');
    expect(html).toContain(`href="${locale === 'en' ? '/research/' : '/en/research/'}"`);
  });
  it('renders English not-found text and recovery links before any browser script runs', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <EnglishNotFound />
      </ThemeProvider>
    );
    expect(html).toContain('<h1>This page could not be found</h1>');
    expect(html).toContain('href="/en/">Return home</a>');
    expect(html).toContain('href="/en/research/">Explore research</a>');
    expect(html).toContain('<meta name="robots" content="noindex,nofollow"/>');
    expect(englishNotFoundMetadata.robots).toMatchObject({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
    expect(html).not.toContain('这一页，暂时找不到了');
  });
  it('keeps English routes, category queries and asset links intact', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="en" path="/research" autoRedirect={false}>
        <Links />
      </LanguageProvider>
    );
    expect(html).toContain('href="/en/research/?category=chip-architecture"');
    expect(html).toContain('href="/en/research/moe-chiplet-expert-reuse/"');
    expect(html).toContain('href="/en/research/category/chip-architecture/?view=list#articles"');
    expect(html).toContain('href="/en/news/"');
    expect(html).toContain('href="/activities/jinxi-2026/hello.svg"');
    expect(html).toContain('href="/brand/logo.svg"');
    expect(html).toContain('href="#reference-1"');
    expect(html).toContain('href="https://www.elexvx.com/research/moe-chiplet-expert-reuse/"');
    expect(html).toContain('href="https://example.com/research/article"');
    expect(html).toContain('data-language-switch="true" href="/research/"');
    expect(html).not.toContain('/en/en/');
    expect(html).toContain('href="/en/services/"');
    expect(html).toContain('href="/en/navigation/"');
    expect(html).toContain('href="/en/status/"');
    expect(html).toContain('href="/en/status/history/?days=7"');
    expect(html).toContain(`href="${documentationUrl}"`);
    expect(html).not.toContain('href="/services/"');
    expect(html).not.toContain('href="/navigation/"');
    expect(html).not.toContain('href="/status/"');
  });
  it('links Chinese content directly to its trailing-slash canonical URL', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="zh-CN" path="/research" autoRedirect={false}>
        <Links />
      </LanguageProvider>
    );
    expect(html).toContain('href="/research/moe-chiplet-expert-reuse/"');
    expect(html).toContain('href="/research/?category=chip-architecture"');
    expect(html).toContain('href="/research/category/chip-architecture/?view=list#articles"');
    expect(html).toContain('href="/activities/jinxi-2026/hello.svg"');
    expect(html).toContain('data-language-switch="true" href="/en/research/"');
  });
  it('keeps content links canonical in service pages without a language provider', () => {
    const html = renderToStaticMarkup(<Links />);
    expect(html).toContain('href="/research/moe-chiplet-expert-reuse/"');
    expect(html).toContain('href="https://www.elexvx.com/research/moe-chiplet-expert-reuse/"');
    expect(html).toContain('href="/activities/jinxi-2026/hello.svg"');
  });
  it('preserves English punctuation and natural heading wrapping', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="en" path="/" autoRedirect={false}>
        <LocalizedTitle text="A question, a clear answer." />
      </LanguageProvider>
    );
    expect(html).toContain('A question, a clear answer.');
    expect(html).not.toContain('<br');
  });
  it('inherits the server-provided dictionary through nested language providers', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="en" path="/" translations={{ 测试内容: 'Content from the server' }}>
        <LanguageProvider locale="en" path="/">
          <LocalizedTitle text="测试内容" />
        </LanguageProvider>
      </LanguageProvider>
    );
    expect(html).toContain('Content from the server');
    expect(html).not.toContain('测试内容');
  });
  it('covers complete published research and activity text, including image descriptions', () => {
    const missing = new Set<string>();
    const check = (text: string) => {
      if (/[\u4e00-\u9fff]/.test(translateEnglish(text))) missing.add(text);
    };
    const visit = (node: unknown): void => {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (!node || typeof node !== 'object') return;
      const value = node as Record<string, unknown>;
      if (value.type === 'text' && typeof value.value === 'string') value.value.split('\n').forEach(check);
      if (value.type === 'image' && typeof value.alt === 'string') check(value.alt);
      Object.values(value)
        .filter((part) => typeof part === 'object')
        .forEach(visit);
    };
    for (const article of [...research, ...activities].filter((item) => item.status === 'published')) {
      [article.title, article.excerpt, article.author].forEach(check);
      visit(parseMarkdown(article.body));
    }
    expect([...missing]).toEqual([]);
  });
  it('translates all navigation groups and dropdown headings in both base and full English dictionaries', () => {
    const groups = withNewsCategories(navigationGroups, ['最新动态', '办事指南']);
    const missing: string[] = [];
    const check = (value: string, scope: string) => {
      if (/[\u4e00-\u9fff]/.test(translateWithDictionary(value, existingEnglish))) {
        missing.push(`base:${scope}:${value}`);
      }
      if (/[\u4e00-\u9fff]/.test(translateEnglish(value))) {
        missing.push(`full:${scope}:${value}`);
      }
    };
    for (const group of groups) {
      check(group.label, `${group.id}.label`);
      check(group.title, `${group.id}.title`);
      check(group.intro, `${group.id}.intro`);
      for (const column of group.columns) {
        check(column.title, `${group.id}.col.title`);
        for (const link of column.links) {
          check(link.label, `${group.id}.link:${link.href}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
  it('renders service center, enterprise directory, and status views cleanly in English', () => {
    const demo = createDemoStatusData(7);
    const html = renderToStaticMarkup(
      <EnglishLanguageProvider path="/services">
        <ServicesPage />
        <NavigationPage />
        <StatusSkeleton />
        <StatusPanel data={demo} onRefresh={() => {}} refreshing={false} />
        <StatusHistory data={demo} />
        <StatusLogin onLogin={async () => {}} />
        <StatusErrorState onRetry={() => {}} />
      </EnglishLanguageProvider>
    );
    expect(html).toContain('Help documentation');
    expect(html).toContain('href="/en/navigation/"');
    expect(html).toContain('href="/en/status/"');
    expect(html).toContain('Enterprise Service Directory');
    expect(html).toContain('All systems operational');
    expect(html).toContain('Historical Availability');
    expect(html.replace(/<[^>]+>/g, ' ')).not.toMatch(/[\u4e00-\u9fff]/);
    for (const attr of html.matchAll(/\b(?:alt|title|aria-label|placeholder|data-search-tags)="([^"]*)"/g)) {
      expect(attr[1]).not.toMatch(/[\u4e00-\u9fff]/);
    }
  });
});
