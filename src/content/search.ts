import { parseMarkdown } from './markdown';

export const markdownToSearchText = (source: string, translate: (value: string) => string = (value) => value) => {
  const parts: string[] = [];
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (record.type === 'text' && typeof record.value === 'string') {
      parts.push(...record.value.split('\n').map(translate));
      return;
    }
    Object.values(record).forEach(visit);
  };
  visit(parseMarkdown(source));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
};
