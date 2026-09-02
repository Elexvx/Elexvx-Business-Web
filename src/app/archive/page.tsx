import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/archive');

export default function Page() {
  return <NextSitePage path="/archive" />;
}
