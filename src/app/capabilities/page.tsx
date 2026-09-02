import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/capabilities');

export default function Page() {
  return <NextSitePage path="/capabilities" />;
}
