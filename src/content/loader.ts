import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { insightFromSource, sortInsights } from './normalize';
import type { Insight } from './types';

const articleRoot = resolve(process.cwd(), 'articles', 'insights');
const legacyContentRoot = resolve(process.cwd(), 'content', 'insights');
const contentRoot = existsSync(articleRoot) ? articleRoot : legacyContentRoot;

export const loadInsights = (): Insight[] => {
  const files = readdirSync(contentRoot)
    .filter((filename) => filename.endsWith('.md'))
    .sort();
  const insights = files.map((filename) =>
    insightFromSource(readFileSync(join(contentRoot, filename), 'utf8'), filename)
  );
  const seen = new Set<string>();
  for (const insight of insights) {
    if (seen.has(insight.slug)) throw new Error(`Duplicate insight slug: ${insight.slug}`);
    seen.add(insight.slug);
    if (
      insight.status === 'published' &&
      (!insight.evidence.length || insight.evidence.some((item) => !item.verified))
    ) {
      throw new Error(`Published insight requires verified evidence: ${insight.slug}`);
    }
  }
  return sortInsights(insights);
};

export const publishedInsights = () => loadInsights().filter((insight) => insight.status === 'published');
export const findInsight = (slug: string) => loadInsights().find((insight) => insight.slug === slug);
export const contentSourceName = (slug: string) => basename(slug);
export const contentPath = () => contentRoot;
