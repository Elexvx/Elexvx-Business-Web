import { submitIndexNowUrls, submitRecentIndexNowArticles } from '../src/server/indexnow';

const args = process.argv.slice(2);
const includeAll = args.includes('--all');
const urls = args.filter((value) => value !== '--all');

const result = urls.length ? await submitIndexNowUrls(urls) : await submitRecentIndexNowArticles({ includeAll });

if (result.urls.length === 0) {
  console.log(
    includeAll
      ? 'The production sitemap contains no article URLs.'
      : 'No article sitemap entries were updated in the last 3 days.'
  );
  process.exit(0);
}

console.log(
  `IndexNow received ${result.urls.length} article URL${result.urls.length === 1 ? '' : 's'} (${result.status}). ` +
    (result.status === 202 ? 'Key validation is pending.' : 'This confirms receipt, not indexing.')
);
