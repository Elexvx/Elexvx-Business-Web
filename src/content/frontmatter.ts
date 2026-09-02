export type FrontmatterPrimitive = string | number | boolean | null;
export type FrontmatterValue = FrontmatterPrimitive | FrontmatterPrimitive[] | Record<string, unknown>;

const unquote = (value: string) => {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseScalar = (rawValue: string): FrontmatterValue => {
  const value = rawValue.trim();
  if (!value) return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
    try {
      return JSON.parse(value) as FrontmatterValue;
    } catch {
      try {
        // Prettier formats inline YAML objects with single quotes. Accept that
        // common YAML spelling while keeping the structured value strict.
        const yamlCompatible = value
          .replace(/([{,]\s*)'([^']*)'\s*:/g, '$1"$2":')
          .replace(/:\s*'([^']*)'/g, ': "$1"')
          .replace(/([[, ]\s*)'([^']*)'/g, '$1"$2"');
        return JSON.parse(yamlCompatible) as FrontmatterValue;
      } catch {
        throw new Error(`Invalid JSON frontmatter value: ${value}`);
      }
    }
  }

  return unquote(value);
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

  for (const [index, line] of rawHeader.split('\n').entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator <= 0) throw new Error(`Invalid frontmatter line ${index + 1}: ${line}`);
    const key = trimmed.slice(0, separator).trim();
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(key)) throw new Error(`Invalid frontmatter key: ${key}`);
    data[key] = parseScalar(trimmed.slice(separator + 1));
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

export const asStringArray = (value: FrontmatterValue | undefined, field: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${field} must be an array of strings`);
  }
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
};

export const asEvidenceArray = (value: FrontmatterValue | undefined, field: string) => {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`${field}[${index}] must be an object`);
    }
    const record = item as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.trim() : '';
    const kind = record.kind;
    const verified = record.verified;
    if (!label || !['official', 'internal', 'asset'].includes(String(kind)) || typeof verified !== 'boolean') {
      throw new Error(`${field}[${index}] must contain label, kind and verified`);
    }
    const result: { label: string; kind: 'official' | 'internal' | 'asset'; verified: boolean; url?: string } = {
      label,
      kind: kind as 'official' | 'internal' | 'asset',
      verified,
    };
    if (record.url !== undefined) {
      if (typeof record.url !== 'string' || !record.url.trim())
        throw new Error(`${field}[${index}].url must be a string`);
      result.url = record.url.trim();
    }
    return result;
  });
};
