'use client';

import { GlobalOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import type { ServiceNavigationConfig } from '../../data/service-navigation';
import { SiteSelect } from '../components/primitives/select';

const SCOPE_STORAGE_KEY = 'elexvx-navigation-scope';
const ENGINE_STORAGE_KEY = 'elexvx-navigation-engine';
type SearchScope = 'internal' | 'web';
type SearchLink = { id: string; name: string; url: string; description: string; tags: string[] };
type SearchConfig = ServiceNavigationConfig['search'];

function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Search preferences are optional when storage is unavailable.
  }
}

function buildSearchUrl(engine: SearchConfig['engines'][number] | undefined, query: string): string | undefined {
  if (!engine || !query.trim()) return undefined;
  const url = new URL(engine.baseUrl);
  url.searchParams.set(engine.queryParam, query.trim());
  return url.href;
}

function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function readDirectorySearchLinks(): SearchLink[] {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('.service-directory-row')).map((anchor, index) => ({
    id: anchor.dataset.linkId || String(index),
    name: anchor.querySelector('.service-link-title')?.textContent?.trim() ?? '',
    url: anchor.href,
    description: anchor.querySelector('.service-link-description')?.textContent?.trim() ?? '',
    tags: (anchor.dataset.searchTags ?? '').split(/\s+/).filter(Boolean),
  }));
}

export function NavigationSearch({ searchConfig }: { searchConfig: SearchConfig }) {
  const [scope, setScope] = useState<SearchScope>('internal');
  const [engineId, setEngineId] = useState(searchConfig.defaultEngine);
  const [query, setQuery] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchLinks, setSearchLinks] = useState<SearchLink[] | null>(null);
  const enabledSearchEngines = useMemo(
    () => searchConfig.engines.filter((engine) => searchConfig.enabledEngines.includes(engine.name)),
    [searchConfig]
  );
  const listboxId = 'navigation-search-suggestions';
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    if (!normalized || scope !== 'internal') return [];
    return (searchLinks ?? [])
      .filter((link) =>
        [link.name, link.description, ...link.tags].join(' ').toLocaleLowerCase('zh-CN').includes(normalized)
      )
      .slice(0, searchConfig.maxSuggestions);
  }, [query, scope, searchConfig.maxSuggestions, searchLinks]);

  const selectedEngine = enabledSearchEngines.find((engine) => engine.name === engineId) ?? enabledSearchEngines[0];

  useEffect(() => {
    const storedScope = readStoredValue(SCOPE_STORAGE_KEY);
    const storedEngine = readStoredValue(ENGINE_STORAGE_KEY);
    if (storedScope === 'internal' || storedScope === 'web') setScope(storedScope);
    if (storedEngine && enabledSearchEngines.some((engine) => engine.name === storedEngine)) setEngineId(storedEngine);
  }, [enabledSearchEngines]);

  useEffect(() => {
    writeStoredValue(SCOPE_STORAGE_KEY, scope);
  }, [scope]);

  useEffect(() => {
    writeStoredValue(ENGINE_STORAGE_KEY, engineId);
  }, [engineId]);

  const openInternalResult = (link: SearchLink) => {
    setQuery(link.name);
    setActiveSuggestion(-1);
    openExternalUrl(link.url);
  };

  const findInternalResult = () => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    if (!normalized) return undefined;
    return searchLinks?.find((link) => link.name.toLocaleLowerCase('zh-CN') === normalized) ?? suggestions[0];
  };

  const submit = () => {
    if (scope === 'internal') {
      const result = activeSuggestion >= 0 ? suggestions[activeSuggestion] : findInternalResult();
      if (result) openInternalResult(result);
      return;
    }
    const url = buildSearchUrl(selectedEngine, query);
    if (url) openExternalUrl(url);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Escape') {
      setActiveSuggestion(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="service-search"
      aria-label="搜索工具"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="service-search-row">
        <div className="service-search-source">
          <GlobalOutlined aria-hidden="true" />
          <SiteSelect
            label="选择搜索源"
            value={scope === 'internal' ? '' : (selectedEngine?.displayName ?? 'Bing')}
            onValueChange={(value) => {
              if (!value) {
                setScope('internal');
                if (!searchLinks) setSearchLinks(readDirectorySearchLinks());
              } else {
                const nextEngine = enabledSearchEngines.find((engine) => engine.displayName === value);
                setScope('web');
                if (nextEngine) setEngineId(nextEngine.name);
              }
              setActiveSuggestion(-1);
            }}
            allLabel="站内导航"
            options={searchConfig.showEngineSelector ? enabledSearchEngines.map((engine) => engine.displayName) : []}
          />
        </div>
        <div className="service-search-input-wrap">
          <SearchOutlined className="service-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            aria-activedescendant={activeSuggestion >= 0 ? `navigation-suggestion-${activeSuggestion}` : undefined}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={scope === 'internal' && suggestions.length > 0}
            aria-label={scope === 'internal' ? '站内搜索' : '全网搜索'}
            autoComplete="off"
            onChange={(event) => {
              if (scope === 'internal' && !searchLinks) setSearchLinks(readDirectorySearchLinks());
              setQuery(event.target.value);
              setActiveSuggestion(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              scope === 'internal'
                ? '搜索入口名称、系统或关键词'
                : (selectedEngine?.placeholder ?? '搜索入口名称、系统或关键词')
            }
            role="combobox"
            value={query}
          />
          {scope === 'internal' && suggestions.length > 0 ? (
            <div className="service-search-suggestions" id={listboxId} role="listbox">
              {suggestions.map((link, index) => (
                <button
                  className={index === activeSuggestion ? 'is-active' : ''}
                  id={`navigation-suggestion-${index}`}
                  key={link.id}
                  role="option"
                  aria-selected={index === activeSuggestion}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openInternalResult(link)}
                >
                  <span className="service-suggestion-name">{link.name}</span>
                  <span className="service-suggestion-description">{link.description || '打开链接'}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button className="service-search-submit" type="submit">
          <SearchOutlined aria-hidden="true" />
          <span>搜索</span>
        </button>
      </div>
    </form>
  );
}
