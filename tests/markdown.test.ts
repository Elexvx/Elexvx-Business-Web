import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '../src/content/frontmatter';
import { parseInline, parseMarkdown } from '../src/content/markdown';

describe('frontmatter parser', () => {
  it('parses scalar and JSON values without external markdown dependencies', () => {
    const result = parseFrontmatter('---\ntitle: "Hello"\npublished: true\ntags: ["one", "two"]\n---\n\nBody');
    expect(result.data.title).toBe('Hello');
    expect(result.data.published).toBe(true);
    expect(result.data.tags).toEqual(['one', 'two']);
    expect(result.body).toContain('Body');
  });

  it('rejects an unclosed header', () => {
    expect(() => parseFrontmatter('---\ntitle: broken')).toThrow('Frontmatter must close');
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

  it('keeps raw HTML inert as text', () => {
    const [paragraph] = parseMarkdown('<script>alert(1)</script>');
    expect(paragraph.type).toBe('paragraph');
    if (paragraph.type === 'paragraph') expect(paragraph.children[0]).toMatchObject({ type: 'text' });
  });
});
