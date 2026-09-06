import { loadInsights } from '../content/loader';
import { loadNews } from '../content/news-loader';
import { App } from './App';
import type { Locale } from './providers/i18n';

export const NextSitePage = ({ path, locale = 'zh-CN' }: { path: string; locale?: Locale }) => (
  <App path={path} insights={loadInsights()} news={loadNews()} locale={locale} />
);
