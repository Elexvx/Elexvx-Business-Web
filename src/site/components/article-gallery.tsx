'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { SiteImage } from './site-image';
import { useI18n } from '../providers/i18n';

const GalleryContext = createContext<((button: HTMLButtonElement) => void) | null>(null);
type ImageSource = { src: string; alt: string };
type WatermarkMode = 'overlay' | 'embedded' | 'none';
type Photo = ImageSource & { watermark: WatermarkMode };

export function ArticleImage({
  src,
  alt,
  className = '',
  watermark = 'none',
}: ImageSource & { className?: string; watermark?: WatermarkMode }) {
  const open = useContext(GalleryContext);
  const { locale, t } = useI18n();
  if (!open) return <SiteImage src={src} alt={alt} />;
  return (
    <button
      type="button"
      className={`article-image-trigger${watermark === 'overlay' ? ' article-image-watermark-overlay' : ''}${className ? ` ${className}` : ''}`}
      data-gallery-image
      data-watermark={watermark}
      aria-label={`${locale === 'en' ? 'Enlarge image: ' : '放大图片：'}${t(alt)}`}
      onClick={(event) => open(event.currentTarget)}
    >
      <SiteImage src={src} alt={alt} />
    </button>
  );
}

export function ArticleGallery({ children, watermark = false }: { children: ReactNode; watermark?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const { locale } = useI18n();
  const en = locale === 'en';
  const [requested, setRequested] = useState({ index: 0, direction: 1 });
  const [slide, setSlide] = useState<{ from: number; direction: number } | null>(null);
  const move = (step: number) =>
    setRequested((value) => ({ index: (value.index + step + photos.length) % photos.length, direction: step }));
  useEffect(() => {
    if (!opened || slide || requested.index === index) return;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSlide({ from: index, direction: requested.direction });
    }
    setIndex(requested.index);
  }, [opened, slide, requested, index]);
  useEffect(() => {
    if (!opened) return;
    const node = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [opened]);
  useEffect(() => {
    const selected = thumbs.current?.children[index] as HTMLElement | undefined;
    if (selected && thumbs.current)
      thumbs.current.scrollTo({
        left: selected.offsetLeft - thumbs.current.clientWidth / 2 + selected.clientWidth / 2,
        behavior: 'instant',
      });
  }, [index, opened]);
  const openImage = (img: HTMLImageElement, source: HTMLElement) => {
    const images = Array.from(root.current?.querySelectorAll<HTMLImageElement>('[data-gallery-image] img') || []);
    if (!images.includes(img)) return;
    setPhotos(
      images.map((item) => ({
        src: item.currentSrc || item.src,
        alt: item.alt,
        watermark: (item.closest<HTMLElement>('[data-gallery-image]')?.dataset.watermark as WatermarkMode | undefined) ?? 'none',
      }))
    );
    trigger.current = source;
    setSlide(null);
    setRequested({ index: images.indexOf(img), direction: 1 });
    setIndex(images.indexOf(img));
    setOpened(true);
  };
  const photo = photos[index];
  return (
    <GalleryContext.Provider value={(button) => openImage(button.querySelector('img')!, button)}>
      <div
        ref={root}
        className={`article-gallery-root${watermark ? ' article-gallery-watermarked' : ''}`}
      >
        {children}
      </div>
      <dialog
        ref={dialog}
        className={`article-lightbox${watermark ? ' article-lightbox-watermarked' : ''}`}
        aria-label={en ? 'Image preview' : '图片预览'}
        onCancel={(event) => {
          event.preventDefault();
          setOpened(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpened(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        {photo && (
          <>
            <header className="lightbox-toolbar">
              <span aria-live="polite">
                {index + 1} / {photos.length}
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => setOpened(false)}
                aria-label={en ? 'Close preview' : '关闭预览'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </header>
            <div
              className="lightbox-stage"
              onClick={(event) => {
                if (event.target === event.currentTarget) setOpened(false);
              }}
              onTouchStart={(event) => {
                touch.current = event.touches.length === 1 ? event.touches[0].clientX : null;
              }}
              onTouchEnd={(event) => {
                if (touch.current !== null) {
                  const distance = event.changedTouches[0].clientX - touch.current;
                  if (Math.abs(distance) > 50) move(distance > 0 ? -1 : 1);
                }
                touch.current = null;
              }}
            >
              <button
                className="lightbox-arrow lightbox-prev"
                type="button"
                onClick={() => move(-1)}
                disabled={photos.length < 2}
                aria-label={en ? 'Previous image' : '上一张'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m14 6-6 6 6 6" />
                </svg>
              </button>
              <div className="lightbox-slide-window" data-direction={slide?.direction === -1 ? 'previous' : 'next'}>
                {slide && (
                  <div
                    className="lightbox-slide lightbox-slide-out"
                    data-watermark={photos[slide.from].watermark}
                    aria-hidden="true"
                  >
                    <SiteImage src={photos[slide.from].src} alt="" loading="eager" />
                  </div>
                )}
                <div
                  key={photo.src}
                  className={`lightbox-slide ${slide ? 'lightbox-slide-in' : ''}`}
                  data-watermark={photo.watermark}
                  onAnimationEnd={() => setSlide(null)}
                >
                  <SiteImage className="lightbox-photo" src={photo.src} alt={photo.alt} loading="eager" />
                </div>
              </div>
              <button
                className="lightbox-arrow lightbox-next"
                type="button"
                onClick={() => move(1)}
                disabled={photos.length < 2}
                aria-label={en ? 'Next image' : '下一张'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m10 6 6 6-6 6" />
                </svg>
              </button>
            </div>
            <p className="lightbox-caption">{photo.alt}</p>
            <div ref={thumbs} className="lightbox-thumbnails" aria-label={en ? 'Image thumbnails' : '图片缩略图'}>
              {photos.map((item, i) => (
                <button
                  key={`${item.src}-${i}`}
                  type="button"
                  aria-label={`${en ? 'View image' : '查看图片'} ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setRequested({ index: i, direction: i < index ? -1 : 1 })}
                >
                  <SiteImage src={item.src} alt="" />
                </button>
              ))}
            </div>
          </>
        )}
      </dialog>
    </GalleryContext.Provider>
  );
}
