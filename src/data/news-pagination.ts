import { articleCategoryPath, newsCategorySlug } from './article-categories';

export const newsPageSize = 6;

export const newsInCategory = <T extends { category: string }>(items: readonly T[], category: string) =>
  category === 'all' ? items : items.filter((item) => newsCategorySlug(item.category) === category);

export const newsPageCount = (itemCount: number) => Math.max(1, Math.ceil(itemCount / newsPageSize));

export const newsPageHref = (category: string, page: number) => {
  const collection = articleCategoryPath('news', category);
  return page === 1 ? collection : `${collection}page/${page}/`;
};
