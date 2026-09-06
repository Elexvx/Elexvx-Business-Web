'use client';

import { publishedActivities } from '../../data/activities';
import { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { navigationGroups } from '../../data/research-navigation';
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
  const entries = [
    ...publishedActivities.map((item) => ({
      title: item.title,
      path: `/activities/${item.slug}`,
      text: `${item.excerpt} ${item.body}`,
      kind: en ? 'Activity' : '活动',
    })),
    ...insights.map((item) => ({
      title: item.title,
      path: `/insights/${item.slug}`,
      text: `${item.excerpt} ${item.body}`,
      kind: en ? 'Article' : '文章',
    })),
    ...news.map((item) => ({
      title: item.title,
      path: `/news/${item.slug}`,
      text: `${item.excerpt} ${item.body} ${item.tags.join(' ')}`,
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
    ...navigationGroups.flatMap((group) =>
      group.columns.flatMap((column) =>
        column.links.map((link) => ({
          title: link.label,
          path: link.href,
          text: `${group.label} ${column.title}`,
          kind: en ? 'Page' : '页面',
        }))
      )
    ),
  ];
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
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
