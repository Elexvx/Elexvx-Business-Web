'use client';
import { ErrorPage } from '../site/components/error-page';

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPage code={500} retry={retry} />;
}
