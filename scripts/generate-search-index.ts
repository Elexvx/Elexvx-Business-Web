import { mkdir, writeFile } from 'node:fs/promises';

import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { markdownToSearchText } from '../src/content/search';
import type { Insight, NewsItem } from '../src/content/types';
import { publishedActivities } from '../src/data/activities';
import { publishedCaseStudies } from '../src/data/case-studies';
import { isDisabledPath } from '../src/data/disabled-sections';
import { createLinkAvailability } from '../src/data/navigation-availability';
import { publishedResearch } from '../src/data/research-articles';
import { navigationGroups, withNewsCategories } from '../src/data/research-navigation';
import { serviceRoutePaths } from '../src/data/service-routes';
import { projects, researchDirections, scenarios } from '../src/data/site';
import { getStaticRoutes } from '../src/site/routing/routes';
import type { SearchDocument } from '../src/site/search-index';
import { translateEnglish } from '../src/site/translation';

const collectStrings = (value: unknown, output: string[] = []): string[] => {
  if (typeof value === 'string') {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output));
    return output;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, output));
  }
  return output;
};

type StaticDocumentInput = {
  path: string;
  title: string;
  titleEn: string;
  values: unknown;
  kind: string;
  kindEn: string;
};

type MarkdownDocumentInput = {
  path: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  body: string;
  bodyEn: string;
  kind: string;
  kindEn: string;
};

const staticDocument = ({ path, title, titleEn, values, kind, kindEn }: StaticDocumentInput): SearchDocument => {
  const strings = collectStrings(values);
  return {
    path,
    title,
    titleEn,
    text: strings.join(' '),
    textEn: strings.map(translateEnglish).join(' '),
    kind,
    kindEn,
  };
};

const markdownDocument = ({
  path,
  title,
  titleEn,
  excerpt,
  excerptEn,
  body,
  bodyEn,
  kind,
  kindEn,
}: MarkdownDocumentInput): SearchDocument => ({
  path,
  title,
  titleEn,
  text: `${excerpt} ${markdownToSearchText(body)}`.trim(),
  textEn: `${excerptEn} ${markdownToSearchText(bodyEn, translateEnglish)}`.trim(),
  kind,
  kindEn,
});

type MarkdownCollectionItem = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
};

const toLocalizedMarkdownDocument = (
  item: MarkdownCollectionItem,
  { path, kind, kindEn }: { path: string; kind: string; kindEn: string }
): SearchDocument =>
  markdownDocument({
    path,
    title: item.title,
    titleEn: translateEnglish(item.title),
    excerpt: item.excerpt,
    excerptEn: translateEnglish(item.excerpt),
    body: item.body,
    bodyEn: item.body,
    kind,
    kindEn,
  });

const buildContentDocuments = ({
  insights,
  news,
  isAvailable,
}: {
  insights: Insight[];
  news: NewsItem[];
  isAvailable: (href: string) => boolean;
}): SearchDocument[] => {
  const canIndexPath = (path: string) => !isDisabledPath(path) && isAvailable(path);

  const markdownDocuments: SearchDocument[] = [
    ...publishedResearch.map((item) =>
      toLocalizedMarkdownDocument(item, { path: `/research/${item.slug}`, kind: '研究', kindEn: 'Research' })
    ),
    ...publishedActivities.map((item) =>
      toLocalizedMarkdownDocument(item, {
        path: item.externalUrl || `/activities/${item.slug}`,
        kind: '活动',
        kindEn: 'Activity',
      })
    ),
    ...publishedCaseStudies.map((item) =>
      markdownDocument({
        path: `/cases/${item.slug}`,
        title: item.title,
        titleEn: item.titleEn,
        excerpt: item.excerpt,
        excerptEn: item.excerptEn,
        body: item.body,
        bodyEn: item.bodyEn,
        kind: '合作案例',
        kindEn: 'Case study',
      })
    ),
    ...insights
      .filter((entry) => entry.status === 'published')
      .map((item) =>
        toLocalizedMarkdownDocument(item, { path: `/insights/${item.slug}`, kind: '文章', kindEn: 'Article' })
      ),
    ...news
      .filter((entry) => entry.status === 'published')
      .map((item) => toLocalizedMarkdownDocument(item, { path: `/news/${item.slug}`, kind: '动态', kindEn: 'News' })),
  ];

  const staticCatalogEntries: StaticDocumentInput[] = [
    ...researchDirections.map((direction) => ({
      path: `/research/${direction.slug}`,
      title: direction.title,
      titleEn: direction.englishTitle,
      values: direction,
      kind: '研究方向',
      kindEn: 'Research',
    })),
    ...projects.map((project) => ({
      path: `/projects/${project.slug}`,
      title: project.title,
      titleEn: translateEnglish(project.title),
      values: project,
      kind: '成果',
      kindEn: 'Project',
    })),
    ...scenarios.map((scenario) => ({
      path: `/scenarios/${scenario.slug}`,
      title: scenario.title,
      titleEn: scenario.englishTitle,
      values: scenario,
      kind: '场景',
      kindEn: 'Scenario',
    })),
  ];

  return [
    ...markdownDocuments,
    ...staticCatalogEntries.filter((entry) => canIndexPath(entry.path)).map(staticDocument),
  ];
};

const buildStaticPageDocuments = ({
  news,
  isAvailable,
}: {
  news: NewsItem[];
  isAvailable: (href: string) => boolean;
}): SearchDocument[] => {
  const documents: SearchDocument[] = [];
  const newsCategories = news.filter((item) => item.status === 'published').map((item) => item.category);

  for (const group of withNewsCategories(navigationGroups, newsCategories)) {
    if (isDisabledPath(group.href)) continue;
    for (const column of group.columns) {
      for (const link of column.links) {
        if (isDisabledPath(link.href) || !isAvailable(link.href)) continue;
        documents.push(
          staticDocument({
            path: link.href,
            title: link.label,
            titleEn: translateEnglish(link.label),
            values: [group.label, group.title, group.intro, column.title],
            kind: '页面',
            kindEn: 'Page',
          })
        );
      }
    }
  }

  return documents;
};

const generateSearchIndex = async (): Promise<void> => {
  const insights = loadInsights();
  const news = loadNews();
  const isAvailable = createLinkAvailability([
    ...getStaticRoutes(insights, news).map((route) => route.path),
    ...serviceRoutePaths,
  ]);
  const allDocuments = [
    ...buildContentDocuments({ insights, news, isAvailable }),
    ...buildStaticPageDocuments({ news, isAvailable }),
  ];

  // Keep first-wins order so rich content/direction documents are not overwritten by navigation summaries.
  const byPath = new Map<string, SearchDocument>();
  for (const document of allDocuments) {
    if (!byPath.has(document.path)) byPath.set(document.path, document);
  }

  const uniqueDocuments = [...byPath.values()];
  await mkdir('public', { recursive: true });
  const output = `${JSON.stringify(uniqueDocuments)}\n`;
  await writeFile('public/search-index.json', output);
  console.log(`Generated search index: ${uniqueDocuments.length} documents, ${Buffer.byteLength(output)} bytes.`);
};

await generateSearchIndex();
