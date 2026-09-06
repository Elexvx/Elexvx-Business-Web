import { NextSitePage } from '../../site/NextSitePage';
import { nextMetadata } from '../../site/routing/metadata';

export const metadata = nextMetadata('/research');

export default function Page() {
  return <NextSitePage path="/research" />;
}
