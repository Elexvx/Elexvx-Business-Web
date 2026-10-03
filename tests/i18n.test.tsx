import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider, LocalizedTitle, useI18n } from '../src/site/providers/i18n';
import { translateEnglish } from '../src/site/translation';
import { parseMarkdown } from '../src/content/markdown';
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
        '/services/docs/',
        '/services/docs/architecture/system-overview/',
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
    expect(html).toContain('href="/services/"');
    expect(html).toContain('href="/navigation/"');
    expect(html).toContain('href="/status/"');
    expect(html).toContain('href="/status/history/?days=7"');
    expect(html).toContain('href="/en/services/docs/"');
    expect(html).toContain('href="/en/services/docs/architecture/system-overview/"');
    expect(html).not.toContain('href="/en/services/"');
    expect(html).not.toContain('href="/en/navigation/"');
    expect(html).not.toContain('href="/en/status/"');
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
});
