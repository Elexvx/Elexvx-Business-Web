export type DocumentationLocale = 'zh-CN' | 'en';

export type DocumentationSection = 'quick-start' | 'architecture' | 'deployment';

export type DocumentationPage = {
  locale: DocumentationLocale;
  slug: string[];
  title: string;
  description: string;
  tags: string[];
  section?: DocumentationSection;
  body: string;
};

export const documentationSections: DocumentationSection[] = ['quick-start', 'architecture', 'deployment'];

export const documentationSectionLabels: Record<DocumentationLocale, Record<DocumentationSection, string>> = {
  'zh-CN': {
    'quick-start': '快速开始',
    architecture: '架构设计',
    deployment: '部署运维',
  },
  en: {
    'quick-start': 'Quick start',
    architecture: 'Architecture',
    deployment: 'Deployment & operations',
  },
};

export const documentationPath = (locale: DocumentationLocale, slug: string[] = []) => {
  const base = locale === 'en' ? '/en/services/docs' : '/services/docs';
  return slug.length ? `${base}/${slug.join('/')}` : base;
};

export const documentationSource = (page: DocumentationPage) => {
  const prefix = page.locale === 'en' ? '/en/services/docs' : '/services/docs';
  return page.body.replace(
    /\]\(\/(?:zh|en)\/docs(?:\/([^)#]+))?\)/g,
    (_match, slug: string | undefined) => `](${slug ? `${prefix}/${slug}` : prefix})`
  );
};
