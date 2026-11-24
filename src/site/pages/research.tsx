'use client';

import { AppstoreOutlined, DownOutlined, FilterOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Popover } from 'radix-ui';
import { useState } from 'react';

import type { ActivitySummary } from '../../data/activities';
import { articleCategories, articleCategoryId, type ArticleCategory } from '../../data/article-categories';
import type { InsightSummary } from '../../content/types';
import { pageContent } from '../../data/page-content';
import { getDirection, projects, researchDirections } from '../../data/site';
import { ArticleCard } from '../components/article-card';
import { classNames, Eyebrow, ResearchTile, SiteShell } from '../components/index';
import { IndexHeading } from '../components/index-heading';
import { useArticleCategoryFilter } from '../providers/category-filter';
import { usePublishedInsights } from '../providers/content-context';
import { LocalizedText as T, LocalizedTitle as Title, Translated, useI18n } from '../providers/i18n';
import { EmptyState, InsightList, NotFoundPage, PageHero, ProjectCard } from './shared';

const DEFAULT_RESEARCH_CATEGORY = '技术文章';

type ResearchFilteringProps = {
  filters: ArticleCategory[];
  activeFilter: string;
  categoryHref: (category: string) => string;
  onSelectFilter: (category: string) => void;
};

type ResearchSortingProps = {
  newestFirst: boolean;
  onToggleSort: () => void;
};

type ResearchMediaDisplayProps = {
  showMedia: boolean;
  onToggleMedia: (show: boolean) => void;
};

const ResearchToolbar = ({
  isEnglish,
  filtering,
  sorting,
  mediaDisplay,
}: {
  isEnglish: boolean;
  filtering: ResearchFilteringProps;
  sorting: ResearchSortingProps;
  mediaDisplay: ResearchMediaDisplayProps;
}) => (
  <div className="research-index-toolbar">
    <nav aria-label={isEnglish ? 'Research categories' : '研究内容分类'} className="research-index-tabs">
      {filtering.filters.map((item) => (
        <a
          className={classNames(
            'research-index-tab',
            filtering.activeFilter === item.id && 'research-index-tab-active'
          )}
          key={item.id}
          href={filtering.categoryHref(item.id)}
          aria-current={filtering.activeFilter === item.id ? 'page' : undefined}
        >
          <Translated>{item.label}</Translated>
        </a>
      ))}
    </nav>
    <div className="research-index-controls">
      <Popover.Root>
        <Popover.Trigger className="research-index-filter-trigger">
          <span>{isEnglish ? 'Filter' : '筛选'}</span>
          <FilterOutlined aria-hidden="true" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="ui-filter-content" sideOffset={12} align="end" collisionPadding={16}>
            {filtering.filters.map((item) => (
              <Popover.Close asChild key={`menu-${item.id}`}>
                <button onClick={() => filtering.onSelectFilter(item.id)} type="button">
                  <Translated>{item.label}</Translated>
                </button>
              </Popover.Close>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <button
        aria-label={
          isEnglish
            ? `Sort ${sorting.newestFirst ? 'newest' : 'oldest'} first`
            : `按${sorting.newestFirst ? '最新' : '最早'}发布排序`
        }
        aria-pressed={sorting.newestFirst}
        className="research-index-sort"
        onClick={sorting.onToggleSort}
        type="button"
      >
        <span>{sorting.newestFirst ? (isEnglish ? 'Newest' : '最新发布') : isEnglish ? 'Oldest' : '最早发布'}</span>
        <DownOutlined
          className={classNames(!sorting.newestFirst && 'research-index-sort-reversed')}
          aria-hidden="true"
        />
      </button>
      <div
        className="research-index-view-toggle"
        role="group"
        aria-label={isEnglish ? 'List display mode' : '列表显示方式'}
      >
        <button
          aria-label={isEnglish ? 'Show media' : '显示媒体'}
          aria-pressed={mediaDisplay.showMedia}
          onClick={() => mediaDisplay.onToggleMedia(true)}
          type="button"
        >
          <AppstoreOutlined aria-hidden="true" />
        </button>
        <button
          aria-label={isEnglish ? 'Hide media' : '隐藏媒体'}
          aria-pressed={!mediaDisplay.showMedia}
          onClick={() => mediaDisplay.onToggleMedia(false)}
          type="button"
        >
          <UnorderedListOutlined aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
);

const ResearchNotesSection = ({ isEnglish, notes }: { isEnglish: boolean; notes: InsightSummary[] }) => {
  const { href, t } = useI18n();
  return (
    <section aria-labelledby="research-notes-title">
      <h2 id="research-notes-title">{isEnglish ? 'Research notes' : '研究记录'}</h2>
      <nav className="research-index-tabs" aria-label={isEnglish ? 'Research directions' : '研究方向'}>
        {researchDirections.map((direction) => (
          <a className="research-index-tab" href={href(`/research/${direction.slug}/`)} key={direction.slug}>
            {t(direction.title)}
          </a>
        ))}
      </nav>
      <div className="research-index-list">
        {notes.map((note) => (
          <ArticleCard
            key={note.slug}
            variant="editorial"
            href={`/insights/${note.slug}/`}
            title={note.title}
            excerpt={note.excerpt}
            publishedAt={note.publishedAt}
          />
        ))}
      </div>
    </section>
  );
};

export const ResearchPage = ({
  items,
  initialCategory = 'all',
}: {
  items: ActivitySummary[];
  initialCategory?: string;
}) => {
  const { locale, t } = useI18n();
  const researchNotes = usePublishedInsights();
  const [newestFirst, setNewestFirst] = useState(true);
  const [showMedia, setShowMedia] = useState(true);
  const isEnglish = locale === 'en';
  const categories = articleCategories('research', items);
  const categoryLabels = new Map(categories.map((item) => [item.id, item.label]));
  const [filter, setFilter, categoryHref] = useArticleCategoryFilter('research', categories, initialCategory);
  const filters: ArticleCategory[] = [{ id: 'all', label: isEnglish ? 'All' : '全部' }, ...categories];
  const activeFilter = filters.some((item) => item.id === filter) ? filter : 'all';

  const orderedInsights = items
    .filter((insight) => activeFilter === 'all' || articleCategoryId('research', insight) === activeFilter)
    .sort((left, right) => {
      const comparison = right.publishedAt.localeCompare(left.publishedAt);
      if (comparison !== 0) return newestFirst ? comparison : -comparison;
      const titleComparison = t(left.title).localeCompare(t(right.title), isEnglish ? 'en' : 'zh-CN');
      return newestFirst ? titleComparison : -titleComparison;
    });

  return (
    <SiteShell activePath="/research">
      <section className="research-index" aria-labelledby="research-index-title">
        <div className="research-index-inner">
          <header>
            <IndexHeading
              id="research-index-title"
              title={isEnglish ? 'Research' : '研究'}
              category={t(categories.find((item) => item.id === activeFilter)?.label || '')}
            />
            <ResearchToolbar
              isEnglish={isEnglish}
              filtering={{ filters, activeFilter, categoryHref, onSelectFilter: setFilter }}
              sorting={{ newestFirst, onToggleSort: () => setNewestFirst((current) => !current) }}
              mediaDisplay={{ showMedia, onToggleMedia: setShowMedia }}
            />
          </header>

          <div className="research-index-list">
            {orderedInsights.map((insight, index) => {
              const categoryId = articleCategoryId('research', insight);
              const categoryLabel =
                categoryLabels.get(categoryId) ??
                (insight.directionSlug ? getDirection(insight.directionSlug)?.title : undefined) ??
                DEFAULT_RESEARCH_CATEGORY;
              return (
                <ArticleCard
                  key={insight.slug}
                  variant="editorial"
                  href={`/research/${insight.slug}`}
                  title={insight.title}
                  cover={insight.cover}
                  imagePriority={index === 0 ? 'high' : undefined}
                  category={categoryLabel}
                  publishedAt={insight.publishedAt}
                  excerpt={insight.excerpt}
                  showCover={showMedia}
                  splitTitle
                />
              );
            })}

            {orderedInsights.length === 0 && (
              <p className="research-index-empty">
                {isEnglish ? 'No published insights yet' : '当前暂无已发布的技术文章'}
              </p>
            )}
          </div>

          {activeFilter === 'all' && researchNotes.length > 0 && (
            <ResearchNotesSection isEnglish={isEnglish} notes={researchNotes} />
          )}
        </div>
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
