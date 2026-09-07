import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const allowed = new Set(['简体中文']);
const decode = (value: string) =>
  value
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code: string) =>
      String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code))
    )
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
let pages = 0;
const failures: string[] = [];
async function check(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else if (entry.name === 'index.html') {
      pages++;
      const html = await readFile(path, 'utf8');
      if (!/<html[^>]*lang="en"/.test(html)) failures.push(`${path}: document language is not English`);
      const clean = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
      const values = [...clean.matchAll(/>([^<>]+)</g)].map((match) => match[1]);
      for (const tag of clean.matchAll(/<[^>]+>/g)) {
        for (const attr of tag[0].matchAll(/\b(?:alt|title|aria-label|placeholder|content)="([^"]*)"/g))
          values.push(attr[1]);
      }
      const missing = [
        ...new Set(
          values
            .map(decode)
            .map((value) => value.trim())
            .filter((value) => /[\u4e00-\u9fff]/.test(value) && !allowed.has(value))
        ),
      ];
      failures.push(...missing.map((value) => `${path}: ${value.slice(0, 160)}`));
    }
  }
}
await check('dist/en');
if (failures.length) throw new Error(`English localization check failed:\n${failures.join('\n')}`);
console.log(`English localization: ${pages} pages checked; no untranslated visible text or metadata.`);
