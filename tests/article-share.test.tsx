import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ArticleShare } from '../src/site/components/article-share';
import { LanguageProvider } from '../src/site/providers/i18n';

describe('article share accessibility', () => {
  it.each([
    { locale: 'zh-CN' as const, names: ['网页', '二维码卡片'] },
    { locale: 'en' as const, names: ['Web link', 'QR card'] },
  ])('keeps decorative icons out of the $locale share button names', ({ locale, names }) => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale={locale} path="/" autoRedirect={false}>
        <ArticleShare />
      </LanguageProvider>
    );
    const buttons = html.match(/<button\b[\s\S]*?<\/button>/g) ?? [];
    expect(buttons).toHaveLength(names.length);
    buttons.forEach((button, index) => {
      const icon = button.match(/<span\b[^>]*class="anticon[^"]*"[^>]*>/)?.[0];
      expect(icon).toContain('aria-hidden="true"');
      expect(button).toContain(`<span>${names[index]}</span>`);
      expect(button).toContain('aria-haspopup="dialog"');
    });
  });
});
