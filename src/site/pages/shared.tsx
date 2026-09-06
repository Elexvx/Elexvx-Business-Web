'use client';

import { SiteImage } from '../components/site-image';
import { ArrowRightOutlined } from '@ant-design/icons';

import { getDirection } from '../../data/site';
import { pageContent, type PageHeroContent } from '../../data/page-content';

import type { BusinessLine, Insight, NewsItem, Project, ResearchDirection, Scenario } from '../../content/types';
import { ActionButton, classNames, Eyebrow, SiteShell } from '../components/index';

import { LocalizedText as T, LocalizedTitle as Title, useI18n } from '../providers/i18n';

export const DirectionCard = ({ direction, index }: { direction: ResearchDirection; index: number }) => {
  const { t, href } = useI18n();
  return (
    <article
      className={classNames(
        'direction-card',
        direction.accent === 'dark' && 'direction-card-dark',
        direction.accent === 'parchment' && 'direction-card-parchment'
      )}
    >
      {direction.image && (
        <div className="direction-card-media">
          <SiteImage src={direction.image} alt={t(direction.imageAlt ?? direction.title)} loading="lazy" decoding="async" />
        </div>
      )}
      <Eyebrow onDark={direction.accent === 'dark'}>{`RESEARCH ${String(index + 1).padStart(2, '0')}`}</Eyebrow>
      <h2>
        <Title text={direction.title} />
      </h2>
      <p className="card-english">{direction.englishTitle}</p>
      <p>{t(direction.summary)}</p>
      <div className="card-footer">
        <span className="card-index">{`${direction.methods.length} METHODS`}</span>
        <a className="card-link" href={href(`/research/${direction.slug}`)}>
          {t('进入方向')} <ArrowRightOutlined aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

export const ProjectCard = ({ project }: { project: Project }) => {
  const { t, href } = useI18n();
  return (
    <article className="project-card">
      {project.image && (
        <div className="project-card-media">
          <SiteImage
            src={project.image}
            alt={`${t(project.title)} abstract gradient visual`}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <Eyebrow>{`PROJECT / ${project.status.toUpperCase()}`}</Eyebrow>
      <h2>
        <Title text={project.title} />
      </h2>
      <p className="card-english">{project.englishTitle}</p>
      <p>{t(project.output)}</p>
      <div className="project-card-details">
        <div>
          <span className="project-card-detail-label">THE QUESTION</span>
          <p>{t(project.problem)}</p>
        </div>
        <div>
          <span className="project-card-detail-label">THE APPROACH</span>
          <p>{t(project.approach)}</p>
        </div>
      </div>
      <div className="card-footer">
        <span className="card-index">{`${project.evidence.length} EVIDENCE`}</span>
        <a className="card-link" href={href(`/projects/${project.slug}`)}>
          {t('阅读项目')} <ArrowRightOutlined aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

export const InsightRow = ({ insight }: { insight: Insight }) => {
  const { t, href } = useI18n();
  return (
    <a className="insight-list-item" href={href(`/insights/${insight.slug}`)}>
      <span className="insight-list-date">{insight.publishedAt}</span>
      <span>
        <strong>{t(insight.title)}</strong>
        <span className="insight-list-meta">{t(insight.excerpt)}</span>
      </span>
      <ArrowRightOutlined className="insight-list-arrow" aria-hidden="true" />
    </a>
  );
};

export type HomeMediaCardProps = {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description?: string;
  naturalTitle?: boolean;
  href?: string;
  className?: string;
};

export const HomeMediaCard = ({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  naturalTitle = false,
  href,
  className,
}: HomeMediaCardProps) => {
  const { t, href: localizedHref } = useI18n();
  const content = (
    <>
      <div className="home-media-card-media">
        <SiteImage src={image} alt={t(imageAlt)} loading="lazy" decoding="async" />
      </div>
      <div className="home-media-card-body">
        <h3>
          {naturalTitle ? t(title) : <Title text={title} />}
        </h3>
        <Eyebrow>{eyebrow}</Eyebrow>
        {description && <p>{t(description)}</p>}
      </div>
    </>
  );

  return href ? (
    <a className={classNames('home-media-card', className)} href={localizedHref(href)}>
      {content}
    </a>
  ) : (
    <article className={classNames('home-media-card', className)}>{content}</article>
  );
};

export const HomeDirectionCard = ({ direction, index }: { direction: ResearchDirection; index: number }) => {
  const { t, href } = useI18n();
  return (
    <a className="home-direction-card" href={href(`/research/${direction.slug}`)}>
      <div className="home-media-card-media">
        <SiteImage
          src={direction.image ?? '/visuals/research-gradient.jpg'}
          alt={t(direction.imageAlt ?? direction.title)}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="home-media-card-body">
        <h3>
          <Title text={direction.title} />
        </h3>
        <Eyebrow>{`RESEARCH ${String(index + 1).padStart(2, '0')}`}</Eyebrow>
        <p>{t(direction.summary)}</p>
      </div>
    </a>
  );
};

export const HomeInsightCard = ({ insight }: { insight: Insight }) => {
  const direction = insight.directionSlug ? getDirection(insight.directionSlug) : undefined;
  const { t } = useI18n();
  return (
    <HomeMediaCard
      className="home-insight-card"
      image={insight.cover ?? direction?.image ?? '/visuals/research-gradient.jpg'}
      imageAlt={`${t(insight.title)} ${t('文章配图')}`}
      eyebrow={`${direction?.englishTitle ?? 'ELEXVX RESEARCH'} / ${insight.publishedAt}`}
      title={insight.title}
      description={insight.excerpt}
      href={`/insights/${insight.slug}`}
    />
  );
};

export const formatNewsDate = (date: string, locale: 'zh-CN' | 'en') =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

export const NewsCard = ({ item, showExcerpt = true }: { item: NewsItem; showExcerpt?: boolean }) => {
  const { t, href, locale } = useI18n();
  const cover = item.cover ?? '/visuals/research-gradient.jpg';
  return (
    <a className="home-media-card home-news-card news-card" href={href(`/news/${item.slug}`)}>
      <div className="home-media-card-media">
        <SiteImage src={cover} alt={`${t(item.title)} ${t('新闻配图')}`} loading="lazy" decoding="async" />
      </div>
      <div className="home-media-card-body">
        <h3>
          <Title text={item.title} />
        </h3>
        <p className="home-news-card-meta">
          <span>{t(item.category)}</span>
          <span>{formatNewsDate(item.publishedAt, locale)}</span>
        </p>
        {showExcerpt && <p>{t(item.excerpt)}</p>}
      </div>
    </a>
  );
};

export const HomeEmptyContent = () => {
  const { locale } = useI18n();
  return (
    <div className="home-activity-placeholder home-empty-content" role="status">
      <div className="home-activity-placeholder-diagram" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{locale === 'en' ? 'No published content yet' : '暂无已发布内容'}</p>
    </div>
  );
};

export const PageHero = ({ content, className }: { content: PageHeroContent; className?: string }) => {
  const { t } = useI18n();
  return (
    <section className={classNames('page-hero', className)}>
      <div className="page-hero-inner">
        <div className="page-hero-copy">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h1>
            <Title text={content.title} />
          </h1>
          <p>{t(content.description)}</p>
          <div className="page-hero-actions">
            <ActionButton href={content.primaryAction.href}>{content.primaryAction.label}</ActionButton>
            {content.secondaryAction ? (
              <ActionButton href={content.secondaryAction.href} secondary>
                {content.secondaryAction.label}
              </ActionButton>
            ) : null}
          </div>
        </div>
        <figure className="page-hero-media">
          <SiteImage src={content.media.src} alt={t(content.media.alt)} fetchPriority="high" decoding="async" />
        </figure>
      </div>
    </section>
  );
};

export const InsightList = ({ insights }: { insights: Insight[] }) => (
  <div className="insight-list">
    {insights.map((insight) => (
      <InsightRow insight={insight} key={insight.slug} />
    ))}
  </div>
);

export const ScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const { t, href } = useI18n();
  return (
    <article className="scenario-card">
      <Eyebrow>SCENARIO</Eyebrow>
      <h2>
        <Title text={scenario.title} />
      </h2>
      <p className="card-english">{scenario.englishTitle}</p>
      <p>{t(scenario.summary)}</p>
      <div className="card-footer">
        <span className="card-index">{`${scenario.projectSlugs.length} PROJECTS`}</span>
        <a className="card-link" href={href(`/scenarios/${scenario.slug}`)}>
          {t('查看场景')} <ArrowRightOutlined aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

export const BusinessCard = ({ line }: { line: BusinessLine }) => {
  const { t, href } = useI18n();
  return (
    <article className="business-card">
      <Eyebrow>COMPANY BUSINESS</Eyebrow>
      <h2>
        <Title text={line.title} />
      </h2>
      <p className="card-english">{line.englishTitle}</p>
      <p>{t(line.summary)}</p>
      <div className="card-footer">
        <span className="card-index">PARALLEL LINE</span>
        <a className="card-link" href={href(line.href)}>
          {t('进入业务')} <ArrowRightOutlined aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

export const EmptyState = ({ text }: { text: string }) => (
  <div className="empty-state">
    <span>CONTENT IN PROGRESS</span>
    <strong>
      <T text={text} />
    </strong>
  </div>
);

export const NotFoundPage = () => (
  <SiteShell>
    <section className="not-found">
      <Eyebrow>{pageContent.notFound.eyebrow}</Eyebrow>
      <h1>
        <Title text={pageContent.notFound.title} />
      </h1>
      <p>
        <T text={pageContent.notFound.description} />
      </p>
      <div className="page-hero-actions">
        <ActionButton href={pageContent.notFound.action.href}>{pageContent.notFound.action.label}</ActionButton>
      </div>
    </section>
  </SiteShell>
);
