import type { ImgHTMLAttributes } from 'react';

/** Native lazy loading works in both Next.js and the static HTML export. */
export const SiteImage = ({ loading, decoding = 'async', fetchPriority, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    {...props}
    loading={loading ?? (fetchPriority === 'high' ? 'eager' : 'lazy')}
    decoding={decoding}
    fetchPriority={fetchPriority}
  />
);
