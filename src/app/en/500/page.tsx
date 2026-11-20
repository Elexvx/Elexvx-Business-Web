import { ErrorPage } from '../../../site/components/error-page';
import { metadataForRoute } from '../../../site/routing/metadata-base';

export const metadata = metadataForRoute(
  {
    title: 'Something went wrong',
    description: 'Please try again shortly or return home. If the problem persists, contact us.',
    robots: 'noindex,nofollow',
  },
  '/500',
  'en'
);
export default function Page() {
  return <ErrorPage code={500} locale="en" />;
}
