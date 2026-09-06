import catalog from '../../content/site/catalog.json';
import type { BusinessLine, Capability, Project, ResearchDirection, Scenario } from '../content/types';

type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

type SiteCatalog = {
  identity: {
    companyName: string;
    researchName: string;
    researchNameNote: string;
    description: string;
    canonicalOrigin: string;
    registrations?: {
      icp: { number: string; url: string };
      publicSecurity: { number: string; url: string };
    };
  };
  researchDirections: ResearchDirection[];
  retiredResearchDirectionSlugs?: string[];
  capabilities: Capability[];
  projects: Project[];
  scenarios: Scenario[];
  businessLines: BusinessLine[];
  companyPrinciples: string[];
  footerColumns: FooterColumn[];
};

const siteCatalog = catalog as SiteCatalog;

const assertUniqueSlugs = (label: string, items: Array<{ slug: string }>) => {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.slug || seen.has(item.slug))
      throw new Error(`${label} contains an invalid or duplicate slug: ${item.slug}`);
    seen.add(item.slug);
  }
};

export const validateSiteCatalog = () => {
  assertUniqueSlugs('researchDirections', siteCatalog.researchDirections);
  assertUniqueSlugs('projects', siteCatalog.projects);
  assertUniqueSlugs('scenarios', siteCatalog.scenarios);
  assertUniqueSlugs('businessLines', siteCatalog.businessLines);

  const directions = new Set([
    ...siteCatalog.researchDirections.map((item) => item.slug),
    ...(siteCatalog.retiredResearchDirectionSlugs ?? []),
  ]);
  const scenarios = new Set(siteCatalog.scenarios.map((item) => item.slug));
  for (const project of siteCatalog.projects) {
    if (!directions.has(project.directionSlug)) {
      throw new Error(`Project ${project.slug} references unknown direction ${project.directionSlug}`);
    }
    if (project.scenarioSlug && !scenarios.has(project.scenarioSlug)) {
      throw new Error(`Project ${project.slug} references unknown scenario ${project.scenarioSlug}`);
    }
  }

  return true;
};

validateSiteCatalog();

export const siteIdentity = siteCatalog.identity;
export const researchDirections = siteCatalog.researchDirections;
export const capabilities = siteCatalog.capabilities;
export const projects = siteCatalog.projects;
export const scenarios = siteCatalog.scenarios;
export const businessLines = siteCatalog.businessLines;
export const companyPrinciples = siteCatalog.companyPrinciples;
export const footerColumns = siteCatalog.footerColumns.map((column) => ({
  ...column,
  links:
    column.title === 'Research'
      ? [
          ...column.links.filter((link) => !link.href.startsWith('/research/')),
          ...researchDirections.map((direction) => ({ label: direction.title, href: `/research/${direction.slug}` })),
        ]
      : column.links,
}));

export const getDirection = (slug: string) => researchDirections.find((direction) => direction.slug === slug);
export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
export const getScenario = (slug: string) => scenarios.find((scenario) => scenario.slug === slug);
