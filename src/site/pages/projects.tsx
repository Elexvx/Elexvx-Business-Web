'use client';
import { Translated } from '../providers/i18n';
import { CheckOutlined } from '@ant-design/icons';

import { capabilities, getDirection, getProject, getScenario, projects, scenarios } from '../../data/site';
import { getScenarioHeroMedia, pageContent } from '../../data/page-content';

import { classNames, EvidenceList, Eyebrow, ResearchTile, SiteShell, TechnicalFigure } from '../components/index';

import { LocalizedText as T, LocalizedTitle as Title } from '../providers/i18n';
import { ProjectCard, PageHero, ScenarioCard, EmptyState, NotFoundPage } from './shared';

export const CapabilitiesPage = () => (
  <SiteShell activePath="/capabilities">
    <PageHero content={pageContent.capabilities.hero} />
    <section className="research-tile research-tile-dark">
      <div className="section-heading section-heading-on-dark">
        <Eyebrow onDark>
          <Translated>{pageContent.capabilities.loop.eyebrow}</Translated>
        </Eyebrow>
        <h2>
          <Title text={pageContent.capabilities.loop.title} />
        </h2>
      </div>
      <div className="process-list">
        {capabilities.map((capability) => (
          <div className="process-row process-row-on-dark" key={capability.index}>
            <span className="process-index">
              <Translated>{capability.index}</Translated>
            </span>
            <h2>
              <Title text={capability.title} />
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
            <Eyebrow>
              <Translated>{item.eyebrow}</Translated>
            </Eyebrow>
            <h2>
              <Title text={item.title} />
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
        <Eyebrow>
          <Translated>{pageContent.projects.list.eyebrow}</Translated>
        </Eyebrow>
        <h2>
          <Title text={pageContent.projects.list.title} />
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
          <Eyebrow>
            <Translated>{pageContent.scenario.projects.eyebrow}</Translated>
          </Eyebrow>
          <h2>
            <Title text={pageContent.scenario.projects.title} />
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
