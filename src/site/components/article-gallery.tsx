'use client';

import dynamic from 'next/dynamic';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../providers/i18n';
import type { GalleryPhoto, WatermarkMode } from './article-lightbox';
import { SiteImage } from './site-image';

const LightboxDialog = dynamic(() => import('./article-lightbox').then((module) => module.LightboxDialog), {
  ssr: false,
});

const GalleryContext = createContext<((button: HTMLButtonElement) => void) | null>(null);

export function ArticleImage({
  src,
  alt,
  className = '',
  mediaClassName,
  sizes,
  loading,
  fetchPriority,
  children,
  watermark = 'none',
}: {
  src: string;
  alt: string;
  className?: string;
  mediaClassName?: string;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  children?: ReactNode;
  watermark?: WatermarkMode;
}) {
  const open = useContext(GalleryContext);
  const { locale, t } = useI18n();
  const image = <SiteImage src={src} alt={alt} sizes={sizes} loading={loading} fetchPriority={fetchPriority} />;
  const content = (
    <>
      {mediaClassName ? <span className={mediaClassName}>{image}</span> : image}
      {children}
    </>
  );
  if (!open) return content;
  return (
    <button
      type="button"
      className={`article-image-trigger${watermark === 'overlay' ? ' article-image-watermark-overlay' : ''}${className ? ` ${className}` : ''}`}
      data-gallery-image
      data-watermark={watermark}
      aria-label={`${locale === 'en' ? 'Enlarge image: ' : '放大图片：'}${t(alt)}`}
      onClick={(event) => open(event.currentTarget)}
    >
      {content}
    </button>
  );
}

export function ArticleGallery({ children, watermark = false }: { children: ReactNode; watermark?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const { locale } = useI18n();
  const [requested, setRequested] = useState({ index: 0, direction: 1 });
  const [slide, setSlide] = useState<{ from: number; direction: number } | null>(null);

  const move = (step: number) => {
    if (photos.length === 0) return;
    setRequested((value) => ({ index: (value.index + step + photos.length) % photos.length, direction: step }));
  };

  useEffect(() => {
    if (!opened || slide || requested.index === index) return;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSlide({ from: index, direction: requested.direction });
    }
    setIndex(requested.index);
  }, [opened, slide, requested, index]);

  const openImage = (img: HTMLImageElement, source: HTMLElement) => {
    const images = Array.from(root.current?.querySelectorAll<HTMLImageElement>('[data-gallery-image] img') || []);
    if (!images.includes(img)) return;
    setPhotos(
      images.map((item) => ({
        src: item.currentSrc || item.src,
        alt: item.alt,
        watermark:
          (item.closest<HTMLElement>('[data-gallery-image]')?.dataset.watermark as WatermarkMode | undefined) ?? 'none',
      }))
    );
    trigger.current = source;
    setSlide(null);
    setRequested({ index: images.indexOf(img), direction: 1 });
    setIndex(images.indexOf(img));
    setOpened(true);
  };

  return (
    <GalleryContext.Provider
      value={(button) => {
        const img = button.querySelector('img');
        if (img) openImage(img, button);
      }}
    >
      <div ref={root} className={`article-gallery-root${watermark ? ' article-gallery-watermarked' : ''}`}>
        {children}
      </div>
      {opened && (
        <LightboxDialog
          triggerRef={trigger}
          watermark={watermark}
          locale={locale}
          photos={photos}
          index={index}
          slide={slide}
          onClose={() => setOpened(false)}
          onMove={move}
          onSelect={(targetIndex, direction) => setRequested({ index: targetIndex, direction })}
          onSlideEnd={() => setSlide(null)}
        />
      )}
    </GalleryContext.Provider>
  );
}
