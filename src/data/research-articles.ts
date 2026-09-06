import records from '../../content/site/research.json';
import type { Activity } from './activities';
export const publishedResearch = (records as Activity[]).filter((item) => item.status === 'published');
