import { notFound } from 'next/navigation';
import { metadataForRoute } from '../../../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: 'Page not found',
    description: 'This research direction is no longer available.',
    robots: 'noindex,nofollow',
  },
  '/research/industrial-intelligence',
  'en'
);

// Keep retired URLs out of the English catch-all's static export fallback.
export default function Page() {
  notFound();
}
