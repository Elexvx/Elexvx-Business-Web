export type InlineNode =
  | { type: 'math'; value: string }
  | { type: 'text'; value: string }
  | { type: 'strong' | 'emphasis' | 'code'; children: InlineNode[]; value?: string }
  | { type: 'link' | 'image'; children: InlineNode[]; href: string; alt?: string };

export type BlockNode =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'list'; ordered: boolean; items: BlockNode[][] }
  | { type: 'table'; headers: InlineNode[][]; rows: InlineNode[][][] }
  | { type: 'code'; language?: string; value: string }
  | { type: 'rule' };

const safeHref = (href: string) => {
  const value = href.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return value;
  return '';
};

const pushText = (nodes: InlineNode[], value: string) => {
  if (!value) return;
  const last = nodes[nodes.length - 1];
  if (last?.type === 'text') last.value += value;
  else nodes.push({ type: 'text', value });
};

const findClosing = (source: string, marker: string, start: number) => source.indexOf(marker, start);

type InlineMatch = {
  nextIndex: number;
  emit: (nodes: InlineNode[]) => void;
};

const tryParseInlineMath = (rest: string, index: number): InlineMatch | null => {
  const match = rest.match(/^\$([^$\n]+)\$/);
  if (!match) return null;
  return {
    nextIndex: index + match[0].length,
    emit: (nodes) => nodes.push({ type: 'math', value: match[1] }),
  };
};

const tryParseInlineImage = (rest: string, index: number): InlineMatch | null => {
  const match = rest.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+["']([^"']*)["'])?\)/);
  if (!match) return null;
  const href = safeHref(match[2]);
  return {
    nextIndex: index + match[0].length,
    emit: (nodes) => {
      if (href) nodes.push({ type: 'image', href, alt: match[1], children: [] });
      else pushText(nodes, match[1]);
    },
  };
};

const tryParseInlineLink = (rest: string, index: number): InlineMatch | null => {
  const match = rest.match(/^\[([^\]]+)\]\(([^\s)]+)(?:\s+["']([^"']*)["'])?\)/);
  if (!match) return null;
  const href = safeHref(match[2]);
  return {
    nextIndex: index + match[0].length,
    emit: (nodes) => {
      const children = parseInline(match[1]);
      if (href) nodes.push({ type: 'link', href, children });
      else nodes.push(...children);
    },
  };
};

const tryParseInlineCode = (rest: string, index: number): InlineMatch | null => {
  const match = rest.match(/^`([^`\n]+)`/);
  if (!match) return null;
  return {
    nextIndex: index + match[0].length,
    emit: (nodes) => nodes.push({ type: 'code', value: match[1], children: [] }),
  };
};

const tryParseDelimited = (
  source: string,
  index: number,
  marker: string,
  type: 'strong' | 'emphasis'
): InlineMatch | null => {
  const start = index + marker.length;
  const closing = findClosing(source, marker, start);
  if (closing <= start) return null;
  return {
    nextIndex: closing + marker.length,
    emit: (nodes) => nodes.push({ type, children: parseInline(source.slice(start, closing)) }),
  };
};

const tryParseInlineEmphasis = (source: string, rest: string, index: number): InlineMatch | null => {
  const strongMarker = rest.startsWith('**') ? '**' : rest.startsWith('__') ? '__' : '';
  if (strongMarker) return tryParseDelimited(source, index, strongMarker, 'strong');

  const emphasisMarker = rest.startsWith('*') ? '*' : rest.startsWith('_') ? '_' : '';
  if (emphasisMarker && !rest.startsWith(`${emphasisMarker}${emphasisMarker}`)) {
    return tryParseDelimited(source, index, emphasisMarker, 'emphasis');
  }

  return null;
};

const tryParseInlineToken = (source: string, rest: string, index: number): InlineMatch | null =>
  tryParseInlineMath(rest, index) ??
  tryParseInlineImage(rest, index) ??
  tryParseInlineLink(rest, index) ??
  tryParseInlineCode(rest, index) ??
  tryParseInlineEmphasis(source, rest, index);

export const parseInline = (source: string): InlineNode[] => {
  const nodes: InlineNode[] = [];
  let index = 0;
  let textStart = 0;

  const flushText = (end: number) => {
    pushText(nodes, source.slice(textStart, end).replace(/\\([\\`*_{}[\]()#+.!-])/g, '$1'));
  };

  while (index < source.length) {
    const rest = source.slice(index);

    if (rest.startsWith('\\') && source[index + 1]) {
      index += 2;
      continue;
    }

    const match = tryParseInlineToken(source, rest, index);
    if (match) {
      flushText(index);
      match.emit(nodes);
      index = match.nextIndex;
      textStart = index;
      continue;
    }

    index += 1;
  }

  flushText(source.length);
  return nodes;
};

const isBlank = (line: string) => line.trim() === '';
const isFence = (line: string) => /^\s*```/.test(line);
const isHeading = (line: string) => /^\s*#{1,4}\s+/.test(line);
const isRule = (line: string) => /^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line);
const listMatch = (line: string) => line.match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
const isTableDelimiter = (line: string) => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

const splitTableRow = (line: string) => {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => parseInline(cell.trim()));
};

type BlockMatch = {
  block: BlockNode;
  nextIndex: number;
};

const parseFenceBlock = (lines: string[], index: number): BlockMatch | null => {
  if (!isFence(lines[index])) return null;
  const language = lines[index].trim().slice(3).trim() || undefined;
  const code: string[] = [];
  let cursor = index + 1;
  while (cursor < lines.length && !isFence(lines[cursor])) {
    code.push(lines[cursor]);
    cursor += 1;
  }
  if (cursor < lines.length) cursor += 1;
  return { block: { type: 'code', language, value: code.join('\n') }, nextIndex: cursor };
};

const parseHeadingBlock = (line: string, index: number): BlockMatch | null => {
  const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/);
  if (!heading) return null;
  return {
    block: { type: 'heading', level: heading[1].length as 1 | 2 | 3 | 4, children: parseInline(heading[2]) },
    nextIndex: index + 1,
  };
};

const parseRuleBlock = (line: string, index: number): BlockMatch | null => {
  if (!isRule(line)) return null;
  return { block: { type: 'rule' }, nextIndex: index + 1 };
};

const parseBlockquoteBlock = (lines: string[], index: number): BlockMatch | null => {
  if (!/^\s*>/.test(lines[index])) return null;
  const quote: string[] = [];
  let cursor = index;
  while (cursor < lines.length && (/^\s*>/.test(lines[cursor]) || isBlank(lines[cursor]))) {
    quote.push(lines[cursor].replace(/^\s*>\s?/, ''));
    cursor += 1;
  }
  return { block: { type: 'blockquote', children: parseMarkdown(quote.join('\n')) }, nextIndex: cursor };
};

const parseTableBlock = (lines: string[], index: number): BlockMatch | null => {
  const line = lines[index];
  if (!line.includes('|') || index + 1 >= lines.length || !isTableDelimiter(lines[index + 1])) return null;
  const headers = splitTableRow(line);
  const rows: InlineNode[][][] = [];
  let cursor = index + 2;
  while (cursor < lines.length && lines[cursor].includes('|') && !isBlank(lines[cursor])) {
    rows.push(splitTableRow(lines[cursor]));
    cursor += 1;
  }
  return { block: { type: 'table', headers, rows }, nextIndex: cursor };
};

const parseListBlock = (lines: string[], index: number): BlockMatch | null => {
  const firstList = listMatch(lines[index]);
  if (!firstList) return null;
  const ordered = Boolean(firstList[2]);
  const items: BlockNode[][] = [];
  let cursor = index;
  while (cursor < lines.length) {
    const match = listMatch(lines[cursor]);
    if (!match || Boolean(match[2]) !== ordered) break;
    items.push(parseMarkdown(match[3]));
    cursor += 1;
  }
  return { block: { type: 'list', ordered, items }, nextIndex: cursor };
};

const isParagraphContinuationLine = (line: string): boolean =>
  !isBlank(line) && !isFence(line) && !isHeading(line) && !isRule(line) && !/^\s*>/.test(line) && !listMatch(line);

const parseParagraphBlock = (lines: string[], index: number): BlockMatch => {
  const paragraph: string[] = [lines[index].trim()];
  let cursor = index + 1;
  while (cursor < lines.length && isParagraphContinuationLine(lines[cursor])) {
    paragraph.push(lines[cursor].trim());
    cursor += 1;
  }
  return { block: { type: 'paragraph', children: parseInline(paragraph.join('\n')) }, nextIndex: cursor };
};

const parseNextBlock = (lines: string[], index: number): BlockMatch =>
  parseFenceBlock(lines, index) ??
  parseHeadingBlock(lines[index], index) ??
  parseRuleBlock(lines[index], index) ??
  parseBlockquoteBlock(lines, index) ??
  parseTableBlock(lines, index) ??
  parseListBlock(lines, index) ??
  parseParagraphBlock(lines, index);

export const parseMarkdown = (source: string): BlockNode[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlockNode[] = [];
  let index = 0;

  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1;
      continue;
    }
    const { block, nextIndex } = parseNextBlock(lines, index);
    blocks.push(block);
    index = nextIndex;
  }

  return blocks;
};
