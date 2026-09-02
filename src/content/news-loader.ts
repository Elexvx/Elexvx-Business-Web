import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { newsFromSource, sortNews } from './news';
import type { NewsItem } from './types';

const newsRoot = resolve(process.cwd(), 'articles', 'news');

export const loadNews = (): NewsItem[] => {
  if (!existsSync(newsRoot)) return [];
  const files = readdirSync(newsRoot)
    .filter((filename) => filename.endsWith('.md'))
    .sort();
  const news = files.map((filename) => newsFromSource(readFileSync(join(newsRoot, filename), 'utf8'), filename));
  const seen = new Set<string>();
  for (const item of news) {
    if (seen.has(item.slug)) throw new Error(`Duplicate news slug: ${item.slug}`);
    seen.add(item.slug);
  }
  return sortNews(news);
};

export const publishedNews = () => loadNews().filter((item) => item.status === 'published');
export const findNews = (slug: string) => loadNews().find((item) => item.slug === slug);
export const newsContentPath = () => newsRoot;
