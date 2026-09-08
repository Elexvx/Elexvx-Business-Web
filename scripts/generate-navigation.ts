import { readFile, writeFile } from 'node:fs/promises';

// Navigation needs identifiers/categories, never complete article bodies.
const catalog: Record<string, { slug: string; category: string; categorySlug: string }[]> = {};
for (const kind of ['research', 'activities']) {
  const records = JSON.parse(await readFile(`content/site/${kind}.json`, 'utf8')) as {
    status: string;
    slug: string;
    category: string;
    categorySlug: string;
  }[];
  catalog[kind] = records
    .filter((item) => item.status === 'published')
    .map(({ slug, category, categorySlug }) => ({ slug, category, categorySlug }));
}
await writeFile('src/data/navigation-catalog.json', `${JSON.stringify(catalog, null, 2)}\n`);
