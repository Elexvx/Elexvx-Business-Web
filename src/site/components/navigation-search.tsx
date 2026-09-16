'use client';

import type { SearchDocument } from '../search-index';
import { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useAvailableLink } from '../providers/content-context';
import { useI18n } from '../providers/i18n';

export const NavigationSearch = ({ onNavigate }: { onNavigate: () => void }) => {
  const { locale, href } = useI18n();
  const isAvailableLink = useAvailableLink();
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchDocument[] | null>(null);
  const [searchIndexError, setSearchIndexError] = useState(false);
  const en = locale === 'en';
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);

  useEffect(() => {
    if (!terms.length || searchIndex || searchIndexError) return;
    let active = true;
    void fetch('/search-index.json', { cache: 'force-cache' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Search index unavailable: ${response.status}`);
        const value: unknown = await response.json();
        if (!Array.isArray(value)) throw new Error('Invalid search index');
        return value as SearchDocument[];
      })
      .then((value) => {
        if (active) setSearchIndex(value);
      })
      .catch(() => {
        if (active) setSearchIndexError(true);
      });
    return () => {
      active = false;
    };
  }, [searchIndex, searchIndexError, terms.length]);

  const entries = terms.length && searchIndex ? searchIndex : [];
  const seen = new Set<string>();
  const results = terms.length
    ? entries
        .filter((item) => {
          if (!isAvailableLink(item.path)) return false;
          const searchable =
            `${item.title} ${item.titleEn} ${item.path} ${en ? item.textEn : item.text}`.toLocaleLowerCase();
          if (!terms.every((term) => searchable.includes(term)) || seen.has(item.path)) return false;
          seen.add(item.path);
          return true;
        })
        .sort(
          (a, b) =>
            Number((en ? b.titleEn : b.title).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) -
            Number((en ? a.titleEn : a.title).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
        )
    : [];
  const loading = terms.length > 0 && !searchIndex && !searchIndexError;

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
          {loading ? (
            <p role="status">{en ? 'Searching…' : '正在搜索…'}</p>
          ) : searchIndexError ? (
            <p role="status">{en ? 'Search is temporarily unavailable.' : '搜索暂时不可用，请稍后重试。'}</p>
          ) : (
            <>
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
                  <strong>{en ? item.titleEn : item.title}</strong>
                  <span>
                    {en ? item.kindEn : item.kind} · {item.path}
                  </span>
                </a>
              ))}
              {!results.length && <p>{en ? 'Try another keyword' : '试试其他关键词'}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};
