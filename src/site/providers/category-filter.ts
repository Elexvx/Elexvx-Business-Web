'use client';
import { useEffect, useState } from 'react';

// Query routes keep category views on the same static list page.
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
