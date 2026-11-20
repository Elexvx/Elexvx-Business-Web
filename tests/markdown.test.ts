import { describe, expect, it } from 'vitest';
import {
  asContentStatus,
  asEvidenceArray,
  asOptionalString,
  asOptionalStringArray,
  asPublishedDate,
  asString,
  parseFrontmatter,
  sortByPublishedAtDesc,
} from '../src/content/frontmatter';
import { parseInline, parseMarkdown } from '../src/content/markdown';

describe('frontmatter parser', () => {
  it('parses scalar, JSON, and Prettier single-quoted YAML inline objects', () => {
    const result = parseFrontmatter(
      [
        '---',
        'title: "Hello"',
        'published: true',
        'count: 42',
        'nullable: null',
        'tags: ["one", "two"]',
        "evidence: [{'label': 'Ref', 'kind': 'official', 'verified': true, 'url': 'https://example.com'}]",
        '---',
        '',
        'Body',
      ].join('\n')
    );
    expect(result.data.title).toBe('Hello');
    expect(result.data.published).toBe(true);
    expect(result.data.count).toBe(42);
    expect(result.data.nullable).toBeNull();
    expect(result.data.tags).toEqual(['one', 'two']);
    expect(result.data.evidence).toEqual([
      { label: 'Ref', kind: 'official', verified: true, url: 'https://example.com' },
    ]);
    expect(result.body).toContain('Body');
  });

  it('handles BOM, CRLF, comments, block list items, and missing frontmatter', () => {
    const withBomAndCrlf =
      '\uFEFF---\r\n# leading comment\r\ntitle: "BOM Title"\r\ntags:\r\n  - alpha\r\n  - beta\r\n---\r\n\r\nBody text';
    const parsed = parseFrontmatter(withBomAndCrlf);
    expect(parsed.data).toEqual({ title: 'BOM Title', tags: ['alpha', 'beta'] });
    expect(parsed.body).toBe('\nBody text');

    expect(parseFrontmatter('Just plain markdown')).toEqual({
      data: {},
      body: 'Just plain markdown',
    });
  });

  it('rejects unclosed frontmatter, orphan list items, invalid lines, invalid keys, and invalid JSON', () => {
    expect(() => parseFrontmatter('---\ntitle: broken')).toThrow('Frontmatter must close');
    expect(() => parseFrontmatter('---\n- orphan\n---')).toThrow('Invalid frontmatter list item 1');
    expect(() => parseFrontmatter('---\ntitle: "scalar"\n- orphan\n---')).toThrow('Invalid frontmatter list item 2');
    expect(() => parseFrontmatter('---\nno-colon-here\n---')).toThrow('Invalid frontmatter line 1');
    expect(() => parseFrontmatter('---\n123bad: value\n---')).toThrow('Invalid frontmatter key: 123bad');
    expect(() => parseFrontmatter('---\nevaluation: {bad json}\n---')).toThrow('Invalid JSON frontmatter value');
  });

  it('validates evidence arrays, typed fields, and descending date sorting', () => {
    expect(
      asEvidenceArray(
        [{ label: 'Report', kind: 'internal', verified: false, url: ' /docs/report.pdf ' }] as unknown as Record<
          string,
          unknown
        >,
        'evidence'
      )
    ).toEqual([{ label: 'Report', kind: 'internal', verified: false, url: '/docs/report.pdf' }]);

    expect(() => asEvidenceArray('not-array', 'evidence')).toThrow('evidence must be an array');
    expect(() => asEvidenceArray([null] as unknown as never[], 'evidence')).toThrow('evidence[0] must be an object');
    expect(() =>
      asEvidenceArray([{ label: 'Only label', kind: 'invalid', verified: true }] as unknown as never[], 'evidence')
    ).toThrow('evidence[0] must contain label, kind and verified');
    expect(() =>
      asEvidenceArray(
        [{ label: 'Bad URL', kind: 'asset', verified: true, url: '   ' }] as unknown as never[],
        'evidence'
      )
    ).toThrow('evidence[0].url must be a string');

    expect(asString('  ok  ', 'title')).toBe('ok');
    expect(asString(undefined, 'subtitle', false)).toBe('');
    expect(() => asString('', 'title')).toThrow('title must be a non-empty string');
    expect(asOptionalString(null, 'cover')).toBeUndefined();
    expect(asOptionalString(' /cover.png ', 'cover')).toBe('/cover.png');
    expect(asOptionalStringArray(undefined, 'keywords')).toBeUndefined();
    expect(asOptionalStringArray([' a ', '', 'b'], 'keywords')).toEqual(['a', 'b']);
    expect(() => asOptionalStringArray([1] as unknown as string[], 'keywords')).toThrow(
      'keywords must be an array of strings'
    );
    expect(asContentStatus('archived', 'doc.md')).toBe('archived');
    expect(() => asContentStatus('pending', 'doc.md')).toThrow('doc.md: invalid status');
    expect(asPublishedDate('2026-10-01', 'doc.md')).toBe('2026-10-01');
    expect(() => asPublishedDate('invalid-date', 'doc.md')).toThrow('doc.md: publishedAt must be an ISO date');

    const sorted = sortByPublishedAtDesc([
      { id: 'old', publishedAt: '2025-01-01' },
      { id: 'new', publishedAt: '2026-06-01' },
      { id: 'mid', publishedAt: '2026-01-15' },
    ]);
    expect(sorted.map((item) => item.id)).toEqual(['new', 'mid', 'old']);
  });
});

describe('markdown parser', () => {
  it('parses headings, emphasis, lists, tables and code blocks', () => {
    const blocks = parseMarkdown(
      '# Heading\n\n**strong** and *soft*\n\n- one\n- two\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n```ts\nconst value = 1;\n```'
    );
    expect(blocks.map((block) => block.type)).toEqual(['heading', 'paragraph', 'list', 'table', 'code']);
    expect(parseInline('[safe](/research)')[0]).toMatchObject({ type: 'link', href: '/research' });
    expect(parseInline('[unsafe](javascript:alert(1))')[0]).toMatchObject({ type: 'text' });
  });

  it('parses inline math, escapes, underscore emphasis, and safe vs unsafe images', () => {
    expect(parseInline('$E = mc^2$')).toEqual([{ type: 'math', value: 'E = mc^2' }]);
    expect(parseInline('\\*escaped\\* __bold__ _italic_')).toEqual([
      { type: 'text', value: '*escaped* ' },
      { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
      { type: 'text', value: ' ' },
      { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] },
    ]);
    expect(parseInline('![Diagram](/images/diagram.png "Architecture")')).toEqual([
      { type: 'image', href: '/images/diagram.png', alt: 'Diagram', children: [] },
    ]);
    expect(parseInline('![Fallback alt](data:text/html,hi)')).toEqual([{ type: 'text', value: 'Fallback alt' }]);
  });

  it('parses blockquotes, horizontal rules, ordered/unordered list splits, and unclosed code fences', () => {
    const blocks = parseMarkdown(
      [
        '> ## Quote heading',
        '>',
        '> - Quoted item',
        '',
        '---',
        '***',
        '___',
        '',
        '1. First',
        '2. Second',
        '- Unordered',
        '',
        '```python',
        'print("unclosed")',
      ].join('\n')
    );

    expect(blocks.map((block) => block.type)).toEqual(['blockquote', 'rule', 'rule', 'rule', 'list', 'list', 'code']);

    if (blocks[0].type === 'blockquote') {
      expect(blocks[0].children.map((child) => child.type)).toEqual(['heading', 'list']);
    }
    if (blocks[4].type === 'list') {
      expect(blocks[4].ordered).toBe(true);
      expect(blocks[4].items).toHaveLength(2);
    }
    if (blocks[5].type === 'list') {
      expect(blocks[5].ordered).toBe(false);
      expect(blocks[5].items).toHaveLength(1);
    }
    if (blocks[6].type === 'code') {
      expect(blocks[6]).toEqual({ type: 'code', language: 'python', value: 'print("unclosed")' });
    }
  });

  it('keeps raw HTML inert as text', () => {
    const [paragraph] = parseMarkdown('<script>alert(1)</script>');
    expect(paragraph.type).toBe('paragraph');
    if (paragraph.type === 'paragraph') expect(paragraph.children[0]).toMatchObject({ type: 'text' });
  });
});
