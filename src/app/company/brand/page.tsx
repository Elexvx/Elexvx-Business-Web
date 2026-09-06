import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';

export const metadata = nextMetadata('/company/brand');

export default function Page() {
  return <NextSitePage path="/company/brand" />;
}
