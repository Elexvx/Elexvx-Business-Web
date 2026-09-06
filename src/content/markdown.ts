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

    const mathMatch = rest.match(/^\$([^$\n]+)\$/);
    if (mathMatch) {
      flushText(index);
      nodes.push({ type: 'math', value: mathMatch[1] });
      index += mathMatch[0].length;
      textStart = index;
      continue;
    }

    const imageMatch = rest.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+["']([^"']*)["'])?\)/);
    if (imageMatch) {
      flushText(index);
      const href = safeHref(imageMatch[2]);
      if (href) nodes.push({ type: 'image', href, alt: imageMatch[1], children: [] });
      else pushText(nodes, imageMatch[1]);
      index += imageMatch[0].length;
      textStart = index;
      continue;
    }

    const linkMatch = rest.match(/^\[([^\]]+)\]\(([^\s)]+)(?:\s+["']([^"']*)["'])?\)/);
    if (linkMatch) {
      flushText(index);
      const href = safeHref(linkMatch[2]);
      const children = parseInline(linkMatch[1]);
      if (href) nodes.push({ type: 'link', href, children });
      else nodes.push(...children);
      index += linkMatch[0].length;
      textStart = index;
      continue;
    }

    const codeMatch = rest.match(/^`([^`\n]+)`/);
    if (codeMatch) {
      flushText(index);
      nodes.push({ type: 'code', value: codeMatch[1], children: [] });
      index += codeMatch[0].length;
      textStart = index;
      continue;
    }

    const strongMarker = rest.startsWith('**') ? '**' : rest.startsWith('__') ? '__' : '';
    if (strongMarker) {
      const closing = findClosing(source, strongMarker, index + 2);
      if (closing > index + 2) {
        flushText(index);
        nodes.push({ type: 'strong', children: parseInline(source.slice(index + 2, closing)) });
        index = closing + 2;
        textStart = index;
        continue;
      }
    }

    const emphasisMarker = rest.startsWith('*') ? '*' : rest.startsWith('_') ? '_' : '';
    if (emphasisMarker && !rest.startsWith(`${emphasisMarker}${emphasisMarker}`)) {
      const closing = findClosing(source, emphasisMarker, index + 1);
      if (closing > index + 1) {
        flushText(index);
        nodes.push({ type: 'emphasis', children: parseInline(source.slice(index + 1, closing)) });
        index = closing + 1;
        textStart = index;
        continue;
      }
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

export const parseMarkdown = (source: string): BlockNode[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlockNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (isBlank(line)) {
      index += 1;
      continue;
    }

    if (isFence(line)) {
      const language = line.trim().slice(3).trim() || undefined;
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !isFence(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: 'code', language, value: code.join('\n') });
      continue;
    }

    const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length as 1 | 2 | 3 | 4, children: parseInline(heading[2]) });
      index += 1;
      continue;
    }

    if (isRule(line)) {
      blocks.push({ type: 'rule' });
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && (/^\s*>/.test(lines[index]) || isBlank(lines[index]))) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'blockquote', children: parseMarkdown(quote.join('\n')) });
      continue;
    }

    if (line.includes('|') && index + 1 < lines.length && isTableDelimiter(lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows: InlineNode[][][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && !isBlank(lines[index])) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    const firstList = listMatch(line);
    if (firstList) {
      const ordered = Boolean(firstList[2]);
      const items: BlockNode[][] = [];
      while (index < lines.length) {
        const match = listMatch(lines[index]);
        if (!match || Boolean(match[2]) !== ordered) break;
        items.push(parseMarkdown(match[3]));
        index += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      !isBlank(lines[index]) &&
      !isFence(lines[index]) &&
      !isHeading(lines[index]) &&
      !isRule(lines[index]) &&
      !/^\s*>/.test(lines[index]) &&
      !listMatch(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', children: parseInline(paragraph.join('\n')) });
  }

  return blocks;
};
