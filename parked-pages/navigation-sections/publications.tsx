'use client';

import { getDirection } from '../../data/site';
import { pageContent } from '../../data/page-content';
import { useInsights, useNews, usePublishedInsights, usePublishedNews } from '../providers/content-context';

import { Eyebrow, ResearchTile, SiteShell } from '../components/index';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
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
  return (
    <SiteShell activePath="/news" className="site-shell-news">
      <PageHero content={pageContent.news.hero} className="page-hero-news" />
      <section className="research-tile research-tile-light news-index-section">
        <div className="section-heading">
          <Eyebrow>{pageContent.news.list.eyebrow}</Eyebrow>
          <h2>
            <Title text={pageContent.news.list.title} />
          </h2>
        </div>
        <div className="news-list-grid">
          {news.map((item) => (
            <NewsCard item={item} key={item.slug} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
};

export const InsightPage = ({ slug }: { slug: string }) => {
  const { t } = useI18n();
  const insight = useInsights().find((item) => item.slug === slug);
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
            <span>{`${insight.readingTime} min read`}</span>
          </div>
        </header>
        {insight.cover && (
          <figure className="article-cover">
            <img src={insight.cover} alt={t(insight.title)} fetchPriority="high" decoding="async" />
          </figure>
        )}
        <div className="article-body">
          <MarkdownRenderer source={insight.body} />
        </div>
        <div className="article-evidence">
          <Eyebrow>EVIDENCE</Eyebrow>
          {insight.evidence.map((item) => (
            <span key={item.label}>{t(item.label)}</span>
          ))}
        </div>
      </article>
    </SiteShell>
  );
};

export const NewsItemPage = ({ slug }: { slug: string }) => {
  const { t, locale } = useI18n();
  const item = useNews().find((candidate) => candidate.slug === slug);
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
            <span>{`${item.readingTime} min read`}</span>
          </div>
        </header>
        {item.cover && (
          <figure className="article-cover">
            <img src={item.cover} alt={`${t(item.title)} ${t('新闻配图')}`} fetchPriority="high" decoding="async" />
          </figure>
        )}
        <div className="article-body">
          <MarkdownRenderer source={item.body} />
        </div>
        <div className="article-evidence article-source-note">
          <Eyebrow>{item.legacyPath ? 'LEGACY SOURCE' : 'SOURCE'}</Eyebrow>
          <span>{item.legacyPath ? t('原站公开内容') : t('Elexvx Research')}</span>
        </div>
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
