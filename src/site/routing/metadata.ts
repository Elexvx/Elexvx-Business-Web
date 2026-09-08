import { loadInsights } from '../../content/loader';
import { loadNews } from '../../content/news-loader';
import type { Locale } from '../providers/i18n';
import { resolveRoute } from './routes';
import { metadataForRoute } from './metadata-base';

export const nextMetadata = (path: string, locale: Locale = 'zh-CN') =>
  metadataForRoute(resolveRoute(path, loadInsights(), loadNews()).meta, path, locale);
