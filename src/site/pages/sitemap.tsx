'use client';

import { SiteShell } from '../components/shell';
import { useVisibleNavigationGroups } from '../providers/content-context';
import { useI18n } from '../providers/i18n';

type SitemapLink = { href: string; label: string };

const articleSections = [
  { label: '研究文章', prefixes: ['/research/', '/insights/'] },
  { label: '活动报道', prefixes: ['/activities/'] },
  { label: '新闻文章', prefixes: ['/news/'] },
  { label: '合作案例', prefixes: ['/cases/'] },
];

const SitemapLinks = ({ links }: { links: SitemapLink[] }) => {
  const { t, href } = useI18n();
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <a href={href(link.href)}>{t(link.label)}</a>
        </li>
      ))}
    </ul>
  );
};

export const SitemapPage = ({ articles }: { articles: SitemapLink[] }) => {
  const { t } = useI18n();
  const groups = useVisibleNavigationGroups();
  const articleGroups = articleSections
    .map(({ label, prefixes }) => ({
      label,
      links: articles.filter((article) => prefixes.some((prefix) => article.href.startsWith(prefix))),
    }))
    .filter((group) => group.links.length > 0);

  return (
    <SiteShell activePath="/sitemap">
      <div className="sitemap-page">
        <header className="sitemap-header">
          <h1 id="sitemap-heading">{t('站点地图')}</h1>
          {articleGroups.length > 0 && <a href="#sitemap-articles">{t('浏览文章')}</a>}
        </header>
        <nav className="sitemap-groups" aria-labelledby="sitemap-heading">
          {groups.map((group) => (
            <section className="sitemap-group" key={group.id}>
              <h2>{t(group.label)}</h2>
              <SitemapLinks links={group.columns.flatMap((column) => column.links)} />
            </section>
          ))}
        </nav>
        {articleGroups.length > 0 && (
          <nav className="sitemap-articles" id="sitemap-articles" aria-labelledby="sitemap-articles-heading">
            <h2 id="sitemap-articles-heading">{t('文章')}</h2>
            <div className="sitemap-groups">
              {articleGroups.map((group) => (
                <section className="sitemap-group" key={group.label}>
                  <h3>{t(group.label)}</h3>
                  <SitemapLinks links={group.links} />
                </section>
              ))}
            </div>
          </nav>
        )}
      </div>
    </SiteShell>
  );
};
