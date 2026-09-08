import React from 'react';
import { writeFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { HomePage } from '../src/site/pages/home';
import { ContentProvider } from '../src/site/providers/content-context';
import { LanguageProvider, type Locale } from '../src/site/providers/i18n';
import { ThemeProvider } from '../src/site/providers/theme-provider';
import { english } from '../src/site/translation';
import { getStaticRoutes } from '../src/site/routing/routes';

// Homepage body contains native links and images, with no client interactions.
// Generate it from the same components/content used by the live development UI.
const insights = loadInsights();
const news = loadNews();
const routePaths = getStaticRoutes(insights, news).map((route) => route.path);
const output: Partial<Record<Locale, string>> = {};
for (const locale of ['zh-CN', 'en'] as const) {
  const html = renderToStaticMarkup(
    <LanguageProvider locale={locale} path="/" translations={locale === 'en' ? english : undefined}>
      <ThemeProvider>
        <ContentProvider insights={insights} news={news} routePaths={routePaths}>
          <HomePage />
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
