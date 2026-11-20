import {
  asContentStatus,
  asOptionalString,
  asOptionalStringArray,
  asPublishedDate,
  asString,
  parseFrontmatter,
} from './frontmatter';
import { calculateReadingTime } from './normalize';
import type { NewsFrontmatter, NewsItem } from './types';

export const newsFromSource = (source: string, filename: string): NewsItem => {
  const { data, body } = parseFrontmatter(source);
  const status = asContentStatus(data.status, filename);
  const publishedAt = asPublishedDate(data.publishedAt, filename);

  const frontmatter: NewsFrontmatter = {
    slug: asString(data.slug, 'slug'),
    title: asString(data.title, 'title'),
    excerpt: asString(data.excerpt, 'excerpt'),
    publishedAt,
    updatedAt: asOptionalString(data.updatedAt, 'updatedAt'),
    author: asString(data.author, 'author'),
    category: asString(data.category, 'category'),
    tags: asOptionalStringArray(data.tags, 'tags') ?? [],
    status,
    cover: asOptionalString(data.cover, 'cover'),
    legacyPath: asOptionalString(data.legacyPath, 'legacyPath'),
    sourceUrl: asOptionalString(data.sourceUrl, 'sourceUrl'),
  };

  return { ...frontmatter, body, readingTime: calculateReadingTime(body) };
};
