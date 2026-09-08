'use client';

import { publishedResearch } from '../../data/research-articles';
import { parseMarkdown } from '../../content/markdown';
import { publishedActivities } from '../../data/activities';
import { publishedCaseStudies } from '../../data/case-studies';
import { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { navigationGroups, withNewsCategories } from '../../data/research-navigation';
import { projects, researchDirections, scenarios } from '../../data/site';
import { useAvailableLink, usePublishedInsights, usePublishedNews } from '../providers/content-context';
import { useI18n } from '../providers/i18n';

export const NavigationSearch = ({ onNavigate }: { onNavigate: () => void }) => {
  const { locale, t, href } = useI18n();
  const isAvailableLink = useAvailableLink();
  const [query, setQuery] = useState('');
  const insights = usePublishedInsights();
  const news = usePublishedNews();
  const en = locale === 'en';
  const localizedBody = (source: string): string => {
    const parts: string[] = [];
    const visit = (node: unknown): void => {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (!node || typeof node !== 'object') return;
      const record = node as Record<string, unknown>;
      if (record.type === 'text' && typeof record.value === 'string') {
        parts.push(...record.value.split('\n').map(t));
      } else Object.values(record).forEach(visit);
    };
    visit(parseMarkdown(source));
    return parts.join(' ');
  };
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  // A closed or empty search must not parse every article during page hydration.
  const entries = terms.length
    ? [
        ...publishedResearch.map((item) => ({
          title: item.title,
          path: `/research/${item.slug}`,
          text: `${t(item.excerpt)} ${localizedBody(item.body)}`,
          kind: en ? 'Research' : '研究',
        })),
        ...publishedActivities.map((item) => ({
          title: item.title,
          path: `/activities/${item.slug}`,
          text: `${t(item.excerpt)} ${localizedBody(item.body)}`,
          kind: en ? 'Activity' : '活动',
        })),
        ...publishedCaseStudies.map((item) => ({
          title: en ? item.titleEn : item.title,
          path: `/cases/${item.slug}`,
          text: `${en ? item.excerptEn : item.excerpt} ${en ? item.bodyEn : localizedBody(item.body)}`,
          kind: en ? 'Case study' : '合作案例',
        })),
        ...insights.map((item) => ({
          title: item.title,
          path: `/insights/${item.slug}`,
          text: `${t(item.excerpt)} ${localizedBody(item.body)}`,
          kind: en ? 'Article' : '文章',
        })),
        ...news.map((item) => ({
          title: item.title,
          path: `/news/${item.slug}`,
          text: `${t(item.excerpt)} ${localizedBody(item.body)} ${item.tags.map(t).join(' ')}`,
          kind: en ? 'News' : '动态',
        })),
        ...researchDirections.map((item) => ({
          title: item.title,
          path: `/research/${item.slug}`,
          text: JSON.stringify(item),
          kind: en ? 'Research' : '研究',
        })),
        ...projects.map((item) => ({
          title: item.title,
          path: `/projects/${item.slug}`,
          text: JSON.stringify(item),
          kind: en ? 'Project' : '成果',
        })),
        ...scenarios.map((item) => ({
          title: item.title,
          path: `/scenarios/${item.slug}`,
          text: JSON.stringify(item),
          kind: en ? 'Scenario' : '场景',
        })),
        ...withNewsCategories(
          navigationGroups,
          news.map((item) => item.category)
        ).flatMap((group) =>
          group.columns.flatMap((column) =>
            column.links.map((link) => ({
              title: link.label,
              path: link.href,
              text: `${group.label} ${column.title}`,
              kind: en ? 'Page' : '页面',
            }))
          )
        ),
      ]
    : [];
  const seen = new Set<string>();
  const results = terms.length
    ? entries
        .filter((item) => {
          if (!isAvailableLink(item.path)) return false;
          const searchable = `${item.title} ${t(item.title)} ${item.path} ${item.text}`.toLocaleLowerCase();
          if (!terms.every((term) => searchable.includes(term)) || seen.has(item.path)) return false;
          seen.add(item.path);
          return true;
        })
        .sort(
          (a, b) =>
            Number(t(b.title).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) -
            Number(t(a.title).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
        )
    : [];

  return (
    <div className="navigation-search">
      <label className="navigation-search-field">
        <SearchOutlined aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={en ? 'Search articles, pages and more' : '搜索文章、页面及全站内容'}
          aria-label={en ? 'Search site' : '全站搜索'}
          aria-controls="navigation-search-results"
        />
      </label>
      {terms.length > 0 && (
        <div id="navigation-search-results" className="navigation-search-results">
          <p role="status">{en ? `${results.length} results` : `找到 ${results.length} 条结果`}</p>
          {results.map((item) => (
            <a
              key={item.path}
              href={href(item.path)}
              onClick={() => {
                setQuery('');
                onNavigate();
              }}
            >
              <strong>{t(item.title)}</strong>
              <span>
                {item.kind} · {item.path}
              </span>
            </a>
          ))}
          {!results.length && <p>{en ? 'Try another keyword' : '试试其他关键词'}</p>}
        </div>
      )}
    </div>
  );
};
