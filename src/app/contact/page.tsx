import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/contact');

export default function Page() {
  return <NextSitePage path="/contact" />;
}
