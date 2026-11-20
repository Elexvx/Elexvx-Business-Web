import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sortByPublishedAtDesc } from './frontmatter';

type MarkdownCollectionOptions<T extends { slug: string; publishedAt: string }> = {
  root: string;
  kind: string;
  fromSource: (source: string, filename: string) => T;
  validateItem?: (item: T) => void;
  missingRootEmpty?: boolean;
};

/** Loads, parses, validates, deduplicates by slug, and date-sorts a markdown collection directory. */
const loadMarkdownCollection = <T extends { slug: string; publishedAt: string }>({
  root,
  kind,
  fromSource,
  validateItem,
  missingRootEmpty = false,
}: MarkdownCollectionOptions<T>): T[] => {
  if (missingRootEmpty && !existsSync(root)) return [];

  const files = readdirSync(root)
    .filter((filename) => filename.endsWith('.md'))
    .sort();
  const items = files.map((filename) => fromSource(readFileSync(join(root, filename), 'utf8'), filename));
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.slug)) throw new Error(`Duplicate ${kind} slug: ${item.slug}`);
    seen.add(item.slug);
    validateItem?.(item);
  }

  return sortByPublishedAtDesc(items);
};

export const createCachedMarkdownCollectionLoader = <T extends { slug: string; publishedAt: string }>(
  options: MarkdownCollectionOptions<T>
): (() => T[]) => {
  let cache: T[] | undefined;
  return () => {
    if (cache) return cache;
    cache = loadMarkdownCollection(options);
    return cache;
  };
};
