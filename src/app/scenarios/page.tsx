import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/scenarios');

export default function Page() {
  return <NextSitePage path="/scenarios" />;
}
