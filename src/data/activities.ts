import records from '../../content/site/activities.json';

export type Activity = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  keywords?: string[];
  keywordsEn?: string[];
  status: 'draft' | 'published';
  category?: string;
  categorySlug?: string;
  cover?: string;
  pinned?: boolean;
  body: string;
};

export const activities = records as Activity[];
export const publishedActivities = activities.filter((item) => item.status === 'published');
