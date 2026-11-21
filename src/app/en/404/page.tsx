import { metadataForRoute } from '../../../site/routing/metadata-base';

export { default } from '../not-found';

// Export the English fallback for the static preview and ESA's real 404 responses.
export const metadata = metadataForRoute(
  {
    title: 'This page could not be found',
    description: 'This page does not exist. Return home or explore our research.',
    robots: 'noindex,nofollow',
  },
  '/404',
  'en'
);
