'use client';
import { Fragment } from 'react';
import { LocalizedText as T, LocalizedTitle as Title, Translated, useI18n } from '../providers/i18n';
import { useArticleCategoryFilter } from '../providers/category-filter';
import { articleCategories } from '../../data/article-categories';
import { newsInCategory, newsPageCount, newsPageHref, newsPageSize } from '../../data/news-pagination';

import { getDirection } from '../../data/site';
import { pageContent } from '../../data/page-content';
import { useInsights, useNews, usePublishedNews } from '../providers/content-context';

import { Eyebrow, ResearchTile, SiteShell } from '../components/index';
import { IndexHeading } from '../components/index-heading';
import { ArticleBody, ArticleMetadata, ContinueReading } from '../components/article-reading';
import { PageHero, NotFoundPage } from './shared';
import { formatArticleDate, NewsCard } from '../components/article-card';
import type { Insight, NewsItem } from '../../content/types';

const NewsPagination = ({ category, page, totalPages }: { category: string; page: number; totalPages: number }) => {
  const { href, locale, t } = useI18n();
  if (totalPages < 2) return null;

  const linkTo = (number: number) => href(newsPageHref(category, number));
  const pageNumbers =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [...new Set([1, page - 1, page, page + 1, totalPages])]
          .filter((number) => number >= 1 && number <= totalPages)
          .sort((a, b) => a - b);

  return (
    <nav className="news-pagination" aria-label={t('新闻分页')}>
      {page > 1 ? (
        <a href={linkTo(page - 1)} rel="prev">
          {t('上一页')}
        </a>
      ) : (
        <span aria-disabled="true">{t('上一页')}</span>
      )}
      {pageNumbers.map((number, index) => {
        const label = locale === 'en' ? `Page ${number}` : `第 ${number} 页`;
        return (
          <Fragment key={number}>
            {index > 0 && number - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
            {number === page ? (
              <span aria-current="page" aria-label={label}>
                {number}
              </span>
            ) : (
              <a href={linkTo(number)} aria-label={label}>
                {number}
              </a>
            )}
          </Fragment>
        );
      })}
      {page < totalPages ? (
        <a href={linkTo(page + 1)} rel="next">
          {t('下一页')}
        </a>
      ) : (
        <span aria-disabled="true">{t('下一页')}</span>
      )}
    </nav>
  );
};

export const NewsPage = ({ initialCategory = 'all', page = 1 }: { initialCategory?: string; page?: number }) => {
  const news = usePublishedNews();
  const { t } = useI18n();
  const categories = articleCategories('news', news);
  const [category, , categoryHref] = useArticleCategoryFilter('news', categories, initialCategory);
  const matching = newsInCategory(news, category);
  const visible = matching.slice((page - 1) * newsPageSize, page * newsPageSize);
  return (
    <SiteShell activePath="/news" className="site-shell-news">
      <section className="research-tile research-tile-light news-index-section" aria-labelledby="news-page-title">
        <IndexHeading
          id="news-page-title"
          title={t('最近新闻')}
          category={t(categories.find((item) => item.id === category)?.label || '')}
        />
        <nav className="research-index-tabs index-category-tabs" aria-label={t('新闻分类')}>
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
          {visible.map((item, index) => (
            <NewsCard item={item} key={item.slug} priority={index === 0} />
          ))}
        </div>
        <NewsPagination category={category} page={page} totalPages={newsPageCount(matching.length)} />
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
            <span>{formatArticleDate(item.publishedAt, locale)}</span>
            <Eyebrow>
              <Translated>{item.category}</Translated>
            </Eyebrow>
          </div>
          <h1>{t(item.title)}</h1>
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
