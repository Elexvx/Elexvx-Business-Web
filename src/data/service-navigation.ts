import config from './service-navigation.json';

export type LinkStatus = 'available' | 'maintenance' | 'unavailable' | 'beta' | 'deprecated';

export interface ServiceLink {
  id: string;
  name: string;
  url: string;
  description: string;
  icon?: string;
  tags: string[];
  status: LinkStatus;
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  links: ServiceLink[];
}

export interface ServiceCategory {
  id: string;
  category: string;
  links: ServiceLink[];
  subcategories: ServiceSubcategory[];
}

export interface SearchEngine {
  name: string;
  displayName: string;
  baseUrl: string;
  queryParam: string;
  icon?: string;
  placeholder?: string;
}

export interface ServiceNavigationConfig {
  site: {
    name: string;
    shortName: string;
    logo: string;
    url: string;
    description: string;
    language: string;
    locale: string;
    author: string;
    copyright: string;
    icp: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultImage: string;
    keywords: string[];
  };
  status: {
    url: string;
    title: string;
    description: string;
    historyDays: number;
    refreshIntervalSeconds: number;
    groups: Array<{ name: string; prefixes: string[] }>;
  };
  search: {
    defaultEngine: string;
    enabledEngines: string[];
    showEngineSelector: boolean;
    maxSuggestions: number;
    engines: SearchEngine[];
  };
  navigation: ServiceCategory[];
}

export const serviceNavigationConfig = config as ServiceNavigationConfig;
export const serviceNavigation = serviceNavigationConfig.navigation;

export const serviceNavigationLinks = serviceNavigation.flatMap((category) => [
  ...category.links,
  ...category.subcategories.flatMap((subcategory) => subcategory.links),
]);

export const enabledSearchEngines = serviceNavigationConfig.search.engines.filter((engine) =>
  serviceNavigationConfig.search.enabledEngines.includes(engine.name)
);
