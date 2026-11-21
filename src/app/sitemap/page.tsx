import { NextSitePage } from '../../site/NextSitePage';
import { nextMetadata } from '../../site/routing/metadata';

export const metadata = nextMetadata('/sitemap');

export default function Page() {
  return <NextSitePage path="/sitemap" />;
}
