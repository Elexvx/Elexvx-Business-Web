import { useEffect, useRef, type RefObject } from 'react';
import type { Locale } from '../providers/i18n';
import { SiteImage } from './site-image';

export type WatermarkMode = 'overlay' | 'embedded' | 'none';
export type GalleryPhoto = { src: string; alt: string; watermark: WatermarkMode };

const SWIPE_THRESHOLD_PX = 50;

const LightboxIcon = ({ path }: { path: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

export const LightboxDialog = ({
  triggerRef,
  watermark,
  locale,
  photos,
  index,
  slide,
  onClose,
  onMove,
  onSelect,
  onSlideEnd,
}: {
  triggerRef: RefObject<HTMLElement | null>;
  watermark: boolean;
  locale: Locale;
  photos: GalleryPhoto[];
  index: number;
  slide: { from: number; direction: number } | null;
  onClose: () => void;
  onMove: (step: number) => void;
  onSelect: (index: number, direction: number) => void;
  onSlideEnd: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<number | null>(null);
  const isEnglish = locale === 'en';
  const photo = photos[index];
  const outgoingPhoto = slide ? photos[slide.from] : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = triggerRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [triggerRef]);

  useEffect(() => {
    const thumbs = thumbsRef.current;
    const selected = thumbs?.children[index] as HTMLElement | undefined;
    if (selected && thumbs) {
      thumbs.scrollTo({
        left: selected.offsetLeft - thumbs.clientWidth / 2 + selected.clientWidth / 2,
        behavior: 'instant',
      });
    }
  }, [index]);

  return (
    <dialog
      ref={dialogRef}
      className={`article-lightbox${watermark ? ' article-lightbox-watermarked' : ''}`}
      aria-label={isEnglish ? 'Image preview' : '图片预览'}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          onMove(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
    >
      {photo && (
        <>
          <header className="lightbox-toolbar">
            <span aria-live="polite">
              {index + 1} / {photos.length}
            </span>
            <button type="button" autoFocus onClick={onClose} aria-label={isEnglish ? 'Close preview' : '关闭预览'}>
              <LightboxIcon path="M6 6l12 12M18 6 6 18" />
            </button>
          </header>
          <div
            className="lightbox-stage"
            onClick={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
            onTouchStart={(event) => {
              touchRef.current = event.touches.length === 1 ? event.touches[0].clientX : null;
            }}
            onTouchEnd={(event) => {
              if (touchRef.current !== null) {
                const distance = event.changedTouches[0].clientX - touchRef.current;
                if (Math.abs(distance) > SWIPE_THRESHOLD_PX) onMove(distance > 0 ? -1 : 1);
              }
              touchRef.current = null;
            }}
          >
            <button
              className="lightbox-arrow lightbox-prev"
              type="button"
              onClick={() => onMove(-1)}
              disabled={photos.length < 2}
              aria-label={isEnglish ? 'Previous image' : '上一张'}
            >
              <LightboxIcon path="m14 6-6 6 6 6" />
            </button>
            <div className="lightbox-slide-window" data-direction={slide?.direction === -1 ? 'previous' : 'next'}>
              {outgoingPhoto && (
                <div
                  className="lightbox-slide lightbox-slide-out"
                  data-watermark={outgoingPhoto.watermark}
                  aria-hidden="true"
                >
                  <SiteImage src={outgoingPhoto.src} alt="" loading="eager" />
                </div>
              )}
              <div
                key={photo.src}
                className={`lightbox-slide ${slide ? 'lightbox-slide-in' : ''}`}
                data-watermark={photo.watermark}
                onAnimationEnd={onSlideEnd}
              >
                <SiteImage className="lightbox-photo" src={photo.src} alt={photo.alt} loading="eager" />
              </div>
            </div>
            <button
              className="lightbox-arrow lightbox-next"
              type="button"
              onClick={() => onMove(1)}
              disabled={photos.length < 2}
              aria-label={isEnglish ? 'Next image' : '下一张'}
            >
              <LightboxIcon path="m10 6 6 6-6 6" />
            </button>
          </div>
          <p className="lightbox-caption">{photo.alt}</p>
          <div
            ref={thumbsRef}
            className="lightbox-thumbnails"
            aria-label={isEnglish ? 'Image thumbnails' : '图片缩略图'}
          >
            {photos.map((item, i) => (
              <button
                key={`${item.src}-${i}`}
                type="button"
                aria-label={`${isEnglish ? 'View image' : '查看图片'} ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => onSelect(i, i < index ? -1 : 1)}
              >
                <SiteImage src={item.src} alt="" />
              </button>
            ))}
          </div>
        </>
      )}
    </dialog>
  );
};
