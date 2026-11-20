import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { decodeHtmlEntities } from '../src/content/html-entities.mjs';

const allowed = new Set(['简体中文']);

async function checkEnglishDirectory(directory: string): Promise<{ pages: number; failures: string[] }> {
  let pages = 0;
  const failures: string[] = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await checkEnglishDirectory(path);
      pages += nested.pages;
      failures.push(...nested.failures);
      continue;
    }
    if (entry.name !== 'index.html') continue;

    pages++;
    const html = await readFile(path, 'utf8');
    if (!/<html[^>]*lang="en"/.test(html)) failures.push(`${path}: document language is not English`);
    const clean = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    const values = [...clean.matchAll(/>([^<>]+)</g)].map((match) => match[1]);
    for (const tag of clean.matchAll(/<[^>]+>/g)) {
      for (const attr of tag[0].matchAll(/\b(?:alt|title|aria-label|placeholder|content)="([^"]*)"/g)) {
        values.push(attr[1]);
      }
    }
    const missing = [
      ...new Set(
        values
          .map(decodeHtmlEntities)
          .map((value) => value.trim())
          .filter((value) => /[\u4e00-\u9fff]/.test(value) && !allowed.has(value))
      ),
    ];
    failures.push(...missing.map((value) => `${path}: ${value.slice(0, 160)}`));
  }

  return { pages, failures };
}

const { pages, failures } = await checkEnglishDirectory('dist/en');
if (failures.length) throw new Error(`English localization check failed:\n${failures.join('\n')}`);
console.log(`English localization: ${pages} pages checked; no untranslated visible text or metadata.`);
