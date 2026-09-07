'use client';
import { Translated } from '../providers/i18n';

import { SiteImage } from '../components/site-image';
import { publishedResearch } from '../../data/research-articles';
import { useCategoryFilter } from '../providers/category-filter';
import { Tabs, Popover } from 'radix-ui';
import { AppstoreOutlined, DownOutlined, FilterOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { getDirection, projects } from '../../data/site';
import { pageContent } from '../../data/page-content';
import { usePublishedInsights } from '../providers/content-context';
import type { Insight } from '../../content/types';
import { classNames, Eyebrow, ResearchTile, SiteShell } from '../components/index';

import { LocalizedText as T, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { formatNewsDate, ProjectCard, PageHero, InsightList, EmptyState, NotFoundPage } from './shared';

export type ResearchIndexFilter = string;

export const ResearchPage = () => {
  const { href, locale, t } = useI18n();
  const insights = publishedResearch.map((item) => ({ ...item, evidence: [], readingTime: 1 }));
  const [filter, setFilter] = useCategoryFilter();
  const [newestFirst, setNewestFirst] = useState(true);
  const [showMedia, setShowMedia] = useState(false);
  const isChinese = locale === 'zh-CN';
  const categoryFor = (insight: Insight & { categorySlug?: string; category?: string }) => {
    if (insight.categorySlug) return { id: insight.categorySlug, label: insight.category || insight.categorySlug };
    const direction = insight.directionSlug ? getDirection(insight.directionSlug) : undefined;
    return direction ? { id: direction.slug, label: direction.title } : { id: 'uncategorized', label: '技术文章' };
  };
  const categories = Array.from(
    new Map(
      insights.map((insight) => {
        const category = categoryFor(insight);
        return [category.id, category] as const;
      })
    ).values()
  );
  const filters = [{ id: 'all', label: isChinese ? '全部' : 'All' }, ...categories];
  const activeFilter = filters.some((item) => item.id === filter) ? filter : 'all';
  const orderedInsights = insights
    .filter((insight) => activeFilter === 'all' || categoryFor(insight).id === activeFilter)
    .sort((left, right) => {
      const comparison = right.publishedAt.localeCompare(left.publishedAt);
      if (comparison !== 0) return newestFirst ? comparison : -comparison;
      const titleComparison = t(left.title).localeCompare(t(right.title), isChinese ? 'zh-CN' : 'en');
      return newestFirst ? titleComparison : -titleComparison;
    });

  return (
    <SiteShell activePath="/research">
      <section className="research-index" aria-labelledby="research-index-title">
        <Tabs.Root className="research-index-inner" value={activeFilter} onValueChange={setFilter}>
          <header className="research-index-header">
            <h1 id="research-index-title">{isChinese ? '研究' : 'Research'}</h1>
            <div className="research-index-toolbar">
              <Tabs.List
                aria-label={isChinese ? '研究内容分类' : 'Research categories'}
                className="research-index-tabs"
              >
                {filters.map((item) => (
                  <Tabs.Trigger
                    className={classNames(
                      'research-index-tab',
                      activeFilter === item.id && 'research-index-tab-active'
                    )}
                    key={item.id}
                    value={item.id}
                    type="button"
                  >
                    <Translated>{item.label}</Translated>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <div className="research-index-controls">
                <Popover.Root>
                  <Popover.Trigger className="research-index-filter-trigger">
                    <span>{isChinese ? '筛选' : 'Filter'}</span>
                    <FilterOutlined aria-hidden="true" />
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content className="ui-filter-content" sideOffset={12} align="end" collisionPadding={16}>
                      {filters.map((item) => (
                        <Popover.Close asChild key={`menu-${item.id}`}>
                          <button
                            className={classNames(activeFilter === item.id && 'research-index-filter-active')}
                            onClick={() => setFilter(item.id)}
                            type="button"
                          >
                            <Translated>{item.label}</Translated>
                          </button>
                        </Popover.Close>
                      ))}
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
                <button
                  aria-label={
                    isChinese
                      ? `按${newestFirst ? '最新' : '最早'}发布排序`
                      : `Sort ${newestFirst ? 'newest' : 'oldest'} first`
                  }
                  aria-pressed={newestFirst}
                  className="research-index-sort"
                  onClick={() => setNewestFirst((current) => !current)}
                  type="button"
                >
                  <span>{newestFirst ? (isChinese ? '最新发布' : 'Newest') : isChinese ? '最早发布' : 'Oldest'}</span>
                  <DownOutlined
                    className={classNames(!newestFirst && 'research-index-sort-reversed')}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className="research-index-view-toggle"
                  role="group"
                  aria-label={isChinese ? '列表显示方式' : 'List display mode'}
                >
                  <button
                    aria-label={isChinese ? '显示媒体' : 'Show media'}
                    aria-pressed={showMedia}
                    onClick={() => setShowMedia(true)}
                    type="button"
                  >
                    <AppstoreOutlined aria-hidden="true" />
                  </button>
                  <button
                    aria-label={isChinese ? '隐藏媒体' : 'Hide media'}
                    aria-pressed={!showMedia}
                    onClick={() => setShowMedia(false)}
                    type="button"
                  >
                    <UnorderedListOutlined aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <Tabs.Content value={activeFilter} className="research-index-list">
            {orderedInsights.map((insight) => {
              const category = categoryFor(insight);
              const formattedDate = formatNewsDate(insight.publishedAt, locale);
              const copy = (
                <div className="research-index-copy">
                  <h2>
                    <Title text={insight.title} />
                  </h2>
                  <p>
                    <T text={insight.excerpt} />
                  </p>
                  {showMedia && (
                    <div className="research-index-card-meta">
                      <strong>
                        <Translated>{category.label}</Translated>
                      </strong>
                      <time dateTime={insight.publishedAt}>{formattedDate}</time>
                    </div>
                  )}
                </div>
              );
              return (
                <a
                  className={classNames('research-index-row', showMedia && 'research-index-row-media')}
                  href={href(`/research/${insight.slug}`)}
                  key={`insight-${insight.slug}`}
                >
                  {showMedia ? (
                    <>
                      <SiteImage
                        className="research-index-media"
                        src={insight.cover || '/visuals/research-gradient.jpg'}
                        alt={t(insight.title)}
                      />
                      {copy}
                    </>
                  ) : (
                    <>
                      <div className="research-index-meta">
                        <strong>
                          <Translated>{category.label}</Translated>
                        </strong>
                        <time dateTime={insight.publishedAt}>{formattedDate}</time>
                      </div>
                      <div className="research-index-entry">{copy}</div>
                    </>
                  )}
                </a>
              );
            })}

            {orderedInsights.length === 0 && (
              <p className="research-index-empty">
                {isChinese ? '当前暂无已发布的技术文章' : 'No published insights yet'}
              </p>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </SiteShell>
  );
};

export const ResearchDirectionPage = ({ slug }: { slug: string }) => {
  const direction = getDirection(slug);
  if (!direction) return <NotFoundPage />;
  const directionProjects = projects.filter((project) => project.directionSlug === direction.slug);
  const directionInsights = usePublishedInsights().filter((insight) => insight.directionSlug === direction.slug);
  return (
    <SiteShell activePath="/research">
      <PageHero
        content={{
          eyebrow: direction.englishTitle,
          title: direction.question,
          description: direction.summary,
          primaryAction: pageContent.direction.primaryAction,
          secondaryAction: pageContent.direction.secondaryAction,
          media: {
            src: direction.image ?? pageContent.research.hero.media.src,
            alt: direction.imageAlt ?? pageContent.research.hero.media.alt,
          },
        }}
      />
      <ResearchTile
        tone={direction.accent}
        eyebrow={pageContent.direction.methods.eyebrow}
        title={pageContent.direction.methods.title}
        description={pageContent.direction.methods.description}
      >
        <div className="method-grid">
          {direction.methods.map((method, index) => (
            <div className="method-item" key={method}>
              <span>
                <Translated>{`0${index + 1}`}</Translated>
              </span>
              <strong>
                <T text={method} />
              </strong>
            </div>
          ))}
        </div>
      </ResearchTile>
      <section className="research-tile research-tile-parchment">
        <div className="section-heading">
          <Eyebrow>
            <Translated>{pageContent.direction.outputs.eyebrow}</Translated>
          </Eyebrow>
          <h2>
            <Title text={pageContent.direction.outputs.title} />
          </h2>
        </div>
        {directionProjects.length ? (
          <div className={classNames('project-grid', directionProjects.length === 1 && 'project-grid-single')}>
            {directionProjects.map((project) => (
              <ProjectCard project={project} key={project.slug} />
            ))}
          </div>
        ) : (
          <EmptyState text={pageContent.direction.emptyOutputs} />
        )}
      </section>
      <section className="research-tile research-tile-light">
        <div className="section-heading">
          <Eyebrow>
            <Translated>{pageContent.direction.insights.eyebrow}</Translated>
          </Eyebrow>
          <h2>
            <Title text={pageContent.direction.insights.title} />
          </h2>
        </div>
        {directionInsights.length ? (
          <InsightList insights={directionInsights} />
        ) : (
          <EmptyState text={pageContent.direction.emptyInsights} />
        )}
      </section>
    </SiteShell>
  );
};
