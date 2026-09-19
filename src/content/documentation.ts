import { readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import { asString, asStringArray, parseFrontmatter, type FrontmatterValue } from './frontmatter';
import {
  documentationSections,
  type DocumentationLocale,
  type DocumentationPage,
  type DocumentationSection,
} from './documentation-model';

export type { DocumentationLocale, DocumentationPage, DocumentationSection } from './documentation-model';

const documentationRoot = resolve(process.cwd(), 'content', 'docs');
const pageCache = new Map<DocumentationLocale, DocumentationPage[]>();

const localeDirectory = (locale: DocumentationLocale) => (locale === 'en' ? 'en' : 'zh');

const asTags = (value: FrontmatterValue | undefined, filename: string) =>
  typeof value === 'undefined' ? [] : asStringArray(value, `${filename}: tags`);

const sectionFromSlug = (slug: string[]): DocumentationSection | undefined => {
  const section = slug[0];
  return documentationSections.includes(section as DocumentationSection)
    ? (section as DocumentationSection)
    : undefined;
};

const readFiles = (directory: string, prefix: string[] = []): string[] =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readFiles(path, [...prefix, entry.name]);
      return entry.name.endsWith('.mdx') ? [join(...prefix, entry.name)] : [];
    })
    .sort((left, right) => left.localeCompare(right));

const parsePage = (locale: DocumentationLocale, relativePath: string): DocumentationPage => {
  const source = readFileSync(join(documentationRoot, localeDirectory(locale), relativePath), 'utf8');
  const { data, body } = parseFrontmatter(source);
  const pathSegments = relativePath.replace(/\.mdx$/, '').split('/');
  const filename = basename(relativePath);

  return {
    locale,
    slug: pathSegments[0] === 'index' ? [] : pathSegments,
    title: asString(data.title, `${filename}: title`),
    description: asString(data.description, `${filename}: description`),
    tags: asTags(data.tags, filename),
    section: sectionFromSlug(pathSegments[0] === 'index' ? [] : pathSegments),
    body,
  };
};

export const loadDocumentation = (locale: DocumentationLocale): DocumentationPage[] => {
  const cached = pageCache.get(locale);
  if (cached) return cached;

  const pages = readFiles(join(documentationRoot, localeDirectory(locale))).map((relativePath) =>
    parsePage(locale, relativePath)
  );
  pageCache.set(locale, pages);
  return pages;
};

export const getDocumentationPage = (locale: DocumentationLocale, slug: string[] = []) =>
  loadDocumentation(locale).find(
    (page) => page.slug.length === slug.length && page.slug.every((segment, index) => segment === slug[index])
  );

export const documentationSectionPages = (locale: DocumentationLocale, section: DocumentationSection) =>
  loadDocumentation(locale).filter((page) => page.section === section);

export const documentationSearchPairs = () => {
  const chinese = new Map(loadDocumentation('zh-CN').map((page) => [page.slug.join('/'), page]));
  return loadDocumentation('en')
    .map((englishPage) => ({ chinese: chinese.get(englishPage.slug.join('/')), english: englishPage }))
    .filter((pair): pair is { chinese: DocumentationPage; english: DocumentationPage } => Boolean(pair.chinese));
};
