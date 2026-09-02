import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg?.startsWith('--')) args.set(arg.slice(2), process.argv[index + 1] ?? '');
}

const slug = args.get('slug')?.trim();
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  throw new Error('Usage: npm run content:new -- --slug your-article-slug [--title "Article title"]');
}

const title = args.get('title')?.trim() || '新的研究记录';
const date = new Date().toISOString().slice(0, 10);
const source = `---\nslug: "${slug}"\ntitle: "${title.replace(/"/g, '\\"')}"\nexcerpt: "待补充文章摘要"\npublishedAt: "${date}"\nauthor: "Elexvx Research"\nstatus: "draft"\nevidence: []\n---\n\n## 问题\n\n从一个真实的问题开始。\n\n## 方法\n\n记录研究方法、限制和下一步。\n`;
const destination = resolve(process.cwd(), 'articles', 'insights', `${slug}.md`);
await mkdir(join(process.cwd(), 'articles', 'insights'), { recursive: true });
await writeFile(destination, source, { encoding: 'utf8', flag: 'wx' });
console.log(`Created draft: ${destination}`);
