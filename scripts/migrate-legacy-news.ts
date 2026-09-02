import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

type MigrationEntry = {
  source: string;
  slug: string;
  category: string;
  tags: string[];
  cover: string;
};

const entries: MigrationEntry[] = [
  {
    source: 'posts/latest-news/2024-12-31-01.md',
    slug: '2024-12-31-01',
    category: '最新动态',
    tags: ['新年贺词'],
    cover: '/visuals/news/newyear.png',
  },
  {
    source: 'posts/latest-news/2025-07-16-01.md',
    slug: '2025-07-16-01',
    category: '最新动态',
    tags: ['公示公告'],
    cover: '/visuals/news/notice.png',
  },
  {
    source: 'posts/latest-news/2025-07-17-01.md',
    slug: '2025-07-17-01',
    category: '最新动态',
    tags: ['任前公示'],
    cover: '/visuals/news/qwfb.png',
  },
  {
    source: 'posts/latest-news/2025-08-21-01.md',
    slug: '2025-08-21-01',
    category: '最新动态',
    tags: ['公示公告'],
    cover: '/visuals/news/notice.png',
  },
  {
    source: 'posts/latest-news/2026-01-01-01.md',
    slug: '2026-01-01-01',
    category: '最新动态',
    tags: ['新年贺词'],
    cover: '/visuals/news/hqyd.png',
  },
  {
    source: 'posts/latest-news/2026-01-14-01.md',
    slug: '2026-01-14-01',
    category: '最新动态',
    tags: ['对外投资'],
    cover: '/visuals/news/qwfb.png',
  },
  {
    source: 'posts/latest-news/2026-06-09-01.md',
    slug: '2026-06-09-01',
    category: '最新动态',
    tags: ['对外投资'],
    cover: '/visuals/news/qwfb.png',
  },
  {
    source: 'posts/stories/2025-07-01-01.md',
    slug: 'stories-2025-07-01-01',
    category: '公司动态',
    tags: ['公司动态', '知识产权'],
    cover: '/visuals/news/test.png',
  },
  {
    source: 'posts/technology/2025-07-01-01.md',
    slug: 'technology-2025-07-01-01',
    category: '技术研究',
    tags: ['研究', '工业智能'],
    cover: '/visuals/news/10006.png',
  },
  {
    source: 'posts/exam/2025-07-08-01.md',
    slug: 'exam-2025-07-08-01',
    category: '业务动态',
    tags: ['往期考试'],
    cover: '/visuals/news/jb.png',
  },
];

const unquote = (value: string) => {
  const trimmed = value.trim();
  return (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ? trimmed.slice(1, -1)
    : trimmed;
};

const frontmatterValue = (header: string, key: string) => {
  const match = header.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) throw new Error(`Missing ${key} in legacy frontmatter`);
  return unquote(match[1]);
};

const splitSource = (source: string) => {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) throw new Error('Legacy post must start with frontmatter');
  const end = normalized.indexOf('\n---', 4);
  if (end < 0) throw new Error('Legacy post frontmatter must close with ---');
  return { header: normalized.slice(4, end), body: normalized.slice(end + 4) };
};

const normalizeBody = (body: string) => {
  let normalized = body
    .replace(/<img\b([^>]*?)\/?>(?:\s*<\/img>)?/gi, (_, attributes: string) => {
      const source = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      const alt = attributes.match(/\balt=["']([^"']*)["']/i)?.[1] ?? '';
      return source ? `\n\n![${alt}](${source})\n\n` : '';
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/&emsp;|&nbsp;/gi, '')
    .replace(/^[ \t]*\u3000+/gm, '')
    .replace(/\r\n/g, '\n');

  normalized = normalized
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `${normalized}\n`;
};

const toMarkdown = (entry: MigrationEntry, source: string) => {
  const { header, body } = splitSource(source);
  const publishDate = frontmatterValue(header, 'publishDate');
  const title = frontmatterValue(header, 'title');
  const author = frontmatterValue(header, 'author');
  const excerpt = frontmatterValue(header, 'excerpt');
  const sourceUrl = header.match(/^\s*canonical:\s*(.+)$/m)?.[1];
  const sourcePath = entry.source;

  return `---
slug: ${JSON.stringify(entry.slug)}
title: ${JSON.stringify(title)}
excerpt: ${JSON.stringify(excerpt)}
publishedAt: ${JSON.stringify(publishDate)}
author: ${JSON.stringify(author)}
category: ${JSON.stringify(entry.category)}
tags: ${JSON.stringify(entry.tags)}
status: "published"
cover: ${JSON.stringify(entry.cover)}
legacyPath: ${JSON.stringify(sourcePath)}
${sourceUrl ? `sourceUrl: ${JSON.stringify(unquote(sourceUrl))}\n` : ''}---

${normalizeBody(body)}`;
};

const projectRoot = resolve(process.cwd());
const destinationRoot = resolve(projectRoot, 'articles', 'news');
await mkdir(destinationRoot, { recursive: true });

for (const entry of entries) {
  const source = await readFile(resolve(projectRoot, entry.source), 'utf8');
  await writeFile(resolve(destinationRoot, `${entry.slug}.md`), toMarkdown(entry, source), 'utf8');
}

console.log(`Migrated ${entries.length} legacy posts into ${dirname(destinationRoot)}/${basename(destinationRoot)}.`);
