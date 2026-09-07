'use client';
import imageManifest from '../../data/image-manifest.json';
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
  const asset =
    typeof props.src === 'string'
      ? (
          imageManifest as Record<string, { width: number; height: number; variants: { src: string; width: number }[] }>
        )[props.src]
      : undefined;
  const responsive =
    asset && !props.srcSet
      ? {
          src: asset.variants[asset.variants.length - 1].src,
          srcSet: asset.variants.map((v) => `${v.src} ${v.width}w`).join(', '),
          sizes: props.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
          width: props.width || asset.width,
          height: props.height || asset.height,
        }
      : {};
  return (
    <img
      {...props}
      {...responsive}
      alt={props.alt ? t(props.alt) : props.alt}
      loading={loading ?? (fetchPriority === 'high' ? 'eager' : 'lazy')}
      decoding={decoding}
      fetchPriority={fetchPriority}
    />
  );
};
