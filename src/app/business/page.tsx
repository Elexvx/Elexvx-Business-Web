import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/business');

export default function Page() {
  return <NextSitePage path="/business" />;
}
