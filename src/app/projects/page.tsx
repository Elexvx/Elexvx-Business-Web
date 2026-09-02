import { NextSitePage } from '../NextSitePage';
import { nextMetadata } from '../next-metadata';

export const metadata = nextMetadata('/projects');

export default function Page() {
  return <NextSitePage path="/projects" />;
}
