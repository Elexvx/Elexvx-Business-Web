import records from '../../content/site/activities.json';
import { omitFields } from '../content/summaries';

export type Activity = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  keywords?: string[];
  keywordsEn?: string[];
  status: 'draft' | 'published';
  category?: string;
  categorySlug?: string;
  directionSlug?: string;
  cover?: string;
  externalUrl?: string;
  pinned?: boolean;
  body: string;
};

export type ActivitySummary = Omit<Activity, 'body'>;

export const toActivitySummary = (item: Activity): ActivitySummary => omitFields(item, 'body');

const activities = records as Activity[];
export const publishedActivities = activities.filter((item) => item.status === 'published');
