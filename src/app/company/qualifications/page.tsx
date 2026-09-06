import { NextSitePage } from '../../../site/NextSitePage';
import { nextMetadata } from '../../../site/routing/metadata';

export const metadata = nextMetadata('/company/qualifications');

export default function Page() {
  return <NextSitePage path="/company/qualifications" />;
}
