import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/company');

export default function Page() {
  return <NextSitePage path="/company" />;
}
