'use client';
import { Translated } from '../providers/i18n';

import { SiteImage } from '../components/site-image';
import { useArticleCategoryFilter } from '../providers/category-filter';
import { articleCategories } from '../../data/article-categories';
import type { Activity, ActivitySummary } from '../../data/activities';
import { Eyebrow, SiteShell } from '../components/index';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { useI18n } from '../providers/i18n';
import { HomeEmptyContent, HomeMediaCard } from './shared';

export const ActivityHighlights = ({ items }: { items: ActivitySummary[] }) => {
  const { href, t } = useI18n();
  const card = (item: ActivitySummary, lead = false) => (
    <article className={lead ? 'activity-highlight activity-highlight-lead' : 'activity-highlight'} key={item.slug}>
      <a href={item.externalUrl || href(`/activities/${item.slug}`)}>
        <SiteImage src={item.cover || '/visuals/research-gradient.jpg'} alt={t(item.title)} loading="lazy" />
        <div>
          <h3>{t(item.title)}</h3>
          <p>
            {item.pinned && (
              <>
                <Translated>置顶</Translated> ·{' '}
              </>
            )}
            {t(item.category || '活动')} ·<Translated> </Translated>
            <time dateTime={item.publishedAt}>
              <Translated>{item.publishedAt}</Translated>
            </time>
          </p>
        </div>
      </a>
    </article>
  );
  return (
    <div className="activity-highlights">
      {items[0] && card(items[0], true)}
      {items.length > 1 && (
        <div className="activity-highlights-side">{items.slice(1, 4).map((item) => card(item))}</div>
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
  const Heading = page ? 'h1' : 'h2';
  const entries = [...items].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.publishedAt.localeCompare(a.publishedAt)
  );
  const shown = page
    ? entries.filter((item) => category === 'all' || item.categorySlug === category)
    : entries.slice(0, 4);
  return (
    <section className="home-latest-activity" aria-labelledby="activity-section-title">
      <div className="home-section-topline">
        <Heading className="activity-section-heading" id="activity-section-title">
          {page && category !== 'all' && <>{t(categories.find((item) => item.id === category)?.label || '')} · </>}
          {locale === 'en' ? (page ? 'Activities' : 'Recent activities') : page ? '活动' : '最近活动'}
        </Heading>
      </div>
      {page && (
        <nav className="research-index-tabs" aria-label={t('活动分类')} style={{ marginBottom: 32 }}>
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
      )}
      {shown.length ? (
        !page ? (
          <ActivityHighlights items={shown} />
        ) : (
          <div className="home-media-grid home-products-grid">
            {shown.map((item) => (
              <HomeMediaCard
                key={item.slug}
                image={item.cover || '/visuals/research-gradient.jpg'}
                imageAlt={item.title}
                title={item.title}
                eyebrow={`${item.pinned ? `${t('置顶')} · ` : ''}${t(item.category || '活动')} · ${item.publishedAt}`}
                naturalTitle
                href={item.externalUrl || `/activities/${item.slug}`}
              />
            ))}
          </div>
        )
      ) : (
        <HomeEmptyContent />
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
          <div className="article-meta">{t(item.author)}</div>
        </header>
        <ArticleBody source={item.body}>
          <ArticleMetadata author={item.author} keywords={item.keywords} keywordsEn={item.keywordsEn} />
        </ArticleBody>
        <ContinueReading items={related} current={item} base={base} />
      </article>
    </SiteShell>
  );
};
