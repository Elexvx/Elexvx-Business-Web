import type { ContentStatus, EvidenceRef } from './types';

type FrontmatterPrimitive = string | number | boolean | null;
type FrontmatterValue = FrontmatterPrimitive | FrontmatterPrimitive[] | Record<string, unknown>;

const unquote = (value: string) => {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

// Prettier formats inline YAML objects with single quotes. Accept that
// common YAML spelling while keeping the structured value strict.
const normalizeYamlInlineQuotes = (value: string) =>
  value
    .replace(/([{,]\s*)'([^']*)'\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ': "$1"')
    .replace(/([[, ]\s*)'([^']*)'/g, '$1"$2"');

const parseStructuredScalar = (value: string): FrontmatterValue => {
  try {
    return JSON.parse(value) as FrontmatterValue;
  } catch {
    try {
      return JSON.parse(normalizeYamlInlineQuotes(value)) as FrontmatterValue;
    } catch {
      throw new Error(`Invalid JSON frontmatter value: ${value}`);
    }
  }
};

const parseScalar = (rawValue: string): FrontmatterValue => {
  const value = rawValue.trim();
  if (!value) return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
    return parseStructuredScalar(value);
  }
  return unquote(value);
};

const appendFrontmatterListItem = (
  trimmed: string,
  line: string,
  index: number,
  data: Record<string, FrontmatterValue>,
  activeListKey: string | undefined
) => {
  const list = activeListKey ? data[activeListKey] : undefined;
  if (!Array.isArray(list)) {
    throw new Error(`Invalid frontmatter list item ${index + 1}: ${line}`);
  }
  list.push(parseScalar(trimmed.slice(2)) as FrontmatterPrimitive);
};

const assignFrontmatterKey = (
  trimmed: string,
  line: string,
  index: number,
  data: Record<string, FrontmatterValue>
): string | undefined => {
  const separator = trimmed.indexOf(':');
  if (separator <= 0) throw new Error(`Invalid frontmatter line ${index + 1}: ${line}`);
  const key = trimmed.slice(0, separator).trim();
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(key)) throw new Error(`Invalid frontmatter key: ${key}`);
  const rawValue = trimmed.slice(separator + 1);
  data[key] = rawValue.trim() ? parseScalar(rawValue) : [];
  return rawValue.trim() ? undefined : key;
};

export const parseFrontmatter = (source: string): { data: Record<string, FrontmatterValue>; body: string } => {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { data: {}, body: normalized };
  }

  const end = normalized.indexOf('\n---', 4);
  if (end === -1) throw new Error('Frontmatter must close with ---');

  const rawHeader = normalized.slice(4, end).trim();
  const data: Record<string, FrontmatterValue> = {};
  let activeListKey: string | undefined;

  for (const [index, line] of rawHeader.split('\n').entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('- ')) {
      appendFrontmatterListItem(trimmed, line, index, data, activeListKey);
      continue;
    }
    activeListKey = assignFrontmatterKey(trimmed, line, index, data);
  }

  return {
    data,
    body: normalized.slice(end + 4).replace(/^\n/, ''),
  };
};

export const asString = (value: FrontmatterValue | undefined, field: string, required = true): string => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!required && (value === undefined || value === null || value === '')) return '';
  throw new Error(`${field} must be a non-empty string`);
};

const isStringArray = (value: FrontmatterValue | undefined): value is string[] =>
  Array.isArray(value) && value.every((item): item is string => typeof item === 'string');

const asStringArray = (value: FrontmatterValue | undefined, field: string): string[] => {
  if (!isStringArray(value)) {
    throw new Error(`${field} must be an array of strings`);
  }
  return value.map((item) => item.trim()).filter(Boolean);
};

const isEvidenceKind = (value: unknown): value is EvidenceRef['kind'] =>
  value === 'official' || value === 'internal' || value === 'asset';

const parseEvidenceItem = (item: unknown, field: string, index: number): EvidenceRef => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error(`${field}[${index}] must be an object`);
  }
  const record = item as Record<string, unknown>;
  const label = typeof record.label === 'string' ? record.label.trim() : '';
  if (!label || !isEvidenceKind(record.kind) || typeof record.verified !== 'boolean') {
    throw new Error(`${field}[${index}] must contain label, kind and verified`);
  }
  const result: EvidenceRef = { label, kind: record.kind, verified: record.verified };
  if (record.url !== undefined) {
    if (typeof record.url !== 'string' || !record.url.trim()) {
      throw new Error(`${field}[${index}].url must be a string`);
    }
    result.url = record.url.trim();
  }
  return result;
};

export const asEvidenceArray = (value: FrontmatterValue | undefined, field: string): EvidenceRef[] => {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value.map((item, index) => parseEvidenceItem(item, field, index));
};

export const asOptionalString = (value: FrontmatterValue | undefined, field: string): string | undefined =>
  asString(value, field, false) || undefined;

export const asOptionalStringArray = (value: FrontmatterValue | undefined, field: string): string[] | undefined =>
  typeof value === 'undefined' ? undefined : asStringArray(value, field);

export const asContentStatus = (value: FrontmatterValue | undefined, filename: string): ContentStatus => {
  const status = asString(value, 'status');
  if (!['draft', 'published', 'archived'].includes(status)) throw new Error(`${filename}: invalid status`);
  return status as ContentStatus;
};

export const asPublishedDate = (value: FrontmatterValue | undefined, filename: string): string => {
  const publishedAt = asString(value, 'publishedAt');
  if (Number.isNaN(Date.parse(publishedAt))) throw new Error(`${filename}: publishedAt must be an ISO date`);
  return publishedAt;
};

export const sortByPublishedAtDesc = <T extends { publishedAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
