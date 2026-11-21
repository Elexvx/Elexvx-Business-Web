'use client';

import { GlobalOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { serviceNavigationLinks, type ServiceNavigationConfig } from '../../data/service-navigation';
import { SiteSelect } from '../components/primitives/select';
import { canonicalContentHref } from '../routing/content-href';

const SCOPE_STORAGE_KEY = 'elexvx-navigation-scope';
const ENGINE_STORAGE_KEY = 'elexvx-navigation-engine';
const SEARCH_PLACEHOLDER = '搜索入口或关键词';
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

const DIRECTORY_SEARCH_LINKS: SearchLink[] = serviceNavigationLinks.map((link) => ({
  id: link.id,
  name: link.name,
  url: canonicalContentHref(link.url),
  description: link.description,
  tags: link.tags,
}));

export function DirectorySearch({ searchConfig }: { searchConfig: SearchConfig }) {
  const [scope, setScope] = useState<SearchScope>('internal');
  const [engineId, setEngineId] = useState(searchConfig.defaultEngine);
  const [query, setQuery] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const enabledSearchEngines = useMemo(
    () => searchConfig.engines.filter((engine) => searchConfig.enabledEngines.includes(engine.name)),
    [searchConfig]
  );
  const listboxId = 'navigation-search-suggestions';
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    if (!normalized || scope !== 'internal') return [];
    return DIRECTORY_SEARCH_LINKS.filter((link) =>
      [link.name, link.description, ...link.tags].join(' ').toLocaleLowerCase('zh-CN').includes(normalized)
    ).slice(0, searchConfig.maxSuggestions);
  }, [query, scope, searchConfig.maxSuggestions]);

  const selectedEngine = enabledSearchEngines.find((engine) => engine.name === engineId) ?? enabledSearchEngines[0];
  const suggestionsVisible = suggestionsOpen && scope === 'internal' && suggestions.length > 0;

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
    setSuggestionsOpen(false);
    openExternalUrl(link.url);
  };

  const findInternalResult = () => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    if (!normalized) return undefined;
    return DIRECTORY_SEARCH_LINKS.find((link) => link.name.toLocaleLowerCase('zh-CN') === normalized) ?? suggestions[0];
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
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((current) => (suggestionsVisible ? (current + 1) % suggestions.length : 0));
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((current) => (!suggestionsVisible || current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setActiveSuggestion(-1);
      setSuggestionsOpen(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="service-search"
      aria-label="搜索工具"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setSuggestionsOpen(false);
          setActiveSuggestion(-1);
        }
      }}
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
              } else {
                const nextEngine = enabledSearchEngines.find((engine) => engine.displayName === value);
                setScope('web');
                if (nextEngine) setEngineId(nextEngine.name);
              }
              setActiveSuggestion(-1);
              setSuggestionsOpen(false);
            }}
            allLabel="站内导航"
            options={searchConfig.showEngineSelector ? enabledSearchEngines.map((engine) => engine.displayName) : []}
          />
        </div>
        <div className="service-search-input-wrap">
          <SearchOutlined className="service-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            aria-activedescendant={
              suggestionsVisible && activeSuggestion >= 0 ? `navigation-suggestion-${activeSuggestion}` : undefined
            }
            aria-autocomplete="list"
            aria-controls={suggestionsVisible ? listboxId : undefined}
            aria-expanded={suggestionsVisible}
            aria-label={scope === 'internal' ? '站内搜索' : '全网搜索'}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveSuggestion(-1);
              setSuggestionsOpen(true);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              scope === 'internal' ? SEARCH_PLACEHOLDER : (selectedEngine?.placeholder ?? SEARCH_PLACEHOLDER)
            }
            role="combobox"
            value={query}
          />
          {suggestionsVisible ? (
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
