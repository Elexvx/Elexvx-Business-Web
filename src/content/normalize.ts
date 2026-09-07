import { asEvidenceArray, asString, asStringArray, parseFrontmatter, type FrontmatterValue } from './frontmatter';
import type { EvidenceRef, Insight, InsightFrontmatter } from './types';

const asOptionalString = (value: FrontmatterValue | undefined, field: string) =>
  asString(value, field, false) || undefined;

const asOptionalStringArray = (value: FrontmatterValue | undefined, field: string) =>
  typeof value === 'undefined' ? undefined : asStringArray(value, field);

export const calculateReadingTime = (body: string) => {
  const clean = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const chinese = clean.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const english = clean.replace(/[\u3400-\u9fff]/g, ' ').match(/\b\w+\b/g)?.length ?? 0;
  return Math.max(1, Math.ceil(chinese / 350 + english / 225));
};

export const insightFromSource = (source: string, filename: string): Insight => {
  const { data, body } = parseFrontmatter(source);
  const evidence = asEvidenceArray(data.evidence, 'evidence') as EvidenceRef[];
  const status = asString(data.status, 'status');
  if (!['draft', 'published', 'archived'].includes(status)) throw new Error(`${filename}: invalid status`);
  const publishedAt = asString(data.publishedAt, 'publishedAt');
  if (Number.isNaN(Date.parse(publishedAt))) throw new Error(`${filename}: publishedAt must be an ISO date`);

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
    status: status as InsightFrontmatter['status'],
    evidence,
    cover: asOptionalString(data.cover, 'cover'),
  };

  return { ...frontmatter, body, readingTime: calculateReadingTime(body) };
};

export const sortInsights = (insights: Insight[]) =>
  [...insights].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
