export type EvidenceKind = 'official' | 'internal' | 'asset';

export type EvidenceRef = {
  label: string;
  kind: EvidenceKind;
  url?: string;
  verified: boolean;
};

export type ResearchDirection = {
  slug: string;
  title: string;
  englishTitle: string;
  question: string;
  summary: string;
  methods: string[];
  outputSlugs: string[];
  accent: 'light' | 'dark' | 'parchment';
  image?: string;
  imageAlt?: string;
};

export type ProjectStatus = 'exploration' | 'prototype' | 'deployed' | 'archived';

export type Project = {
  slug: string;
  title: string;
  englishTitle: string;
  directionSlug: string;
  scenarioSlug?: string;
  problem: string;
  approach: string;
  output: string;
  status: ProjectStatus;
  evidence: EvidenceRef[];
  image?: string;
  featured?: boolean;
};

export type InsightStatus = 'draft' | 'published' | 'archived';

export type InsightFrontmatter = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  directionSlug?: string;
  author: string;
  keywords?: string[];
  keywordsEn?: string[];
  status: InsightStatus;
  evidence: EvidenceRef[];
  cover?: string;
};

export type Insight = InsightFrontmatter & {
  body: string;
  readingTime: number;
};

export type NewsStatus = 'draft' | 'published' | 'archived';

export type NewsFrontmatter = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
  status: NewsStatus;
  cover?: string;
  legacyPath?: string;
  sourceUrl?: string;
};

export type NewsItem = NewsFrontmatter & {
  body: string;
  readingTime: number;
};

export type Scenario = {
  slug: string;
  title: string;
  englishTitle: string;
  summary: string;
  projectSlugs: string[];
};

export type Capability = {
  index: string;
  title: string;
  englishTitle: string;
  summary: string;
};

export type BusinessLine = {
  slug: string;
  title: string;
  englishTitle: string;
  summary: string;
  href: string;
};
