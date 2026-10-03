'use client';
import { Translated } from '../providers/i18n';
import { useArticleCategoryFilter } from '../providers/category-filter';
import { articleCategories, newsCategorySlug } from '../../data/article-categories';

import { getDirection } from '../../data/site';
import { pageContent } from '../../data/page-content';
import { useInsights, useNews, usePublishedNews } from '../providers/content-context';

import { Eyebrow, ResearchTile, SiteShell } from '../components/index';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { LocalizedText as T, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { formatNewsDate, NewsCard, PageHero, NotFoundPage } from './shared';
import type { Insight, NewsItem } from '../../content/types';

export const NewsPage = ({ initialCategory = 'all' }: { initialCategory?: string }) => {
  const news = usePublishedNews();
  const { t } = useI18n();
  const categories = articleCategories('news', news);
  const [category, , categoryHref] = useArticleCategoryFilter('news', categories, initialCategory);
  const visible = news.filter((item) => category === 'all' || newsCategorySlug(item.category) === category);
  return (
    <SiteShell activePath="/news" className="site-shell-news">
      <section className="research-tile research-tile-light news-index-section" aria-labelledby="news-page-title">
        <div className="section-heading news-list-heading">
          <h1 id="news-page-title">
            {category !== 'all' && <>{t(categories.find((item) => item.id === category)?.label || '')} · </>}
            {t('最近新闻')}
          </h1>
        </div>
        <nav className="research-index-tabs news-category-tabs" aria-label={t('新闻分类')}>
          {[{ id: 'all', label: '全部' }, ...categories].map(({ id, label }) => (
            <a
              key={id}
              href={categoryHref(id)}
              className={`research-index-tab ${category === id ? 'research-index-tab-active' : ''}`}
              aria-current={category === id ? 'page' : undefined}
            >
              {t(label)}
            </a>
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

export const InsightPage = ({ insight }: { insight: Insight }) => {
  const { t, locale } = useI18n();
  const allInsights = useInsights();
  if (insight.status !== 'published') return <NotFoundPage />;
  const direction = insight.directionSlug ? getDirection(insight.directionSlug) : undefined;
  return (
    <SiteShell activePath="/insights">
      <article className="article-layout">
        <header className="article-header">
          <div className="article-kicker">
            <span>
              <Translated>{insight.publishedAt}</Translated>
            </span>
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
        <ArticleBody source={insight.body}>
          <ArticleMetadata author={insight.author} keywords={insight.keywords} keywordsEn={insight.keywordsEn} />
        </ArticleBody>
        <div className="article-evidence">
          <Eyebrow>EVIDENCE</Eyebrow>
          {insight.evidence.map((item) => (
            <span key={item.label}>{t(item.label)}</span>
          ))}
        </div>
        <ContinueReading items={allInsights} current={insight} base="/insights" indexHref="/research/" />
      </article>
    </SiteShell>
  );
};

export const NewsItemPage = ({ item }: { item: NewsItem }) => {
  const { t, locale } = useI18n();
  const allNews = useNews();
  if (item.status !== 'published') return <NotFoundPage />;
  return (
    <SiteShell activePath="/news">
      <article className="article-layout article-layout-news">
        <header className="article-header">
          <div className="article-kicker">
            <span>{formatNewsDate(item.publishedAt, locale)}</span>
            <Eyebrow>
              <Translated>{item.category}</Translated>
            </Eyebrow>
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
        <ArticleBody source={item.body}>
          <ArticleMetadata author={item.author} keywords={item.tags} keywordsEn={item.tags.map((tag) => t(tag))} />
        </ArticleBody>
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
        <span>
          <Translated>{pageContent.archive.status}</Translated>
        </span>
        <strong>
          <T text={pageContent.archive.state} />
        </strong>
      </div>
    </ResearchTile>
  </SiteShell>
);
