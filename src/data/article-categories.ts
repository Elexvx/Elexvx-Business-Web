export type ArticleSection = 'research' | 'activities' | 'news';
export type ArticleCategory = { id: string; label: string };

export const newsCategorySlug = (category: string) => {
  const known: Record<string, string> = { 最新动态: 'updates', 公告: 'announcements', 办事指南: 'guides' };
  return (
    known[category] ||
    `topic-${Array.from(category)
      .map((char) => (char.codePointAt(0) ?? 0).toString(16))
      .join('-')}`
  );
};

export const articleCategoryId = (
  section: ArticleSection,
  item: { category?: string; categorySlug?: string; directionSlug?: string }
): string => {
  const label = item.category || '技术文章';
  return section === 'news' ? newsCategorySlug(label) : item.categorySlug || item.directionSlug || 'uncategorized';
};

export const articleCategories = (
  section: ArticleSection,
  items: Array<{ category?: string; categorySlug?: string; directionSlug?: string }>
): ArticleCategory[] =>
  Array.from(
    new Map(
      items.map((item) => {
        const label = item.category || '技术文章';
        const id = articleCategoryId(section, item);
        return [id, { id, label }] as const;
      })
    ).values()
  );

export const articleCategoryPath = (section: ArticleSection, id = 'all') =>
  id === 'all' ? `/${section}/` : `/${section}/category/${id}/`;
