'use client';
import { useI18n } from '../providers/i18n';
import type { ImgHTMLAttributes } from 'react';

/** Native lazy loading works in both Next.js and the static HTML export. */
export const SiteImage = ({
  loading,
  decoding = 'async',
  fetchPriority,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  const { t } = useI18n();
  return (
    <img
      {...props}
      alt={props.alt ? t(props.alt) : props.alt}
      loading={loading ?? (fetchPriority === 'high' ? 'eager' : 'lazy')}
      decoding={decoding}
      fetchPriority={fetchPriority}
    />
  );
};
