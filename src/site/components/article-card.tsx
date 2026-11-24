'use client';

import type { ReactNode } from 'react';
import type { NewsSummary } from '../../content/types';
import { LocalizedTitle, useI18n, type Locale } from '../providers/i18n';
import { SiteImage } from './site-image';

const fallbackCover = '/visuals/research-gradient.jpg';

export const formatArticleDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: locale === 'en' ? 'long' : 'numeric',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

type ArticleCardProps = {
  href: string;
  title: string;
  cover?: string;
  coverAlt?: string;
  imageSizes?: string;
  imagePriority?: 'high' | 'auto';
  category?: string;
  publishedAt?: string;
  excerpt?: string;
  splitTitle?: boolean;
  className?: string;
} & (
  | { variant?: 'grid' | 'news' | 'highlight' | 'related' | 'compact' }
  | { variant: 'editorial'; showCover?: boolean }
  | { variant: 'feature'; imageLinkLabel?: string }
);

type CardViewModel = {
  href: string;
  rawTitle: string;
  titleText: ReactNode;
  heading: ReactNode;
  summary: ReactNode;
  localizedCategory: string;
  date: ReactNode;
  inlineMeta: ReactNode;
  cardClass: (layout: string) => string;
  renderImage: (options?: { className?: string; sizes?: string; width?: number; height?: number }) => ReactNode;
};

function EditorialArticleCard({
  view,
  showCover,
  imageSizes,
}: {
  view: CardViewModel;
  showCover?: boolean;
  imageSizes?: string;
}) {
  const meta = (
    <div className={showCover ? 'research-index-card-meta' : 'research-index-meta'}>
      {view.localizedCategory && <strong>{view.localizedCategory}</strong>}
      {view.date}
    </div>
  );
  const copy = (
    <div className="research-index-copy">
      <h2 className="article-card-title">{view.titleText}</h2>
      {view.summary}
      {showCover && meta}
    </div>
  );

  return (
    <a
      className={view.cardClass(showCover ? 'research-index-row research-index-row-media' : 'research-index-row')}
      href={view.href}
    >
      {showCover ? (
        <>
          {view.renderImage({
            className: 'research-index-media',
            sizes: imageSizes ?? '(max-width: 720px) calc(100vw - 40px), 320px',
          })}
          {copy}
        </>
      ) : (
        <>
          {meta}
          <div className="research-index-entry">{copy}</div>
        </>
      )}
    </a>
  );
}

function FeatureArticleCard({
  view,
  imageLinkLabel,
  localizedTitle,
}: {
  view: CardViewModel;
  imageLinkLabel?: string;
  localizedTitle: string;
}) {
  return (
    <article className={view.cardClass('home-product-feature')}>
      <a className="home-product-media" href={view.href} aria-label={imageLinkLabel ?? localizedTitle}>
        {view.renderImage({
          width: 1600,
          height: 1600,
          sizes: '(max-width: 720px) 80vw, (max-width: 1024px) 45vw, 420px',
        })}
      </a>
      <div className="home-media-card-body home-product-copy">
        {imageLinkLabel ? (
          view.heading
        ) : (
          <h3 className="article-card-title">
            <a href={view.href}>{view.titleText}</a>
          </h3>
        )}
        {view.localizedCategory && <p className="eyebrow">{view.localizedCategory}</p>}
        {view.summary}
      </div>
    </article>
  );
}

function DefaultArticleCard({
  view,
  isNews,
  imageSizes,
  hasMeta,
}: {
  view: CardViewModel;
  isNews: boolean;
  imageSizes?: string;
  hasMeta: boolean;
}) {
  const defaultSizes = isNews
    ? '(max-width: 640px) 112px, 178px'
    : '(max-width: 720px) calc(100vw - 40px), (max-width: 1068px) 46vw, 440px';

  return (
    <a
      className={view.cardClass(isNews ? 'home-media-card home-news-card news-card' : 'home-media-card')}
      href={view.href}
    >
      <div className="home-media-card-media">{view.renderImage({ sizes: imageSizes ?? defaultSizes })}</div>
      <div className="home-media-card-body">
        {view.heading}
        {hasMeta &&
          (isNews ? (
            <p className="article-card-meta home-news-card-meta">
              {view.localizedCategory && <span>{view.localizedCategory}</span>}
              {view.date}
            </p>
          ) : (
            <p className="article-card-meta eyebrow">{view.inlineMeta}</p>
          ))}
        {view.summary}
      </div>
    </a>
  );
}

/** Pages supply content; variants own the card markup and presentation hooks. */
export function ArticleCard(props: ArticleCardProps) {
  const {
    title,
    cover,
    coverAlt = title,
    imageSizes,
    imagePriority,
    category,
    publishedAt,
    excerpt,
    splitTitle,
    className,
    variant = 'grid',
  } = props;
  const { href: localizeHref, t, locale } = useI18n();
  const href = localizeHref(props.href);
  const titleText = splitTitle ? <LocalizedTitle text={title} /> : t(title);
  const heading = <h3 className="article-card-title">{titleText}</h3>;
  const summary = excerpt ? <p className="article-card-excerpt">{t(excerpt)}</p> : null;
  const localizedCategory = category ? t(category) : '';
  const date = publishedAt && (
    <time dateTime={publishedAt}>
      {variant === 'news' || variant === 'editorial' ? formatArticleDate(publishedAt, locale) : publishedAt}
    </time>
  );
  const view: CardViewModel = {
    href,
    rawTitle: title,
    titleText,
    heading,
    summary,
    localizedCategory,
    date,
    inlineMeta: (
      <>
        {localizedCategory}
        {localizedCategory && date && ' · '}
        {date}
      </>
    ),
    cardClass: (layout) => ['article-card', layout, className].filter(Boolean).join(' '),
    renderImage: (options) => (
      <SiteImage
        src={cover || fallbackCover}
        alt={coverAlt}
        sizes={imageSizes}
        fetchPriority={imagePriority === 'high' ? 'high' : undefined}
        {...options}
      />
    ),
  };

  if (props.variant === 'editorial') {
    return <EditorialArticleCard view={view} showCover={props.showCover} imageSizes={imageSizes} />;
  }
  if (props.variant === 'feature') {
    return <FeatureArticleCard view={view} imageLinkLabel={props.imageLinkLabel} localizedTitle={t(title)} />;
  }
  if (props.variant === 'highlight') {
    return (
      <article className={view.cardClass('activity-highlight')}>
        <a href={href}>
          {view.renderImage()}
          <div>
            {heading}
            <p className="article-card-meta">{view.inlineMeta}</p>
          </div>
        </a>
      </article>
    );
  }
  if (props.variant === 'related') {
    return (
      <a className={view.cardClass('article-card-related')} href={href}>
        {view.renderImage({ sizes: imageSizes ?? '(max-width: 720px) calc(100vw - 40px), 440px' })}
        {heading}
        <p className="article-card-meta">{view.inlineMeta}</p>
      </a>
    );
  }
  if (props.variant === 'compact') {
    return (
      <a className={view.cardClass('insight-list-item')} href={href}>
        <span className="insight-list-date">{date}</span>
        <span>
          <strong className="article-card-title">{titleText}</strong>
          {excerpt && <span className="article-card-excerpt insight-list-meta">{t(excerpt)}</span>}
        </span>
      </a>
    );
  }
  return (
    <DefaultArticleCard
      view={view}
      isNews={variant === 'news'}
      imageSizes={imageSizes}
      hasMeta={Boolean(category || publishedAt)}
    />
  );
}

export function NewsCard({
  item,
  showExcerpt = true,
  priority = false,
}: {
  item: NewsSummary;
  showExcerpt?: boolean;
  priority?: boolean;
}) {
  const { t } = useI18n();
  return (
    <ArticleCard
      variant="news"
      href={`/news/${item.slug}`}
      title={item.title}
      cover={item.cover}
      coverAlt={`${t(item.title)} ${t('新闻配图')}`}
      imagePriority={priority ? 'high' : undefined}
      category={item.category}
      publishedAt={item.publishedAt}
      excerpt={showExcerpt ? item.excerpt : undefined}
    />
  );
}
