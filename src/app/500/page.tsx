import { ErrorPage } from '../../site/components/error-page';

export const metadata = { robots: { index: false, follow: false } };
export default function Page() {
  return <ErrorPage code={500} />;
}
