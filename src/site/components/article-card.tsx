'use client';

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

/** Pages supply content; variants own the card markup and presentation hooks. */
export function ArticleCard(props: ArticleCardProps) {
  const {
    title,
    cover,
    coverAlt = title,
    imageSizes,
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
  const inlineMeta = (
    <>
      {localizedCategory}
      {localizedCategory && date && ' · '}
      {date}
    </>
  );
  const cardClass = (layout: string) => ['article-card', layout, className].filter(Boolean).join(' ');
  const image = (options?: { className?: string; sizes?: string; width?: number; height?: number }) => (
    <SiteImage src={cover || fallbackCover} alt={coverAlt} sizes={imageSizes} {...options} />
  );

  switch (props.variant) {
    case 'editorial': {
      const meta = (
        <div className={props.showCover ? 'research-index-card-meta' : 'research-index-meta'}>
          {localizedCategory && <strong>{localizedCategory}</strong>}
          {date}
        </div>
      );
      const copy = (
        <div className="research-index-copy">
          <h2 className="article-card-title">{titleText}</h2>
          {summary}
          {props.showCover && meta}
        </div>
      );
      return (
        <a
          className={cardClass(props.showCover ? 'research-index-row research-index-row-media' : 'research-index-row')}
          href={href}
        >
          {props.showCover ? (
            <>
              {image({ className: 'research-index-media' })}
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
    case 'feature':
      return (
        <article className={cardClass('home-product-feature')}>
          <a className="home-product-media" href={href} aria-label={props.imageLinkLabel ?? t(title)}>
            {image({ width: 1600, height: 1600, sizes: '(max-width: 720px) 80vw, (max-width: 1024px) 45vw, 420px' })}
          </a>
          <div className="home-media-card-body home-product-copy">
            {props.imageLinkLabel ? (
              heading
            ) : (
              <h3 className="article-card-title">
                <a href={href}>{titleText}</a>
              </h3>
            )}
            {localizedCategory && <p className="eyebrow">{localizedCategory}</p>}
            {summary}
          </div>
        </article>
      );
    case 'highlight':
      return (
        <article className={cardClass('activity-highlight')}>
          <a href={href}>
            {image()}
            <div>
              {heading}
              <p className="article-card-meta">{inlineMeta}</p>
            </div>
          </a>
        </article>
      );
    case 'related':
      return (
        <a className={cardClass('article-card-related')} href={href}>
          {image()}
          {heading}
          <p className="article-card-meta">{inlineMeta}</p>
        </a>
      );
    case 'compact':
      return (
        <a className={cardClass('insight-list-item')} href={href}>
          <span className="insight-list-date">{date}</span>
          <span>
            <strong className="article-card-title">{titleText}</strong>
            {excerpt && <span className="article-card-excerpt insight-list-meta">{t(excerpt)}</span>}
          </span>
        </a>
      );
    default: {
      const news = variant === 'news';
      return (
        <a className={cardClass(news ? 'home-media-card home-news-card news-card' : 'home-media-card')} href={href}>
          <div className="home-media-card-media">
            {image(news ? { sizes: '(max-width: 640px) 120px, 180px' } : undefined)}
          </div>
          <div className="home-media-card-body">
            {heading}
            {(category || publishedAt) &&
              (news ? (
                <p className="article-card-meta home-news-card-meta">
                  {localizedCategory && <span>{localizedCategory}</span>}
                  {date}
                </p>
              ) : (
                <p className="article-card-meta eyebrow">{inlineMeta}</p>
              ))}
            {summary}
          </div>
        </a>
      );
    }
  }
}

export function NewsCard({ item, showExcerpt = true }: { item: NewsSummary; showExcerpt?: boolean }) {
  const { t } = useI18n();
  return (
    <ArticleCard
      variant="news"
      href={`/news/${item.slug}`}
      title={item.title}
      cover={item.cover}
      coverAlt={`${t(item.title)} ${t('新闻配图')}`}
      category={item.category}
      publishedAt={item.publishedAt}
      excerpt={showExcerpt ? item.excerpt : undefined}
    />
  );
}
