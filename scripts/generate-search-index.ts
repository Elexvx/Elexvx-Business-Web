import { mkdir, writeFile } from 'node:fs/promises';

import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { markdownToSearchText } from '../src/content/search';
import { documentationSearchPairs } from '../src/content/documentation';
import { documentationPath } from '../src/content/documentation-model';
import { publishedActivities } from '../src/data/activities';
import { publishedCaseStudies } from '../src/data/case-studies';
import { publishedResearch } from '../src/data/research-articles';
import { navigationGroups, withNewsCategories } from '../src/data/research-navigation';
import { projects, researchDirections, scenarios } from '../src/data/site';
import { translateEnglish } from '../src/site/translation';
import type { SearchDocument } from '../src/site/search-index';

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

const staticDocument = (
  path: string,
  title: string,
  titleEn: string,
  values: unknown,
  kind: string,
  kindEn: string
): SearchDocument => {
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

const markdownDocument = (
  path: string,
  title: string,
  titleEn: string,
  excerpt: string,
  excerptEn: string,
  body: string,
  bodyEn: string,
  kind: string,
  kindEn: string
): SearchDocument => ({
  path,
  title,
  titleEn,
  text: `${excerpt} ${markdownToSearchText(body)}`.trim(),
  textEn: `${excerptEn} ${markdownToSearchText(bodyEn, translateEnglish)}`.trim(),
  kind,
  kindEn,
});

const documents: SearchDocument[] = [];

for (const item of publishedResearch) {
  documents.push(
    markdownDocument(
      `/research/${item.slug}`,
      item.title,
      translateEnglish(item.title),
      item.excerpt,
      translateEnglish(item.excerpt),
      item.body,
      item.body,
      '研究',
      'Research'
    )
  );
}

for (const item of publishedActivities) {
  documents.push(
    markdownDocument(
      item.externalUrl || `/activities/${item.slug}`,
      item.title,
      translateEnglish(item.title),
      item.excerpt,
      translateEnglish(item.excerpt),
      item.body,
      item.body,
      '活动',
      'Activity'
    )
  );
}

for (const item of publishedCaseStudies) {
  documents.push(
    markdownDocument(
      `/cases/${item.slug}`,
      item.title,
      item.titleEn,
      item.excerpt,
      item.excerptEn,
      item.body,
      item.bodyEn,
      '合作案例',
      'Case study'
    )
  );
}

for (const item of loadInsights().filter((item) => item.status === 'published')) {
  documents.push(
    markdownDocument(
      `/insights/${item.slug}`,
      item.title,
      translateEnglish(item.title),
      item.excerpt,
      translateEnglish(item.excerpt),
      item.body,
      item.body,
      '文章',
      'Article'
    )
  );
}

for (const item of loadNews().filter((item) => item.status === 'published')) {
  documents.push(
    markdownDocument(
      `/news/${item.slug}`,
      item.title,
      translateEnglish(item.title),
      item.excerpt,
      translateEnglish(item.excerpt),
      item.body,
      item.body,
      '动态',
      'News'
    )
  );
}

for (const direction of researchDirections) {
  documents.push(
    staticDocument(
      `/research/${direction.slug}`,
      direction.title,
      direction.englishTitle,
      direction,
      '研究方向',
      'Research'
    )
  );
}

for (const project of projects) {
  documents.push(
    staticDocument(
      `/projects/${project.slug}`,
      project.title,
      translateEnglish(project.title),
      project,
      '成果',
      'Project'
    )
  );
}

for (const scenario of scenarios) {
  documents.push(
    staticDocument(`/scenarios/${scenario.slug}`, scenario.title, scenario.englishTitle, scenario, '场景', 'Scenario')
  );
}

for (const { chinese, english } of documentationSearchPairs()) {
  documents.push(
    markdownDocument(
      documentationPath('zh-CN', chinese.slug),
      chinese.title,
      english.title,
      chinese.description,
      english.description,
      chinese.body,
      english.body,
      '文档',
      'Documentation'
    )
  );
}

const newsCategories = loadNews()
  .filter((item) => item.status === 'published')
  .map((item) => item.category);
for (const group of withNewsCategories(navigationGroups, newsCategories)) {
  for (const column of group.columns) {
    for (const link of column.links) {
      documents.push(
        staticDocument(
          link.href,
          link.label,
          translateEnglish(link.label),
          [group.label, group.title, group.intro, column.title],
          '页面',
          'Page'
        )
      );
    }
  }
}

const uniqueDocuments = [...new Map(documents.map((document) => [document.path, document])).values()];
await mkdir('public', { recursive: true });
const output = `${JSON.stringify(uniqueDocuments)}\n`;
await writeFile('public/search-index.json', output);
console.log(`Generated search index: ${uniqueDocuments.length} documents, ${Buffer.byteLength(output)} bytes.`);
