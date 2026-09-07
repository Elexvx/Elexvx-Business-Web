import { renderToStaticMarkup } from 'react-dom/server';
import type { Insight, NewsItem } from '../content/types';
import { App } from '../site/App';
import { resolveRoute } from '../site/routing/routes';
import { siteIdentity } from '../data/site';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const canonicalUrl = (path: string) => `${siteIdentity.canonicalOrigin}${path === '/' ? '/' : `${path}/`}`;

export const renderDocument = (template: string, path: string, insights: Insight[], news: NewsItem[] = []) => {
  const route = resolveRoute(path, insights, news);
  const appMarkup = renderToStaticMarkup(<App path={path} insights={insights} news={news} />).replace(
    /<link rel="preload"[^>]*\/>/g,
    ''
  );
  const description = escapeHtml(route.meta.description);
  const title = escapeHtml(route.meta.title);
  const robots = route.meta.robots ?? 'index,follow';
  const canonical = canonicalUrl(path);
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:image" content="${escapeHtml(new URL(route.meta.image || '/share/elexvx.png', siteIdentity.canonicalOrigin).href)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n    ');

  return template
    .replace(/<title>.*?<\/title>/s, head)
    .replace('<div id="app"><!--app--></div>', `<div id="app">${appMarkup}</div>`);
};

export const renderRedirectDocument = (template: string, target: string) => {
  const safeTarget = escapeHtml(target);
  const redirectHead = [
    '<title>Redirecting · Elexvx Research</title>',
    '<meta name="robots" content="noindex,nofollow" />',
    `<meta http-equiv="refresh" content="0;url=${safeTarget}" />`,
  ].join('\n    ');
  const body = `<main style="font-family:var(--font-system),sans-serif;padding:48px"><p>页面已移动到 <a href="${safeTarget}">${safeTarget}</a>。</p></main>`;
  return template.replace(/<title>.*?<\/title>/s, redirectHead).replace('<div id="app"><!--app--></div>', body);
};
