import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/research');

export default function Page() {
  return <NextSitePage path="/research" />;
}
