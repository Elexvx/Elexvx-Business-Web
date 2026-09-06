import { notFound } from 'next/navigation';

// Keep retired URLs out of the English catch-all's static export fallback.
export default function Page() {
  notFound();
}
