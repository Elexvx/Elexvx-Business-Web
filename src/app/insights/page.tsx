import { NextSitePage } from '../../site/NextSitePage';
import { nextMetadata } from '../../site/routing/metadata';

export const metadata = nextMetadata('/insights');

export default function Page() {
  return <NextSitePage path="/insights" />;
}
