import React from 'react';
import { writeFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { toInsightSummary, toNewsSummary } from '../src/content/summaries';
import { HomePage } from '../src/site/pages/home';
import { ContentProvider } from '../src/site/providers/content-context';
import { LanguageProvider, type Locale } from '../src/site/providers/i18n';
import { ThemeProvider } from '../src/site/providers/theme-provider';
import { english } from '../src/site/translation';
import { getStaticRoutes } from '../src/site/routing/routes';
import { publishedActivities, toActivitySummary } from '../src/data/activities';
import { publishedCaseStudies, toCaseStudySummary } from '../src/data/case-studies';
import { publishedResearch } from '../src/data/research-articles';
import { serviceRoutePaths } from '../src/data/service-routes';

// Homepage body contains native links and images, with no client interactions.
// Generate it from the same components/content used by the live development UI.
const insights = loadInsights();
const news = loadNews();
const routePaths = [...getStaticRoutes(insights, news).map((route) => route.path), ...serviceRoutePaths];
const activityItems = publishedActivities.map(toActivitySummary);
const researchItems = publishedResearch.map(toActivitySummary);
const caseStudyItems = publishedCaseStudies.map(toCaseStudySummary);
await writeFile('src/data/route-paths.json', `${JSON.stringify(routePaths, null, 2)}\n`);
const output: Partial<Record<Locale, string>> = {};
for (const locale of ['zh-CN', 'en'] as const) {
  const html = renderToStaticMarkup(
    <LanguageProvider locale={locale} path="/" translations={locale === 'en' ? english : undefined}>
      <ThemeProvider>
        <ContentProvider
          insights={insights.map(toInsightSummary)}
          news={news.map(toNewsSummary)}
          routePaths={routePaths}
        >
          <HomePage activities={activityItems} research={researchItems} caseStudies={caseStudyItems} />
        </ContentProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
  const main = html.match(/<main>([\s\S]*?)<\/main>/)?.[1];
  if (!main || !main.includes('<h1>')) throw new Error(`Missing homepage body: ${locale}`);
  if (/<(?:button|input|select|textarea|form)\b/i.test(main)) {
    throw new Error('Interactive homepage controls require a client component instead of static markup.');
  }
  output[locale] = main;
}
await writeFile('src/data/home-static.json', `${JSON.stringify(output, null, 2)}\n`);
console.log('Generated static homepage bodies for both languages.');
