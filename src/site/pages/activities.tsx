'use client';
import { Translated } from '../providers/i18n';

import { SiteImage } from '../components/site-image';
import { useCategoryFilter } from '../providers/category-filter';
import { publishedResearch } from '../../data/research-articles';
import { publishedActivities, type Activity } from '../../data/activities';
import { Eyebrow, SiteShell } from '../components/index';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { useI18n } from '../providers/i18n';
import { HomeEmptyContent, HomeMediaCard, NotFoundPage } from './shared';

export const ActivityHighlights = ({ items }: { items: Activity[] }) => {
  const { href, t } = useI18n();
  const card = (item: Activity, lead = false) => (
    <article className={lead ? 'activity-highlight activity-highlight-lead' : 'activity-highlight'} key={item.slug}>
      <a href={href(`/activities/${item.slug}`)}>
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

export const ActivitySection = ({ page = false }: { page?: boolean }) => {
  const { locale, t } = useI18n();
  const [category, selectCategory] = useCategoryFilter();
  const categories = Array.from(
    new Map(publishedActivities.map((item) => [item.categorySlug, item.category])).entries()
  );
  const Heading = page ? 'h1' : 'h2';
  const entries = [...publishedActivities].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.publishedAt.localeCompare(a.publishedAt)
  );
  const shown = page
    ? entries.filter((item) => category === 'all' || item.categorySlug === category)
    : entries.slice(0, 4);
  return (
    <section className="home-latest-activity" aria-labelledby="activity-section-title">
      <div className="home-section-topline">
        <Heading className="activity-section-heading" id="activity-section-title">
          {locale === 'en' ? (page ? 'Activities' : 'Recent activities') : page ? '活动' : '最近活动'}
        </Heading>
      </div>
      {page && (
        <nav className="research-index-tabs" aria-label={t('活动分类')} style={{ marginBottom: 32 }}>
          {[['all', '全部'], ...categories].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`research-index-tab ${category === id ? 'research-index-tab-active' : ''}`}
              aria-pressed={category === id}
              onClick={() => selectCategory(id || 'all')}
            >
              {t(label || '')}
            </button>
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
                href={`/activities/${item.slug}`}
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

export const ActivitiesPage = () => (
  <SiteShell activePath="/activities" className="site-shell-home">
    <div className="activities-page-inner">
      <ActivitySection page />
    </div>
  </SiteShell>
);

export const ActivityPage = ({ slug, research = false }: { slug: string; research?: boolean }) => {
  const { t } = useI18n();
  const base = research ? '/research' : '/activities';
  const item = (research ? publishedResearch : publishedActivities).find((entry) => entry.slug === slug);
  if (!item) return <NotFoundPage />;
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
        <ContinueReading items={research ? publishedResearch : publishedActivities} current={item} base={base} />
      </article>
    </SiteShell>
  );
};
