'use client';
import { useEffect, useState } from 'react';
import { articleCategoryPath, type ArticleCategory, type ArticleSection } from '../../data/article-categories';
import { useI18n } from './i18n';

export const useArticleCategoryFilter = (
  section: ArticleSection,
  categories: ArticleCategory[],
  initialCategory = 'all'
) => {
  const { href } = useI18n();
  const categoryHref = (value: string) => href(articleCategoryPath(section, value));
  const categoryKey = categories.map(({ id, label }) => `${id}:${label}`).join('|');
  useEffect(() => {
    const legacy = new URLSearchParams(window.location.search).get('category');
    const match = categories.find(({ id, label }) => legacy === id || (section === 'news' && legacy === label));
    if (match || legacy === 'all') window.location.replace(categoryHref(match?.id || 'all'));
  }, [initialCategory, section, categoryKey]);
  const selectCategory = (value: string) => {
    window.location.assign(categoryHref(value));
  };
  return [initialCategory, selectCategory, categoryHref] as const;
};

// Product filters continue to use their existing query-based view.
export const useCategoryFilter = () => {
  const [category, setCategory] = useState('all');
  useEffect(() => {
    const sync = () => setCategory(new URLSearchParams(window.location.search).get('category') || 'all');
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  const selectCategory = (value: string) => {
    const url = new URL(window.location.href);
    if (value === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', value);
    window.history.pushState(null, '', url);
    setCategory(value);
  };
  return [category, selectCategory] as const;
};
