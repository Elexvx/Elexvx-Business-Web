import { NextSitePage } from '../../site/NextSitePage';
import { nextMetadata } from '../../site/routing/metadata';

export const metadata = nextMetadata('/contact');

export default function Page() {
  return <NextSitePage path="/contact" />;
}
