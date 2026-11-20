import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createCachedMarkdownCollectionLoader } from './collection-loader';
import { insightFromSource } from './normalize';
import type { Insight } from './types';

const articleRoot = resolve(process.cwd(), 'articles', 'insights');
const legacyContentRoot = resolve(process.cwd(), 'content', 'insights');
const contentRoot = existsSync(articleRoot) ? articleRoot : legacyContentRoot;

const validateInsightEvidence = (insight: Insight) => {
  if (insight.status === 'published' && (!insight.evidence.length || insight.evidence.some((item) => !item.verified))) {
    throw new Error(`Published insight requires verified evidence: ${insight.slug}`);
  }
};

export const loadInsights = createCachedMarkdownCollectionLoader({
  root: contentRoot,
  kind: 'insight',
  fromSource: insightFromSource,
  validateItem: validateInsightEvidence,
});

export const contentPath = () => contentRoot;
