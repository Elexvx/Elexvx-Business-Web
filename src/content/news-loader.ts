import { resolve } from 'node:path';
import { createCachedMarkdownCollectionLoader } from './collection-loader';
import { newsFromSource } from './news';

const newsRoot = resolve(process.cwd(), 'articles', 'news');

export const loadNews = createCachedMarkdownCollectionLoader({
  root: newsRoot,
  kind: 'news',
  fromSource: newsFromSource,
  missingRootEmpty: true,
});

export const newsContentPath = () => newsRoot;
