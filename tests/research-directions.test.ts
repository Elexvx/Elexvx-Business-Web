import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { createLinkAvailability } from '../src/data/navigation-availability';
import { getProject, researchDirections, siteIdentity } from '../src/data/site';
import { loadInsights } from '../src/content/loader';
import { loadNews } from '../src/content/news-loader';
import { selectIndexNowUrls } from '../src/server/indexnow';
import { ProjectCard } from '../src/site/pages/shared';
import { metadataForRoute } from '../src/site/routing/metadata-base';
import { getStaticRoutes } from '../src/site/routing/routes';
import { translateEnglish } from '../src/site/translation';
import { LanguageProvider } from '../src/site/providers/i18n';

const directionSlugs = ['ai-data', 'industrial-intelligence'];

describe('published research direction pages', () => {
  const routes = getStaticRoutes(loadInsights(), loadNews());

  it('restores the original direction content and active static routes', () => {
    expect(researchDirections.slice(0, 2).map(({ slug }) => slug)).toEqual(directionSlugs);
    expect(researchDirections.find(({ slug }) => slug === 'ai-data')).toMatchObject({
      title: 'AI 与数据智能',
      question: '如何让数据从被记录，走向可理解、可判断、可行动？',
      methods: ['数据采集与治理', '模型设计与评估', '人机协作反馈'],
      outputSlugs: [],
    });
    expect(researchDirections.find(({ slug }) => slug === 'industrial-intelligence')).toMatchObject({
      title: '工业智能与安全',
      outputSlugs: ['industrial-safety'],
    });

    for (const slug of directionSlugs) expect(routes.some((route) => route.path === `/research/${slug}`)).toBe(true);
  });

  it('publishes localized self-canonical metadata and reciprocal language alternates', () => {
    for (const slug of directionSlugs) {
      const path = `/research/${slug}`;
      const route = routes.find((item) => item.path === path);
      expect(route).toBeDefined();
      if (!route) continue;

      const chinese = metadataForRoute(route.meta, path, 'zh-CN');
      const english = metadataForRoute(route.meta, path, 'en');
      const chineseUrl = `${siteIdentity.canonicalOrigin}${path}/`;
      const englishUrl = `${siteIdentity.canonicalOrigin}/en${path}/`;

      expect(chinese.alternates).toMatchObject({
        canonical: chineseUrl,
        languages: { 'zh-CN': chineseUrl, en: englishUrl, 'x-default': chineseUrl },
      });
      expect(english.alternates).toMatchObject({
        canonical: englishUrl,
        languages: { 'zh-CN': chineseUrl, en: englishUrl, 'x-default': chineseUrl },
      });
      expect(chinese.robots).toMatchObject({ index: true, follow: true });
      expect(english.robots).toMatchObject({ index: true, follow: true });
      expect(JSON.stringify([english.title, english.description])).not.toMatch(/[\u4e00-\u9fff]/u);

      const direction = researchDirections.find((item) => item.slug === slug);
      expect(direction).toBeDefined();
      for (const value of [
        direction?.title,
        direction?.question,
        direction?.summary,
        ...(direction?.methods ?? []),
        direction?.imageAlt,
      ]) {
        if (value) expect(translateEnglish(value), `${slug}: ${value}`).not.toMatch(/[\u4e00-\u9fff]/u);
      }
    }
  });

  it('keeps directions visible by route existence and includes both locales in IndexNow selection', () => {
    const isAvailable = createLinkAvailability(routes.map((route) => route.path));
    const urlEntries = directionSlugs.flatMap((slug) => [
      `<url><loc>${siteIdentity.canonicalOrigin}/research/${slug}/</loc></url>`,
      `<url><loc>${siteIdentity.canonicalOrigin}/en/research/${slug}/</loc></url>`,
    ]);
    const sitemap = `<urlset>${urlEntries.join('')}</urlset>`;
    const submitted = selectIndexNowUrls(sitemap, { includeAll: true });

    for (const slug of directionSlugs) {
      expect(isAvailable(`/research/${slug}/`)).toBe(true);
      expect(submitted).toContain(`${siteIdentity.canonicalOrigin}/research/${slug}/`);
      expect(submitted).toContain(`${siteIdentity.canonicalOrigin}/en/research/${slug}/`);
    }
  });

  it('does not link the related project card to the disabled project route', () => {
    const project = getProject('industrial-safety');
    expect(project).toBeDefined();
    if (!project) return;

    const html = renderToStaticMarkup(
      createElement(LanguageProvider, {
        locale: 'zh-CN',
        path: '/research/industrial-intelligence',
        children: createElement(ProjectCard, { project }),
      })
    );
    expect(html).toContain(project.title);
    expect(html).not.toContain('/projects/industrial-safety');
  });
});
