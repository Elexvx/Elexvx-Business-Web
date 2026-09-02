import { asString, asStringArray, parseFrontmatter, type FrontmatterValue } from './frontmatter';
import { calculateReadingTime } from './normalize';
import type { NewsFrontmatter, NewsItem, NewsStatus } from './types';

const asOptionalString = (value: FrontmatterValue | undefined, field: string) =>
  typeof value === 'undefined' ? undefined : asString(value, field, false) || undefined;

const asOptionalStringArray = (value: FrontmatterValue | undefined, field: string) =>
  typeof value === 'undefined' ? [] : asStringArray(value, field);

export const newsFromSource = (source: string, filename: string): NewsItem => {
  const { data, body } = parseFrontmatter(source);
  const status = asString(data.status, 'status') as NewsStatus;
  if (!['draft', 'published', 'archived'].includes(status)) throw new Error(`${filename}: invalid status`);
  const publishedAt = asString(data.publishedAt, 'publishedAt');
  if (Number.isNaN(Date.parse(publishedAt))) throw new Error(`${filename}: publishedAt must be an ISO date`);

  const frontmatter: NewsFrontmatter = {
    slug: asString(data.slug, 'slug'),
    title: asString(data.title, 'title'),
    excerpt: asString(data.excerpt, 'excerpt'),
    publishedAt,
    updatedAt: asOptionalString(data.updatedAt, 'updatedAt'),
    author: asString(data.author, 'author'),
    category: asString(data.category, 'category'),
    tags: asOptionalStringArray(data.tags, 'tags'),
    status,
    cover: asOptionalString(data.cover, 'cover'),
    legacyPath: asOptionalString(data.legacyPath, 'legacyPath'),
    sourceUrl: asOptionalString(data.sourceUrl, 'sourceUrl'),
  };

  return { ...frontmatter, body, readingTime: calculateReadingTime(body) };
};

export const sortNews = (news: NewsItem[]) =>
  [...news].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
