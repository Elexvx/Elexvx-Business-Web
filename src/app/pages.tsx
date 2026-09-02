'use client';

import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import {
  businessLines,
  capabilities,
  companyPrinciples,
  getDirection,
  getProject,
  getScenario,
  projects,
  researchDirections,
  scenarios,
} from '../data/site';
import {
  getBusinessHeroMedia,
  getScenarioHeroMedia,
  homeContent,
  pageContent,
  type PageHeroContent,
} from '../data/page-content';
import { useInsights, useNews, usePublishedInsights, usePublishedNews } from './content-context';
import type { BusinessLine, Insight, NewsItem, Project, ResearchDirection, Scenario } from '../content/types';
import {
  ActionButton,
  BusinessStrip,
  classNames,
  EvidenceList,
  Eyebrow,
  ResearchTile,
  SiteShell,
  TextLink,
  TechnicalFigure,
} from './components';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LocalizedText as T, useI18n } from './i18n';

const DirectionCard = ({ direction, index }: { direction: ResearchDirection; index: number }) => {
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
          <img src={direction.image} alt={t(direction.imageAlt ?? direction.title)} loading="lazy" decoding="async" />
        </div>
      )}
      <Eyebrow onDark={direction.accent === 'dark'}>{`RESEARCH ${String(index + 1).padStart(2, '0')}`}</Eyebrow>
      <h2>{t(direction.title)}</h2>
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

const ProjectCard = ({ project }: { project: Project }) => {
  const { t, href } = useI18n();
  return (
    <article className="project-card">
      {project.image && (
        <div className="project-card-media">
          <img
            src={project.image}
            alt={`${t(project.title)} abstract gradient visual`}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <Eyebrow>{`PROJECT / ${project.status.toUpperCase()}`}</Eyebrow>
      <h2>{t(project.title)}</h2>
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

const InsightRow = ({ insight }: { insight: Insight }) => {
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

type HomeMediaCardProps = {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  className?: string;
};

const HomeMediaCard = ({ image, imageAlt, eyebrow, title, description, href, className }: HomeMediaCardProps) => {
  const { t, href: localizedHref } = useI18n();
  const content = (
    <>
      <div className="home-media-card-media">
        <img src={image} alt={t(imageAlt)} loading="lazy" decoding="async" />
      </div>
      <div className="home-media-card-body">
        <h3>{t(title)}</h3>
        <Eyebrow>{eyebrow}</Eyebrow>
        <p>{t(description)}</p>
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

const HomeDirectionCard = ({ direction, index }: { direction: ResearchDirection; index: number }) => {
  const { t, href } = useI18n();
  return (
    <a className="home-direction-card" href={href(`/research/${direction.slug}`)}>
      <div className="home-media-card-media">
        <img
          src={direction.image ?? '/visuals/research-gradient.jpg'}
          alt={t(direction.imageAlt ?? direction.title)}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="home-media-card-body">
        <h3>{t(direction.title)}</h3>
        <Eyebrow>{`RESEARCH ${String(index + 1).padStart(2, '0')}`}</Eyebrow>
        <p>{t(direction.summary)}</p>
      </div>
    </a>
  );
};

const HomeInsightCard = ({ insight }: { insight: Insight }) => {
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

const formatNewsDate = (date: string, locale: 'zh-CN' | 'en') =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

const NewsCard = ({ item }: { item: NewsItem }) => {
  const { t, href, locale } = useI18n();
  const cover = item.cover ?? '/visuals/research-gradient.jpg';
  return (
    <a className="home-media-card home-news-card news-card" href={href(`/news/${item.slug}`)}>
      <div className="home-media-card-media">
        <img src={cover} alt={`${t(item.title)} ${t('新闻配图')}`} loading="lazy" decoding="async" />
      </div>
      <div className="home-media-card-body">
        <h3>{t(item.title)}</h3>
        <p className="home-news-card-meta">
          <span>{t(item.category)}</span>
          <span>{formatNewsDate(item.publishedAt, locale)}</span>
        </p>
        <p>{t(item.excerpt)}</p>
      </div>
    </a>
  );
};

const HomeLatestActivity = () => {
  const { t } = useI18n();
  const content = homeContent.latestActivity;

  if (!content.enabled) return null;

  return (
    <section className="home-latest-activity" aria-labelledby="latest-activity-title" data-enabled={content.enabled}>
      <div className="home-latest-activity-media">
        <img src={content.media.src} alt={t(content.media.alt)} loading="eager" fetchPriority="high" decoding="async" />
        <div className="home-latest-activity-scrim" aria-hidden="true" />
        <div className="home-latest-activity-copy">
          <div className="home-latest-activity-head">
            <Eyebrow onDark>{content.eyebrow}</Eyebrow>
            <span className="home-latest-activity-status">{t(content.status)}</span>
          </div>
          <h2 id="latest-activity-title">
            <T text={content.title} />
          </h2>
          <p>
            <T text={content.description} />
          </p>
          <TextLink href={content.action.href} onDark>
            {content.action.label}
          </TextLink>
        </div>
      </div>
    </section>
  );
};

const HomeWelcome = () => {
  const { hero } = homeContent;
  return (
    <section className="home-welcome">
      <div className="home-welcome-inner">
        <h1>
          <T text={hero.title} />
        </h1>
        <p className="home-welcome-description">
          <T text={hero.description} />
        </p>
        <HomeLatestActivity />
      </div>
    </section>
  );
};

const HomeDirectionsSection = () => {
  const content = homeContent.directions;
  return (
    <section
      className="home-content-section home-directions-section"
      id="research-directions"
      aria-labelledby="research-directions-title"
    >
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id="research-directions-title">
              <T text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>{content.action.label}</TextLink>
        </div>
        <div className="home-direction-grid">
          {researchDirections.map((direction, index) => (
            <HomeDirectionCard direction={direction} index={index} key={direction.slug} />
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePublicationsSection = ({ insights }: { insights: Insight[] }) => {
  const content = homeContent.publications;
  return (
    <section className="home-content-section" id="research-publications" aria-labelledby="research-publications-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id="research-publications-title">
              <T text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>{content.action.label}</TextLink>
        </div>
        <div className="home-media-grid home-insight-grid">
          {insights.map((insight) => (
            <HomeInsightCard insight={insight} key={insight.slug} />
          ))}
          <HomeMediaCard
            className="home-standard-card"
            image={content.standard.image.src}
            imageAlt={content.standard.image.alt}
            eyebrow={content.standard.eyebrow}
            title={content.standard.title}
            description={content.standard.description}
            href={content.standard.href}
          />
        </div>
      </div>
    </section>
  );
};

const HomeNewsSection = ({ news }: { news: NewsItem[] }) => {
  const content = homeContent.news;
  return (
    <section
      className="home-content-section home-content-section-alt home-news-section"
      id="news"
      aria-labelledby="news-title"
    >
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id="news-title">
              <T text={content.title} />
            </h2>
          </div>
          <TextLink href={content.action.href}>{content.action.label}</TextLink>
        </div>
        <div className="home-news-grid">
          {news.length
            ? news.map((item) => <NewsCard item={item} key={item.slug} />)
            : content.cards.map((card) => (
                <HomeMediaCard
                  className="home-news-card"
                  image={card.image.src}
                  imageAlt={card.image.alt}
                  eyebrow={card.eyebrow}
                  title={card.title}
                  description={card.description}
                  href={card.href}
                  key={card.eyebrow}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

const HomeCasesSection = () => {
  const content = homeContent.cases;
  return (
    <section className="home-content-section" id="cooperation-cases" aria-labelledby="cooperation-cases-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id="cooperation-cases-title">
              <T text={content.title} />
            </h2>
          </div>
          <span className="home-section-status">{content.status}</span>
        </div>
        <div className="home-media-grid home-two-card-grid">
          {content.cards.map((card) => (
            <HomeMediaCard
              image={card.image.src}
              imageAlt={card.image.alt}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              href={card.href}
              key={card.eyebrow}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const HomeProductsSection = () => {
  const { t, href } = useI18n();
  const content = homeContent.product;
  return (
    <section className="home-content-section home-products-section" id="products" aria-labelledby="products-title">
      <div className="home-content-inner">
        <div className="home-section-topline">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id="products-title">{t(content.title)}</h2>
          </div>
          <TextLink href={content.action.href}>{content.action.label}</TextLink>
        </div>
        <div className="home-product-feature">
          <a className="home-product-media" href={href(content.href)} aria-label={t(content.ariaLabel)}>
            <img src={content.media.src} alt={t(content.media.alt)} loading="lazy" decoding="async" />
            <span className="home-product-media-label">{content.mediaLabel}</span>
          </a>
          <div className="home-product-copy">
            <h3>{t(content.name)}</h3>
            <Eyebrow>{content.status}</Eyebrow>
            <p>{t(content.description)}</p>
            <TextLink href={content.href}>{content.detailLabel}</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
};

const HomeCompanyEntry = () => {
  const { t, href } = useI18n();
  const content = homeContent.closing;
  return (
    <section className="home-company-section" aria-labelledby="home-company-title">
      <div className="home-company-inner">
        <h2 id="home-company-title">{t(content.title)}</h2>
        <a className="home-company-cta" href={href(content.action.href)}>
          {t(content.action.label)}
        </a>
      </div>
    </section>
  );
};

export const HomePage = () => {
  const insights = usePublishedInsights().slice(0, 3);
  const news = usePublishedNews().slice(0, 6);
  return (
    <SiteShell activePath="/" navTone="dark" className="site-shell-home">
      <HomeWelcome />
      <HomeDirectionsSection />
      <HomePublicationsSection insights={insights} />
      <HomeNewsSection news={news} />
      <HomeCasesSection />
      <HomeProductsSection />
      <HomeCompanyEntry />
    </SiteShell>
  );
};

export const ResearchPage = () => (
  <SiteShell activePath="/research">
    <PageHero content={pageContent.research.hero} />
    <section className="research-tile research-tile-dark">
      <div className="section-heading section-heading-on-dark">
        <Eyebrow onDark>{pageContent.research.directions.eyebrow}</Eyebrow>
        <h2>
          <T text={pageContent.research.directions.title} />
        </h2>
        <p>
          <T text={pageContent.research.directions.description} />
        </p>
      </div>
      <div className="direction-grid">
        {researchDirections.map((direction, index) => (
          <DirectionCard direction={direction} index={index} key={direction.slug} />
        ))}
      </div>
    </section>
    <ResearchTile {...pageContent.research.closing}>
      <TechnicalFigure variant="boundary" label="Direction → method → outcome" />
      <div className="tile-actions">
        <ActionButton href="/capabilities" secondary>
          了解研发能力
        </ActionButton>
      </div>
    </ResearchTile>
  </SiteShell>
);

export const ResearchDirectionPage = ({ slug }: { slug: string }) => {
  const direction = getDirection(slug);
  if (!direction) return <NotFoundPage />;
  const directionProjects = projects.filter((project) => project.directionSlug === direction.slug);
  const directionInsights = usePublishedInsights().filter((insight) => insight.directionSlug === direction.slug);
  return (
    <SiteShell activePath="/research">
      <PageHero
        content={{
          eyebrow: direction.englishTitle,
          title: direction.question,
          description: direction.summary,
          primaryAction: pageContent.direction.primaryAction,
          secondaryAction: pageContent.direction.secondaryAction,
          media: {
            src: direction.image ?? pageContent.research.hero.media.src,
            alt: direction.imageAlt ?? pageContent.research.hero.media.alt,
          },
        }}
      />
      <ResearchTile
        tone={direction.accent}
        eyebrow={pageContent.direction.methods.eyebrow}
        title={pageContent.direction.methods.title}
        description={pageContent.direction.methods.description}
      >
        <div className="method-grid">
          {direction.methods.map((method, index) => (
            <div className="method-item" key={method}>
              <span>{`0${index + 1}`}</span>
              <strong>
                <T text={method} />
              </strong>
            </div>
          ))}
        </div>
      </ResearchTile>
      <section className="research-tile research-tile-parchment">
        <div className="section-heading">
          <Eyebrow>{pageContent.direction.outputs.eyebrow}</Eyebrow>
          <h2>
            <T text={pageContent.direction.outputs.title} />
          </h2>
        </div>
        {directionProjects.length ? (
          <div className={classNames('project-grid', directionProjects.length === 1 && 'project-grid-single')}>
            {directionProjects.map((project) => (
              <ProjectCard project={project} key={project.slug} />
            ))}
          </div>
        ) : (
          <EmptyState text={pageContent.direction.emptyOutputs} />
        )}
      </section>
      <section className="research-tile research-tile-light">
        <div className="section-heading">
          <Eyebrow>{pageContent.direction.insights.eyebrow}</Eyebrow>
          <h2>
            <T text={pageContent.direction.insights.title} />
          </h2>
        </div>
        {directionInsights.length ? (
          <InsightList insights={directionInsights} />
        ) : (
          <EmptyState text={pageContent.direction.emptyInsights} />
        )}
      </section>
    </SiteShell>
  );
};

export const CapabilitiesPage = () => (
  <SiteShell activePath="/capabilities">
    <PageHero content={pageContent.capabilities.hero} />
    <section className="research-tile research-tile-dark">
      <div className="section-heading section-heading-on-dark">
        <Eyebrow onDark>{pageContent.capabilities.loop.eyebrow}</Eyebrow>
        <h2>
          <T text={pageContent.capabilities.loop.title} />
        </h2>
      </div>
      <div className="process-list">
        {capabilities.map((capability) => (
          <div className="process-row process-row-on-dark" key={capability.index}>
            <span className="process-index">{capability.index}</span>
            <h2>
              <T text={capability.title} />
            </h2>
            <p>
              <T text={capability.summary} />
            </p>
          </div>
        ))}
      </div>
    </section>
    <ResearchTile
      tone={pageContent.capabilities.delivery.tone}
      eyebrow={pageContent.capabilities.delivery.eyebrow}
      title={pageContent.capabilities.delivery.title}
      description={pageContent.capabilities.delivery.description}
    >
      <div className="delivery-grid">
        {pageContent.capabilities.delivery.items.map((item) => (
          <div className="delivery-item" key={item.eyebrow}>
            <Eyebrow>{item.eyebrow}</Eyebrow>
            <h2>
              <T text={item.title} />
            </h2>
            <p>
              <T text={item.description} />
            </p>
          </div>
        ))}
      </div>
    </ResearchTile>
  </SiteShell>
);

export const ProjectsPage = () => (
  <SiteShell activePath="/projects">
    <PageHero content={pageContent.projects.hero} />
    <section className="research-tile research-tile-parchment">
      <div className="section-heading">
        <Eyebrow>{pageContent.projects.list.eyebrow}</Eyebrow>
        <h2>
          <T text={pageContent.projects.list.title} />
        </h2>
      </div>
      <div className={classNames('project-grid', projects.length === 1 && 'project-grid-single')}>
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>
    </section>
  </SiteShell>
);

export const ProjectPage = ({ slug }: { slug: string }) => {
  const project = getProject(slug);
  if (!project) return <NotFoundPage />;
  const direction = getDirection(project.directionSlug);
  const scenario = project.scenarioSlug ? getScenario(project.scenarioSlug) : undefined;
  return (
    <SiteShell activePath="/projects">
      <PageHero
        content={{
          eyebrow: project.englishTitle,
          title: project.title,
          description: project.output,
          primaryAction: pageContent.project.primaryAction,
          secondaryAction: pageContent.project.secondaryAction,
          media: {
            src: project.image ?? pageContent.projects.hero.media.src,
            alt: project.title,
          },
        }}
      />
      <ResearchTile {...pageContent.project.question} description={project.problem}>
        <TechnicalFigure variant="signal" label="Project system / evidence boundary" />
      </ResearchTile>
      <ResearchTile {...pageContent.project.approach} description={project.approach}>
        <EvidenceList
          items={[
            {
              label: pageContent.project.evidenceFacts.direction,
              value: direction?.title ?? pageContent.project.evidenceFacts.uncategorized,
            },
            {
              label: pageContent.project.evidenceFacts.scenario,
              value: scenario?.title ?? pageContent.project.evidenceFacts.pending,
            },
            {
              label: pageContent.project.evidenceFacts.stage,
              value: project.status === 'prototype' ? pageContent.project.evidenceFacts.prototype : project.status,
            },
            {
              label: pageContent.project.evidenceFacts.boundary,
              value: pageContent.project.evidenceFacts.boundaryValue,
            },
          ]}
        />
      </ResearchTile>
      <ResearchTile {...pageContent.project.evidence}>
        <div className="evidence-badges">
          {project.evidence.map((evidence) => (
            <span className="evidence-badge" key={evidence.label}>
              <CheckOutlined aria-hidden="true" />
              <span>
                <T text={evidence.label} />
              </span>
            </span>
          ))}
        </div>
      </ResearchTile>
    </SiteShell>
  );
};

export const ScenariosPage = () => (
  <SiteShell activePath="/scenarios">
    <PageHero content={pageContent.scenarios.hero} />
    <section className="research-tile research-tile-light">
      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <ScenarioCard scenario={scenario} key={scenario.slug} />
        ))}
      </div>
    </section>
  </SiteShell>
);

export const ScenarioPage = ({ slug }: { slug: string }) => {
  const scenario = getScenario(slug);
  if (!scenario) return <NotFoundPage />;
  const scenarioProjects = projects.filter((project) => project.scenarioSlug === scenario.slug);
  return (
    <SiteShell activePath="/scenarios">
      <PageHero
        content={{
          eyebrow: scenario.englishTitle,
          title: scenario.title,
          description: scenario.summary,
          primaryAction: pageContent.scenario.primaryAction,
          secondaryAction: pageContent.scenario.secondaryAction,
          media: getScenarioHeroMedia(scenario.slug),
        }}
      />
      <ResearchTile {...pageContent.scenario.question}>
        <TechnicalFigure variant="boundary" label="Scenario / context mapping" />
      </ResearchTile>
      <section className="research-tile research-tile-parchment">
        <div className="section-heading">
          <Eyebrow>{pageContent.scenario.projects.eyebrow}</Eyebrow>
          <h2>
            <T text={pageContent.scenario.projects.title} />
          </h2>
        </div>
        {scenarioProjects.length ? (
          <div className={classNames('project-grid', scenarioProjects.length === 1 && 'project-grid-single')}>
            {scenarioProjects.map((project) => (
              <ProjectCard project={project} key={project.slug} />
            ))}
          </div>
        ) : (
          <EmptyState text={pageContent.scenario.emptyProjects} />
        )}
      </section>
    </SiteShell>
  );
};

export const InsightsPage = () => {
  const insights = usePublishedInsights();
  return (
    <SiteShell activePath="/insights">
      <PageHero content={pageContent.insights.hero} />
      <section className="research-tile research-tile-light">
        <div className="section-heading">
          <Eyebrow>{pageContent.insights.list.eyebrow}</Eyebrow>
          <h2>
            <T text={pageContent.insights.list.title} />
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
            <T text={pageContent.news.list.title} />
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
          <h1>{t(insight.title)}</h1>
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
          <h1>{t(item.title)}</h1>
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

export const CompanyPage = () => (
  <SiteShell activePath="/company">
    <PageHero content={pageContent.company.hero} />
    <ResearchTile {...pageContent.company.principles}>
      <div className="principle-list">
        {companyPrinciples.map((principle, index) => (
          <div className="principle-row" key={principle}>
            <span>{`0${index + 1}`}</span>
            <strong>
              <T text={principle} />
            </strong>
          </div>
        ))}
      </div>
    </ResearchTile>
    <section className="research-tile research-tile-parchment">
      <BusinessStrip />
    </section>
  </SiteShell>
);

export const BusinessPage = () => (
  <SiteShell activePath="/company">
    <PageHero content={pageContent.business.hero} />
    <section className="research-tile research-tile-light">
      <div className="business-grid">
        {businessLines.map((line) => (
          <BusinessCard line={line} key={line.slug} />
        ))}
      </div>
    </section>
  </SiteShell>
);

export const BusinessLinePage = ({ slug }: { slug: string }) => {
  const line = businessLines.find((item) => item.slug === slug);
  if (!line) return <NotFoundPage />;
  return (
    <SiteShell activePath="/company">
      <PageHero
        content={{
          eyebrow: line.englishTitle,
          title: line.title,
          description: line.summary,
          primaryAction: pageContent.businessLine.primaryAction,
          secondaryAction: pageContent.businessLine.secondaryAction,
          media: getBusinessHeroMedia(line.slug),
        }}
      />
      <ResearchTile {...pageContent.businessLine.detail}>
        <EvidenceList items={[...pageContent.businessLine.facts]} />
      </ResearchTile>
    </SiteShell>
  );
};

export const TeamPage = () => (
  <SiteShell activePath="/company">
    <PageHero content={pageContent.team.hero} />
    <ResearchTile {...pageContent.team.organization}>
      <TechnicalFigure variant="network" label="Team / research collaboration" />
    </ResearchTile>
  </SiteShell>
);

export const CareersPage = () => (
  <SiteShell activePath="/company">
    <PageHero content={pageContent.careers.hero} />
    <ResearchTile {...pageContent.careers.positions}>
      <div className="empty-state empty-state-wide">
        <span>{pageContent.careers.call.status}</span>
        <strong>
          <T text={pageContent.careers.call.title} />
        </strong>
        <p>
          <T text={pageContent.careers.call.description} />
        </p>
      </div>
    </ResearchTile>
  </SiteShell>
);

export const ContactPage = () => (
  <SiteShell activePath="/contact">
    <PageHero content={pageContent.contact.hero} />
    <ResearchTile {...pageContent.contact.message}>
      <EvidenceList onDark items={[...pageContent.contact.prompts]} />
    </ResearchTile>
  </SiteShell>
);

export const BrandPage = () => {
  const { t } = useI18n();
  return (
    <SiteShell activePath="/company">
      <PageHero content={pageContent.brand.hero} />
      <ResearchTile {...pageContent.brand.wordmark}>
        <div className="brand-showcase">
          <img src="/brand/elexvx-logo-black.svg" alt={t('Elexvx 黑色标志')} />
          <img src="/brand/elexvx-logo-white.svg" alt={t('Elexvx 白色标志')} />
        </div>
      </ResearchTile>
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

export const PageHero = ({ content, className }: { content: PageHeroContent; className?: string }) => {
  const { t } = useI18n();
  return (
    <section className={classNames('page-hero', className)}>
      <div className="page-hero-inner">
        <div className="page-hero-copy">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h1>{t(content.title)}</h1>
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
          <img src={content.media.src} alt={t(content.media.alt)} fetchPriority="high" decoding="async" />
        </figure>
      </div>
    </section>
  );
};

const InsightList = ({ insights }: { insights: Insight[] }) => (
  <div className="insight-list">
    {insights.map((insight) => (
      <InsightRow insight={insight} key={insight.slug} />
    ))}
  </div>
);

const ScenarioCard = ({ scenario }: { scenario: Scenario }) => {
  const { t, href } = useI18n();
  return (
    <article className="scenario-card">
      <Eyebrow>SCENARIO</Eyebrow>
      <h2>{t(scenario.title)}</h2>
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

const BusinessCard = ({ line }: { line: BusinessLine }) => {
  const { t, href } = useI18n();
  return (
    <article className="business-card">
      <Eyebrow>COMPANY BUSINESS</Eyebrow>
      <h2>{t(line.title)}</h2>
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

const EmptyState = ({ text }: { text: string }) => (
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
        <T text={pageContent.notFound.title} />
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
