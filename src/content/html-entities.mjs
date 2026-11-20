export function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const XML_ENTITY_MAP = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
]);

const HTML_ENTITY_MAP = new Map([...XML_ENTITY_MAP, ['nbsp', ' ']]);
const ENTITY_REFERENCE_PATTERN = /&(#x[\da-f]+|#\d+|[a-z]+);/gi;

function isValidUnicodeScalar(codePoint) {
  return (
    Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff)
  );
}

function decodeEntities(value, entityMap) {
  return value.replace(ENTITY_REFERENCE_PATTERN, (entity, name) => {
    const normalized = name.toLowerCase();
    const mapped = entityMap.get(normalized);
    if (mapped !== undefined) {
      return mapped;
    }
    if (!normalized.startsWith('#')) {
      return entity;
    }
    const codePoint = normalized.startsWith('#x')
      ? Number.parseInt(normalized.slice(2), 16)
      : Number.parseInt(normalized.slice(1), 10);
    return isValidUnicodeScalar(codePoint) ? String.fromCodePoint(codePoint) : entity;
  });
}

export function decodeXmlEntities(value) {
  return decodeEntities(value, XML_ENTITY_MAP);
}

export function decodeHtmlEntities(value) {
  return decodeEntities(value, HTML_ENTITY_MAP);
}
