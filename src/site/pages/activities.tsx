'use client';

import type { ReactNode } from 'react';
import { ArticleCard } from '../components/article-card';
import { IndexHeading } from '../components/index-heading';
import { useArticleCategoryFilter } from '../providers/category-filter';
import { articleCategories } from '../../data/article-categories';
import type { Activity, ActivitySummary } from '../../data/activities';
import { Eyebrow, SiteShell } from '../components/index';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { Translated, useI18n } from '../providers/i18n';
import { HomeEmptyContent } from './shared';

const highlightImageSizes = {
  lead: '(max-width: 720px) calc(100vw - 40px), (max-width: 1068px) calc(100vw - 64px), min(1026px, calc(75vw - 54px))',
  highlight: '(max-width: 720px) 112px, (max-width: 1068px) calc((100vw - 112px) / 3), min(326px, calc(25vw - 34px))',
} as const;

function ActivityCard({
  item,
  placement,
  priority = false,
}: {
  item: ActivitySummary;
  placement: 'lead' | 'highlight' | 'grid';
  priority?: boolean;
}) {
  const { t } = useI18n();
  const category = item.category || '活动';
  return (
    <ArticleCard
      variant={placement === 'grid' ? 'grid' : 'highlight'}
      className={placement === 'lead' ? 'activity-highlight-lead' : undefined}
      href={item.externalUrl || `/activities/${item.slug}`}
      title={item.title}
      cover={item.cover}
      imageSizes={placement === 'grid' ? undefined : highlightImageSizes[placement]}
      imagePriority={priority || placement === 'lead' ? 'high' : undefined}
      category={placement === 'grid' && item.pinned ? `${t('置顶')} · ${t(category)}` : category}
      publishedAt={item.publishedAt}
    />
  );
}

const ActivityHighlights = ({ heading, items }: { heading?: ReactNode; items: ActivitySummary[] }) => {
  return (
    <div className="activity-highlights">
      <div className="activity-highlights-lead-column">
        {heading}
        {items[0] && <ActivityCard item={items[0]} placement="lead" />}
      </div>
      {items.length > 1 && (
        <div className="activity-highlights-side">
          {items.slice(1, 4).map((item) => (
            <ActivityCard key={item.slug} item={item} placement="highlight" />
          ))}
        </div>
      )}
    </div>
  );
};

export const ActivitySection = ({
  items,
  page = false,
  initialCategory = 'all',
}: {
  items: ActivitySummary[];
  page?: boolean;
  initialCategory?: string;
}) => {
  const { locale, t } = useI18n();
  const categories = articleCategories('activities', items);
  const [category, , categoryHref] = useArticleCategoryFilter('activities', categories, initialCategory);
  const entries = [...items].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.publishedAt.localeCompare(a.publishedAt)
  );
  const shown = page
    ? entries.filter((item) => category === 'all' || item.categorySlug === category)
    : entries.slice(0, 4);
  const homeHeading = (
    <div className="home-section-topline">
      <h2 className="activity-section-heading" id="activity-section-title">
        {locale === 'en' ? 'Recent activities' : '最近活动'}
      </h2>
    </div>
  );
  return (
    <section className="home-latest-activity" aria-labelledby="activity-section-title">
      {page && (
        <>
          <IndexHeading
            id="activity-section-title"
            title={locale === 'en' ? 'Activities' : '活动'}
            category={t(categories.find((item) => item.id === category)?.label || '')}
          />
          <nav className="research-index-tabs index-category-tabs" aria-label={t('活动分类')}>
            {[{ id: 'all', label: '全部' }, ...categories].map(({ id, label }) => (
              <a
                key={id}
                href={categoryHref(id)}
                className={`research-index-tab ${category === id ? 'research-index-tab-active' : ''}`}
                aria-current={category === id ? 'page' : undefined}
              >
                {t(label || '')}
              </a>
            ))}
          </nav>
        </>
      )}
      {shown.length ? (
        !page ? (
          <ActivityHighlights heading={homeHeading} items={shown} />
        ) : (
          <div className="home-media-grid home-products-grid">
            {shown.map((item, index) => (
              <ActivityCard key={item.slug} item={item} placement="grid" priority={page && index === 0} />
            ))}
          </div>
        )
      ) : (
        <>
          {!page && homeHeading}
          <HomeEmptyContent />
        </>
      )}
    </section>
  );
};

export const ActivitiesPage = ({
  items,
  initialCategory = 'all',
}: {
  items: ActivitySummary[];
  initialCategory?: string;
}) => (
  <SiteShell activePath="/activities" className="site-shell-home">
    <div className="activities-page-inner">
      <ActivitySection items={items} page initialCategory={initialCategory} />
    </div>
  </SiteShell>
);

export const ActivityPage = ({
  item,
  related,
  research = false,
}: {
  item: Activity;
  related: ActivitySummary[];
  research?: boolean;
}) => {
  const { t } = useI18n();
  const base = research ? '/research' : '/activities';
  return (
    <SiteShell activePath={base}>
      <article className="article-layout">
        <header className="article-header">
          <div className="article-kicker">
            <time dateTime={item.publishedAt}>
              <Translated>{item.publishedAt}</Translated>
            </time>
            <Eyebrow>{research ? 'ELEXVX RESEARCH' : 'ELEXVX ACTIVITIES'}</Eyebrow>
          </div>
          <h1>{t(item.title)}</h1>
          <p className="article-excerpt">{t(item.excerpt)}</p>
        </header>
        <ArticleBody source={item.body}>
          <ArticleMetadata author={item.author} keywords={item.keywords} keywordsEn={item.keywordsEn} />
        </ArticleBody>
        <ContinueReading items={related} current={item} base={base} />
      </article>
    </SiteShell>
  );
};
