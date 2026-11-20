import { mkdtemp, rm, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCachedMarkdownCollectionLoader } from '../src/content/collection-loader';
import { decodeHtmlEntities, decodeXmlEntities, escapeHtml, escapeXml } from '../src/content/html-entities.mjs';
import { calculateReadingTime, insightFromSource } from '../src/content/normalize';
import { markdownToSearchText } from '../src/content/search';
import { omitFields, toInsightSummary, toNewsSummary } from '../src/content/summaries';
import type { Insight, NewsItem } from '../src/content/types';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'elexvx-content-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('markdownToSearchText', () => {
  it('extracts text from headings, paragraphs, emphasis, links, lists, blockquotes and tables', () => {
    const markdown = [
      '# Heading One',
      '',
      'Paragraph with **bold**, *italic*, and [link label](/research).',
      '',
      '- Bullet item',
      '1. Ordered item',
      '',
      '> Quoted insight',
      '',
      '| Col A | Col B |',
      '| --- | --- |',
      '| Cell 1 | Cell 2 |',
    ].join('\n');

    expect(markdownToSearchText(markdown)).toBe(
      'Heading One Paragraph with bold , italic , and link label . Bullet item Ordered item Quoted insight Col A Col B Cell 1 Cell 2'
    );
  });

  it('skips fenced code, inline code, math and images while splitting lines for translate and collapsing whitespace', () => {
    const markdown = [
      'First line',
      'Second   line   with `inlineCode()` and $E = mc^2$',
      '',
      '![Image alt text](/images/chart.png)',
      '',
      '```ts',
      'const ignored = true;',
      '```',
    ].join('\n');

    const translate = vi.fn((segment: string) => segment.toUpperCase());
    const result = markdownToSearchText(markdown, (value) => translate(value));

    expect(result).toBe('FIRST LINE SECOND LINE WITH AND');
    expect(translate.mock.calls.map((call) => call[0])).toEqual(['First line', 'Second   line   with ', ' and ']);
    expect(result).not.toContain('inlineCode');
    expect(result).not.toContain('mc^2');
    expect(result).not.toContain('Image alt text');
    expect(result).not.toContain('ignored');
  });
});

describe('createCachedMarkdownCollectionLoader', () => {
  const simpleFromSource = (source: string, filename: string) => {
    const [slugLine, dateLine] = source.trim().split('\n');
    return {
      slug: slugLine.trim(),
      publishedAt: dateLine.trim(),
      filename,
    };
  };

  it('filters .md files, sorts by publishedAt descending, and caches subsequent calls', async () => {
    const root = await createTempDir();
    await writeFile(path.join(root, 'older.md'), 'older-post\n2026-01-01\n', 'utf8');
    await writeFile(path.join(root, 'newer.md'), 'newer-post\n2026-03-15\n', 'utf8');
    await writeFile(path.join(root, 'notes.txt'), 'ignored\n2026-12-31\n', 'utf8');
    await writeFile(path.join(root, 'meta.json'), '{"ignored":true}\n', 'utf8');

    const fromSource = vi.fn((source: string, filename: string) => simpleFromSource(source, filename));
    const loader = createCachedMarkdownCollectionLoader({
      root,
      kind: 'article',
      fromSource,
    });

    const first = loader();
    expect(first.map((item) => item.slug)).toEqual(['newer-post', 'older-post']);
    expect(fromSource).toHaveBeenCalledTimes(2);

    await unlink(path.join(root, 'newer.md'));
    const second = loader();
    expect(second).toBe(first);
    expect(fromSource).toHaveBeenCalledTimes(2);
  });

  it('throws on duplicate slugs and validation failures', async () => {
    const duplicateRoot = await createTempDir();
    await writeFile(path.join(duplicateRoot, 'a.md'), 'same-slug\n2026-01-01\n', 'utf8');
    await writeFile(path.join(duplicateRoot, 'b.md'), 'same-slug\n2026-02-01\n', 'utf8');

    const duplicateLoader = createCachedMarkdownCollectionLoader({
      root: duplicateRoot,
      kind: 'insight',
      fromSource: simpleFromSource,
    });
    expect(() => duplicateLoader()).toThrow('Duplicate insight slug: same-slug');

    const validationRoot = await createTempDir();
    await writeFile(path.join(validationRoot, 'a.md'), 'bad-item\n2026-01-01\n', 'utf8');
    const validatedLoader = createCachedMarkdownCollectionLoader({
      root: validationRoot,
      kind: 'news',
      fromSource: simpleFromSource,
      validateItem: (item) => {
        throw new Error(`Invalid item: ${item.slug}`);
      },
    });
    expect(() => validatedLoader()).toThrow('Invalid item: bad-item');
  });

  it('handles missingRootEmpty true vs false', async () => {
    const missingRoot = path.join(await createTempDir(), 'non-existent');

    const emptyLoader = createCachedMarkdownCollectionLoader({
      root: missingRoot,
      kind: 'news',
      fromSource: simpleFromSource,
      missingRootEmpty: true,
    });
    expect(emptyLoader()).toEqual([]);

    const strictLoader = createCachedMarkdownCollectionLoader({
      root: missingRoot,
      kind: 'news',
      fromSource: simpleFromSource,
      missingRootEmpty: false,
    });
    expect(() => strictLoader()).toThrow();
  });
});

describe('calculateReadingTime and insightFromSource', () => {
  it('enforces a 1-minute minimum, strips code, and applies 350 CJK / 225 EN boundaries', () => {
    expect(calculateReadingTime('')).toBe(1);
    expect(calculateReadingTime('```ts\n' + 'word '.repeat(500) + '\n```\n`inline`')).toBe(1);

    expect(calculateReadingTime('字'.repeat(350))).toBe(1);
    expect(calculateReadingTime('字'.repeat(351))).toBe(2);

    expect(calculateReadingTime('word '.repeat(225).trim())).toBe(1);
    expect(calculateReadingTime('word '.repeat(226).trim())).toBe(2);

    expect(calculateReadingTime(`${'字'.repeat(175)} ${'word '.repeat(112).trim()}`)).toBe(1);
    expect(calculateReadingTime(`${'字'.repeat(175)} ${'word '.repeat(113).trim()}`)).toBe(2);
  });

  it('parses valid insight markdown and validates required frontmatter fields', () => {
    const validSource = [
      '---',
      'slug: "valid-insight"',
      'title: "Valid Insight"',
      'excerpt: "Short summary"',
      'publishedAt: "2026-10-01"',
      'author: "Research Team"',
      'status: "published"',
      'evidence: [{"label": "Paper", "kind": "official", "verified": true}]',
      'keywords: ["ai", "safety"]',
      '---',
      '',
      'Body content.',
    ].join('\n');

    const parsed = insightFromSource(validSource, 'valid-insight.md');
    expect(parsed).toMatchObject({
      slug: 'valid-insight',
      title: 'Valid Insight',
      status: 'published',
      readingTime: 1,
      keywords: ['ai', 'safety'],
    });

    expect(() => insightFromSource(validSource.replace('status: "published"', 'status: "invalid"'), 'bad.md')).toThrow(
      'bad.md: invalid status'
    );
    expect(() =>
      insightFromSource(validSource.replace('publishedAt: "2026-10-01"', 'publishedAt: "not-a-date"'), 'bad.md')
    ).toThrow('bad.md: publishedAt must be an ISO date');
  });
});

describe('summaries helpers', () => {
  it('omits specified fields without mutating the source object', () => {
    const source = { slug: 'a', title: 'Title', body: 'Long body', extra: 42 };
    const result = omitFields(source, 'body', 'extra');

    expect(result).toEqual({ slug: 'a', title: 'Title' });
    expect(source).toEqual({ slug: 'a', title: 'Title', body: 'Long body', extra: 42 });
  });

  it('produces idempotent insight and news summaries without body', () => {
    const insight: Insight = {
      slug: 'test-insight',
      title: 'Test Insight',
      excerpt: 'Excerpt',
      publishedAt: '2026-10-01',
      author: 'Team',
      status: 'published',
      evidence: [],
      body: 'Full body',
      readingTime: 1,
    };
    const firstInsightSummary = toInsightSummary(insight);
    expect('body' in firstInsightSummary).toBe(false);
    expect(toInsightSummary(firstInsightSummary)).toBe(firstInsightSummary);

    const newsItem: NewsItem = {
      slug: 'test-news',
      title: 'Test News',
      excerpt: 'Excerpt',
      publishedAt: '2026-10-01',
      author: 'Official',
      category: '公司动态',
      tags: ['news'],
      status: 'published',
      body: 'Full news body',
      readingTime: 1,
    };
    const firstNewsSummary = toNewsSummary(newsItem);
    expect('body' in firstNewsSummary).toBe(false);
    expect(toNewsSummary(firstNewsSummary)).toBe(firstNewsSummary);
  });
});

describe('html-entities', () => {
  it('decodes XML/HTML entities in a single pass and leaves surrogate or out-of-range numeric entities untouched', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;');
    expect(decodeXmlEntities('&amp;lt;')).toBe('&lt;');
    expect(decodeHtmlEntities('hello&nbsp;world')).toBe('hello world');
    expect(decodeXmlEntities('hello&nbsp;world')).toBe('hello&nbsp;world');

    expect(decodeHtmlEntities('&#xD800;&#55296;&#xDFFF;&#x110000;')).toBe('&#xD800;&#55296;&#xDFFF;&#x110000;');
    expect(decodeXmlEntities('&#xD800;&#x110000;')).toBe('&#xD800;&#x110000;');
    expect(decodeHtmlEntities('&#x1F680;&#39;')).toBe("🚀'");

    const sample = `<tag attr="1" single='2'>&</tag>`;
    expect(decodeHtmlEntities(escapeHtml(sample))).toBe(sample);
    expect(decodeXmlEntities(escapeXml(sample))).toBe(sample);
  });
});
