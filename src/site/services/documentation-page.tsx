'use client';

import { ArrowLeftOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  documentationPath,
  documentationSource,
  documentationSectionLabels,
  documentationSections,
  type DocumentationLocale,
  type DocumentationPage as DocumentationPageData,
} from '../../content/documentation-model';
import { ArticleBody } from '../components/article-reading';
import { classNames, Eyebrow } from '../components/ui';
import { SiteShell } from '../components/shell';
import { useI18n } from '../providers/i18n';

const sectionOrder = (page: DocumentationPageData) => {
  if (!page.section) return -1;
  return documentationSections.indexOf(page.section);
};

const compareStable = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0);

const sortPages = (pages: DocumentationPageData[]) =>
  [...pages].sort((left, right) => {
    if (left.slug.length === 0) return -1;
    if (right.slug.length === 0) return 1;
    return sectionOrder(left) - sectionOrder(right) || compareStable(left.slug.join('/'), right.slug.join('/'));
  });

const pageMatches = (page: DocumentationPageData, query: string) => {
  const value = `${page.title} ${page.description} ${page.tags.join(' ')} ${page.body}`.toLocaleLowerCase();
  return query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => value.includes(term));
};

const sectionLabel = (page: DocumentationPageData, locale: DocumentationLocale) =>
  page.section ? documentationSectionLabels[locale][page.section] : locale === 'en' ? 'Overview' : '总览';

export const DocumentationPage = ({
  page,
  pages,
  locale,
}: {
  page: DocumentationPageData;
  pages: DocumentationPageData[];
  locale: DocumentationLocale;
}) => {
  const router = useRouter();
  const { href, locale: siteLocale } = useI18n();
  const [query, setQuery] = useState('');
  const orderedPages = useMemo(() => sortPages(pages), [pages]);
  const searchResults = useMemo(
    () => (query.trim() ? pages.filter((item) => pageMatches(item, query)).slice(0, 8) : []),
    [pages, query]
  );
  const currentIndex = orderedPages.findIndex((item) => item.slug.join('/') === page.slug.join('/'));
  const previous = currentIndex > 0 ? orderedPages[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? orderedPages[currentIndex + 1] : undefined;
  const english = siteLocale === 'en';
  const pathFor = (slug: string[]) => href(documentationPath(locale, slug));
  const fallbackPath = page.slug.length > 0 ? href(documentationPath(locale, [])) : '/services/';
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackPath);
  };

  return (
    <SiteShell activePath="/services/docs" className="service-site-shell docs-native-shell">
      <div className="docs-native">
        <header className="docs-native-hero">
          <div className="docs-native-hero-inner">
            <nav className="docs-native-breadcrumbs" aria-label={english ? 'Page navigation' : '页面导航'}>
              <button className="docs-native-back-link" type="button" onClick={handleBack}>
                <ArrowLeftOutlined aria-hidden="true" />
                <span>{english ? 'Back to previous page' : '返回上一级'}</span>
              </button>
            </nav>
            <div className="docs-native-hero-grid">
              <div>
                <h1>{page.title}</h1>
                <p>{page.description}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="docs-native-layout">
          <aside className="docs-native-sidebar">
            <div className="docs-native-sidebar-heading">
              <Eyebrow>{english ? 'GUIDES' : 'GUIDES / 指南'}</Eyebrow>
              <span>{english ? 'Legendary Invention' : 'Legendary Invention'}</span>
            </div>
            <label className="docs-native-search">
              <SearchOutlined aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={english ? 'Search this documentation' : '搜索文档'}
                aria-label={english ? 'Search documentation' : '搜索文档'}
              />
            </label>
            {searchResults.length > 0 && (
              <div className="docs-native-search-results" role="listbox">
                {searchResults.map((result) => (
                  <a key={result.slug.join('/') || 'index'} href={pathFor(result.slug)} role="option">
                    <strong>{result.title}</strong>
                    <span>{sectionLabel(result, locale)}</span>
                  </a>
                ))}
              </div>
            )}
            {query.trim() && !searchResults.length && (
              <p className="docs-native-search-empty">{english ? 'No matching guide.' : '没有找到匹配的文档。'}</p>
            )}
            <nav aria-label={english ? 'Documentation navigation' : '文档导航'}>
              {orderedPages
                .filter((item) => item.slug.length === 0)
                .map((item) => (
                  <a
                    className={classNames(
                      'docs-native-nav-link',
                      item.slug.join('/') === page.slug.join('/') && 'is-active'
                    )}
                    href={pathFor(item.slug)}
                    key="overview"
                  >
                    <span>{english ? 'Overview' : '总览'}</span>
                    <small>{item.title}</small>
                  </a>
                ))}
              {documentationSections.map((section) => {
                const sectionPages = orderedPages.filter((item) => item.section === section);
                if (!sectionPages.length) return null;
                return (
                  <div className="docs-native-nav-section" key={section}>
                    <p>{documentationSectionLabels[locale][section]}</p>
                    {sectionPages.map((item) => (
                      <a
                        className={classNames(
                          'docs-native-nav-link',
                          item.slug.join('/') === page.slug.join('/') && 'is-active'
                        )}
                        href={pathFor(item.slug)}
                        key={item.slug.join('/')}
                      >
                        <span>{item.title}</span>
                      </a>
                    ))}
                  </div>
                );
              })}
            </nav>
          </aside>

          <article className="docs-native-article">
            <div className="docs-native-article-kicker">
              <Eyebrow>{sectionLabel(page, locale)}</Eyebrow>
              <span>{page.tags.join(' · ')}</span>
            </div>
            <ArticleBody source={documentationSource(page)} showToc={false} />
            <nav className="docs-native-pagination" aria-label={english ? 'Documentation pagination' : '文档分页'}>
              {previous ? (
                <a href={pathFor(previous.slug)}>
                  <ArrowLeftOutlined aria-hidden="true" />
                  <span>
                    <small>{english ? 'Previous' : '上一篇'}</small>
                    <strong>{previous.title}</strong>
                  </span>
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a href={pathFor(next.slug)}>
                  <span>
                    <small>{english ? 'Next' : '下一篇'}</small>
                    <strong>{next.title}</strong>
                  </span>
                  <ArrowRightOutlined aria-hidden="true" />
                </a>
              ) : (
                <span />
              )}
            </nav>
          </article>
        </div>
      </div>
    </SiteShell>
  );
};
