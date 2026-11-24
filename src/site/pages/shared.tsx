'use client';
import { CompanyIntro } from '../components/company-intro';

import { ErrorPage } from '../components/error-page';
import { SiteImage } from '../components/site-image';

import { ArticleCard } from '../components/article-card';
import { isDisabledPath } from '../../data/disabled-sections';
import { type PageHeroContent } from '../../data/page-content';

import type { BusinessLine, InsightSummary, Project, Scenario } from '../../content/types';
import { ActionButton, classNames, Eyebrow } from '../components/index';

import { LocalizedText as T, LocalizedTitle as Title, Translated, useI18n } from '../providers/i18n';

export const ProjectCard = ({ project }: { project: Project }) => {
  const { t, href } = useI18n();
  return (
    <article className="project-card">
      {project.image && (
        <div className="project-card-media">
          <SiteImage
            src={project.image}
            alt={`${t(project.title)} abstract gradient visual`}
            sizes="(max-width: 720px) calc(100vw - 40px), 640px"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <Eyebrow>
        <Translated>{`PROJECT / ${project.status.toUpperCase()}`}</Translated>
      </Eyebrow>
      <h2>
        <Title text={project.title} />
      </h2>
      <p className="card-english">
        <Translated>{project.englishTitle}</Translated>
      </p>
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
        <span className="card-index">
          <Translated>{`${project.evidence.length} EVIDENCE`}</Translated>
        </span>
        {!isDisabledPath(`/projects/${project.slug}`) && (
          <a className="card-link" href={href(`/projects/${project.slug}`)}>
            {t('阅读项目')}
          </a>
        )}
      </div>
    </article>
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
        <CompanyIntro
          eyebrow={content.eyebrow}
          title={<Title text={content.title} />}
          description={t(content.description)}
        >
          <div className="page-hero-actions">
            <ActionButton href={content.primaryAction.href}>
              <Translated>{content.primaryAction.label}</Translated>
            </ActionButton>
            {content.secondaryAction ? (
              <ActionButton href={content.secondaryAction.href} secondary>
                <Translated>{content.secondaryAction.label}</Translated>
              </ActionButton>
            ) : null}
          </div>
        </CompanyIntro>
      </div>
    </section>
  );
};

export const InsightList = ({ insights }: { insights: InsightSummary[] }) => (
  <div className="insight-list">
    {insights.map((insight) => (
      <ArticleCard
        key={insight.slug}
        variant="compact"
        href={`/insights/${insight.slug}`}
        title={insight.title}
        publishedAt={insight.publishedAt}
        excerpt={insight.excerpt}
      />
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
      <p className="card-english">
        <Translated>{scenario.englishTitle}</Translated>
      </p>
      <p>{t(scenario.summary)}</p>
      <div className="card-footer">
        <span className="card-index">
          <Translated>{`${scenario.projectSlugs.length} PROJECTS`}</Translated>
        </span>
        <a className="card-link" href={href(`/scenarios/${scenario.slug}`)}>
          {t('查看场景')}
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
      <p className="card-english">
        <Translated>{line.englishTitle}</Translated>
      </p>
      <p>{t(line.summary)}</p>
      <div className="card-footer">
        <span className="card-index">PARALLEL LINE</span>
        <a className="card-link" href={href(line.href)}>
          {t('进入业务')}
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

export const NotFoundPage = () => <ErrorPage code={404} />;
