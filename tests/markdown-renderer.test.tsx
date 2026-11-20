import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownRenderer } from '../src/site/components/MarkdownRenderer';
import { LanguageProvider } from '../src/site/providers/i18n';

describe('MarkdownRenderer tables', () => {
  it('wraps rendered tables in a horizontal scroll container so tables stay full width', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider locale="zh-CN" path="/research/moe-chiplet-expert-reuse">
        <MarkdownRenderer source={'| 配置 | P95归一化 |\n| --- | --- |\n| 完整CoMoE-Chip | 1.00 |'} />
      </LanguageProvider>
    );

    expect(html).toContain('<div class="markdown-table-wrap"><table>');
    expect(html).toContain('</table></div>');
  });

  it('does not force display: block directly on article tables', () => {
    const editorialCss = readFileSync(join(process.cwd(), 'src/styles/sections/02-home-editorial.css'), 'utf8');
    const tableRuleMatch = editorialCss.match(/\.article-body table\s*\{[^}]*\}/);

    expect(tableRuleMatch).not.toBeNull();
    expect(tableRuleMatch?.[0]).toContain('width: 100%');
    expect(tableRuleMatch?.[0]).not.toContain('display: block');
    expect(editorialCss).toContain('.article-body .markdown-table-wrap');
  });
});
