import { readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';
import { parse } from 'yaml';

type RawLink = {
  id?: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  tags?: string[];
  status?: string;
};

type RawSubcategory = {
  id?: string;
  name: string;
  links: RawLink[];
};

type RawCategory = {
  id?: string;
  category: string;
  links?: RawLink[];
  subcategories?: RawSubcategory[];
};

type RawConfig = {
  site: Record<string, unknown>;
  seo: Record<string, unknown>;
  status: Record<string, unknown>;
  search: Record<string, unknown>;
  navigation: RawCategory[];
};

const sourcePath = 'src/data/service-navigation.yaml';
const outputPath = 'src/data/service-navigation.json';

const stableId = (value: string, fallback: string) => {
  const normalized = value
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  return normalized || fallback;
};

const normalizeLink = (link: RawLink, categoryId: string, index: number) => ({
  id: link.id ?? `${categoryId}-${stableId(link.name, `link-${index + 1}`)}-${index + 1}`,
  name: link.name,
  url: link.url,
  description: link.description ?? '',
  ...(link.icon ? { icon: link.icon } : {}),
  tags: link.tags ?? [],
  status: link.status ?? 'available',
});

const normalizeCategory = (category: RawCategory, index: number) => {
  const id = category.id ?? stableId(category.category, `category-${index + 1}`);
  return {
    id,
    category: category.category,
    links: (category.links ?? []).map((link, linkIndex) => normalizeLink(link, id, linkIndex)),
    subcategories: (category.subcategories ?? []).map((subcategory, subcategoryIndex) => {
      const subcategoryId = subcategory.id ?? stableId(subcategory.name, `subcategory-${subcategoryIndex + 1}`);
      return {
        id: subcategoryId,
        name: subcategory.name,
        links: subcategory.links.map((link, linkIndex) => normalizeLink(link, `${id}-${subcategoryId}`, linkIndex)),
      };
    }),
  };
};

const config = parse(await readFile(sourcePath, 'utf8')) as RawConfig;
const normalized = {
  ...config,
  navigation: config.navigation.map(normalizeCategory),
};

const output = await format(JSON.stringify(normalized), { parser: 'json' });
await writeFile(outputPath, output, 'utf8');
console.log(
  `Service navigation generated: ${normalized.navigation.length} categories and ${normalized.navigation.reduce(
    (count, category) =>
      count +
      category.links.length +
      category.subcategories.reduce((subtotal, subcategory) => subtotal + subcategory.links.length, 0),
    0
  )} links.`
);
