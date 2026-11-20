import React from 'react';
import { writeFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { toInsightSummary, toNewsSummary } from '../src/content/summaries';
import {
  HomeCasesSection,
  HomeCompanyEntry,
  HomeNewsSection,
  HomeProductsSection,
  HomeResearchSection,
  HomeWelcome,
} from '../src/site/pages/home';
import type { HomeStaticMarkup } from '../src/site/components/home-static-main';
import { ContentProvider } from '../src/site/providers/content-context';
import { LanguageProvider, type Locale } from '../src/site/providers/i18n';
import { ThemeProvider } from '../src/site/providers/theme-provider';
import { english } from '../src/site/translation';
import { getStaticRoutes } from '../src/site/routing/routes';
import { publishedActivities, toActivitySummary } from '../src/data/activities';
import { publishedCaseStudies, toCaseStudySummary } from '../src/data/case-studies';
import { publishedResearch } from '../src/data/research-articles';
import { serviceRoutePaths } from '../src/data/service-routes';

// Static sections below the interactive HomeHero contain native links and images,
// avoiding shipping the large translation dictionary in the homepage client bundle.
const insights = loadInsights();
const news = loadNews();
const newsItems = news
  .filter((item) => item.status === 'published')
  .map(toNewsSummary)
  .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
  .slice(0, 6);
const routePaths = [...getStaticRoutes(insights, news).map((route) => route.path), ...serviceRoutePaths];
const activityItems = publishedActivities.map(toActivitySummary);
const researchItems = publishedResearch.map(toActivitySummary);
const caseStudyItems = publishedCaseStudies.map(toCaseStudySummary);
await writeFile('src/data/route-paths.json', `${JSON.stringify(routePaths, null, 2)}\n`);

const extractMain = (html: string, label: string, locale: Locale) => {
  const main = html.match(/<main>([\s\S]*?)<\/main>/)?.[1];
  if (!main) throw new Error(`Missing homepage ${label}: ${locale}`);
  if (/<(?:button|input|select|textarea|form)\b/i.test(main)) {
    throw new Error(`Interactive homepage controls in ${label} require a client component instead of static markup.`);
  }
  return main;
};

const renderFragment = (locale: Locale, node: React.ReactNode) =>
  renderToStaticMarkup(
    <LanguageProvider locale={locale} path="/" translations={locale === 'en' ? english : undefined}>
      <ThemeProvider>
        <ContentProvider
          insights={insights.map(toInsightSummary)}
          news={news.map(toNewsSummary)}
          routePaths={routePaths}
        >
          <main>{node}</main>
        </ContentProvider>
      </ThemeProvider>
    </LanguageProvider>
  );

const output: Partial<Record<Locale, HomeStaticMarkup>> = {};
for (const locale of ['zh-CN', 'en'] as const) {
  const welcomeRest = extractMain(
    renderFragment(locale, <HomeWelcome items={activityItems} secondary />),
    'welcomeRest',
    locale
  );
  const newsAndResearch = extractMain(
    renderFragment(
      locale,
      <>
        <HomeNewsSection news={newsItems} />
        <HomeResearchSection items={researchItems} />
      </>
    ),
    'newsAndResearch',
    locale
  );
  const products = extractMain(renderFragment(locale, <HomeProductsSection />), 'products', locale);
  const casesAndCompany = extractMain(
    renderFragment(
      locale,
      <>
        <HomeCasesSection items={caseStudyItems} />
        <HomeCompanyEntry />
      </>
    ),
    'casesAndCompany',
    locale
  );
  output[locale] = { welcomeRest, newsAndResearch, products, casesAndCompany };
}
await writeFile('src/data/home-static.json', `${JSON.stringify(output, null, 2)}\n`);
console.log('Generated static homepage bodies for both languages.');
