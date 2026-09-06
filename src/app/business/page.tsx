import { NextSitePage } from '../../site/NextSitePage';
import { nextMetadata } from '../../site/routing/metadata';

export const metadata = nextMetadata('/business');

export default function Page() {
  return <NextSitePage path="/business" />;
}
