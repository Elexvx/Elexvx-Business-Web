'use client';
import { useCategoryFilter } from '../providers/category-filter';

import { getDirection } from '../../data/site';
import { pageContent } from '../../data/page-content';
import { useInsights, useNews, usePublishedInsights, usePublishedNews } from '../providers/content-context';

import { Eyebrow, ResearchTile, SiteShell } from '../components/index';
import { ArticleBody, ContinueReading } from '../components/article-reading';
import { LocalizedText as T, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { formatNewsDate, NewsCard, PageHero, InsightList, NotFoundPage } from './shared';

export const InsightsPage = () => {
  const insights = usePublishedInsights();
  return (
    <SiteShell activePath="/insights">
      <PageHero content={pageContent.insights.hero} />
      <section className="research-tile research-tile-light">
        <div className="section-heading">
          <Eyebrow>{pageContent.insights.list.eyebrow}</Eyebrow>
          <h2>
            <Title text={pageContent.insights.list.title} />
          </h2>
        </div>
        <InsightList insights={insights} />
      </section>
    </SiteShell>
  );
};

export const NewsPage = () => {
  const news = usePublishedNews();
  const { t } = useI18n();
  const [category, selectCategory] = useCategoryFilter();
  const categories = [...new Set(news.map((item) => item.category).filter(Boolean))];
  const visible = news.filter((item) => category === 'all' || item.category === category);
  return (
    <SiteShell activePath="/news" className="site-shell-news">
      <section className="research-tile research-tile-light news-index-section" aria-labelledby="news-page-title">
        <div className="section-heading news-list-heading">
          <h1 id="news-page-title">最近新闻</h1>
        </div>
        <nav className="research-index-tabs news-category-tabs" aria-label={t('新闻分类')}>
          {['all', ...categories].map((value) => (
            <button key={value} type="button" className={`research-index-tab ${category === value ? 'research-index-tab-active' : ''}`} aria-pressed={category === value} onClick={() => selectCategory(value)}>
              {value === 'all' ? t('全部') : t(value)}
            </button>
          ))}
        </nav>
        {!visible.length && <p role="status">{t('暂无匹配内容')}</p>}
        <div className="news-list-grid">
          {visible.map((item) => (
            <NewsCard item={item} key={item.slug} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
};

export const InsightPage = ({ slug }: { slug: string }) => {
  const { t, locale } = useI18n();
  const allInsights = useInsights();
  const insight = allInsights.find((item) => item.slug === slug);
  if (!insight || insight.status !== 'published') return <NotFoundPage />;
  const direction = insight.directionSlug ? getDirection(insight.directionSlug) : undefined;
  return (
    <SiteShell activePath="/insights">
      <article className="article-layout">
        <header className="article-header">
          <div className="article-kicker">
            <span>{insight.publishedAt}</span>
            <Eyebrow>{direction?.englishTitle ?? 'ELEXVX RESEARCH'}</Eyebrow>
          </div>
          <h1>
            <Title text={insight.title} />
          </h1>
          <p className="article-excerpt">{t(insight.excerpt)}</p>
          <div className="article-meta">
            <span>{t(insight.author)}</span>
            <span>{locale === 'en' ? `${insight.readingTime} min read` : `${insight.readingTime} 分钟阅读`}</span>
          </div>
        </header>
        <ArticleBody source={insight.body} />
        <div className="article-evidence">
          <Eyebrow>EVIDENCE</Eyebrow>
          {insight.evidence.map((item) => (
            <span key={item.label}>{t(item.label)}</span>
          ))}
        </div>
        <ContinueReading items={allInsights} current={insight} base="/insights" />
      </article>
    </SiteShell>
  );
};

export const NewsItemPage = ({ slug }: { slug: string }) => {
  const { t, locale } = useI18n();
  const allNews = useNews();
  const item = allNews.find((candidate) => candidate.slug === slug);
  if (!item || item.status !== 'published') return <NotFoundPage />;
  return (
    <SiteShell activePath="/news">
      <article className="article-layout article-layout-news">
        <header className="article-header">
          <div className="article-kicker">
            <span>{formatNewsDate(item.publishedAt, locale)}</span>
            <Eyebrow>{item.category}</Eyebrow>
          </div>
          <h1>
            <Title text={item.title} />
          </h1>
          <p className="article-excerpt">{t(item.excerpt)}</p>
          <div className="article-meta">
            <span>{t(item.author)}</span>
            <span>{locale === 'en' ? `${item.readingTime} min read` : `${item.readingTime} 分钟阅读`}</span>
          </div>
        </header>
        <ArticleBody source={item.body} />
        <ContinueReading items={allNews} current={item} base="/news" />
      </article>
    </SiteShell>
  );
};

export const ArchivePage = () => (
  <SiteShell activePath="/archive">
    <PageHero content={pageContent.archive.hero} />
    <ResearchTile {...pageContent.archive.legacy}>
      <div className="empty-state empty-state-dark">
        <span>{pageContent.archive.status}</span>
        <strong>
          <T text={pageContent.archive.state} />
        </strong>
      </div>
    </ResearchTile>
  </SiteShell>
);
