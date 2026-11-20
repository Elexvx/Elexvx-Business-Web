import {
  asContentStatus,
  asEvidenceArray,
  asOptionalString,
  asOptionalStringArray,
  asPublishedDate,
  asString,
  parseFrontmatter,
} from './frontmatter';
import type { Insight, InsightFrontmatter } from './types';

export const calculateReadingTime = (body: string) => {
  const clean = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const chinese = clean.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const english = clean.replace(/[\u3400-\u9fff]/g, ' ').match(/\b\w+\b/g)?.length ?? 0;
  return Math.max(1, Math.ceil(chinese / 350 + english / 225));
};

export const insightFromSource = (source: string, filename: string): Insight => {
  const { data, body } = parseFrontmatter(source);
  const evidence = asEvidenceArray(data.evidence, 'evidence');
  const status = asContentStatus(data.status, filename);
  const publishedAt = asPublishedDate(data.publishedAt, filename);

  const frontmatter: InsightFrontmatter = {
    slug: asString(data.slug, 'slug'),
    title: asString(data.title, 'title'),
    excerpt: asString(data.excerpt, 'excerpt'),
    publishedAt,
    updatedAt: asOptionalString(data.updatedAt, 'updatedAt'),
    directionSlug: asOptionalString(data.directionSlug, 'directionSlug'),
    author: asString(data.author, 'author'),
    keywords: asOptionalStringArray(data.keywords, 'keywords'),
    keywordsEn: asOptionalStringArray(data.keywordsEn, 'keywordsEn'),
    status,
    evidence,
    cover: asOptionalString(data.cover, 'cover'),
  };

  return { ...frontmatter, body, readingTime: calculateReadingTime(body) };
};
