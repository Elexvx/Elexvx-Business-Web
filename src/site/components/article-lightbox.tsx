import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import type { Locale } from '../providers/i18n';
import { SiteImage } from './site-image';

export type WatermarkMode = 'overlay' | 'embedded' | 'none';
export type GalleryPhoto = { src: string; alt: string; watermark: WatermarkMode };

const SWIPE_THRESHOLD_PX = 50;
const CLICK_SUPPRESS_AFTER_SWIPE_MS = 500;

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

function useLightboxModalLifecycle(
  dialogRef: RefObject<HTMLDialogElement | null>,
  triggerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = triggerRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [dialogRef, triggerRef]);
}

function useCenteredThumbnail(thumbsRef: RefObject<HTMLDivElement | null>, index: number) {
  useEffect(() => {
    const thumbs = thumbsRef.current;
    const selected = thumbs?.children[index] as HTMLElement | undefined;
    if (selected && thumbs) {
      thumbs.scrollTo({
        left: selected.offsetLeft - thumbs.clientWidth / 2 + selected.clientWidth / 2,
        behavior: 'instant',
      });
    }
  }, [thumbsRef, index]);
}

function handleLightboxNavigationKey({
  event,
  thumbs,
  photoCount,
  onMove,
  onSelect,
}: {
  event: ReactKeyboardEvent<HTMLDialogElement>;
  thumbs: HTMLDivElement | null;
  photoCount: number;
  onMove: (step: number) => void;
  onSelect: (index: number, direction: number) => void;
}) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const previous = event.key === 'ArrowLeft';
  const next = event.key === 'ArrowRight';
  if ((!previous && !next && event.key !== 'Home' && event.key !== 'End') || photoCount < 2) return;

  event.preventDefault();
  const buttons = Array.from(thumbs?.querySelectorAll<HTMLButtonElement>('button') ?? []);
  const focusedIndex = buttons.findIndex((button) => button.contains(event.target as Node));
  if (focusedIndex < 0 && (previous || next)) {
    onMove(previous ? -1 : 1);
    return;
  }
  const targetIndex =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? photoCount - 1
        : (focusedIndex + (previous ? -1 : 1) + photoCount) % photoCount;
  onSelect(targetIndex, previous || event.key === 'Home' ? -1 : 1);
  if (focusedIndex >= 0) buttons[targetIndex]?.focus({ preventScroll: true });
}

function useSwipeNavigation(photoCount: number, onMove: (step: number) => void, onClose: () => void) {
  const touchRef = useRef<{ identifier: number; x: number; y: number } | null>(null);
  const ignoreClickUntilRef = useRef(0);

  const onStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() < ignoreClickUntilRef.current) {
      ignoreClickUntilRef.current = 0;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.target === event.currentTarget) onClose();
  };

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    ignoreClickUntilRef.current = 0;
    const touch = event.touches.length === 1 ? event.touches[0] : undefined;
    const onControl = event.target instanceof Element && event.target.closest('button, a, input, select, textarea');
    touchRef.current =
      touch && !onControl ? { identifier: touch.identifier, x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) touchRef.current = null;
  };

  const onTouchCancel = () => {
    touchRef.current = null;
  };

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || event.touches.length > 0 || photoCount < 2) return;
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === start.identifier);
    if (!touch) return;
    const distance = touch.clientX - start.x;
    const verticalDistance = touch.clientY - start.y;
    if (Math.abs(distance) > SWIPE_THRESHOLD_PX && Math.abs(distance) > Math.abs(verticalDistance)) {
      ignoreClickUntilRef.current = Date.now() + CLICK_SUPPRESS_AFTER_SWIPE_MS;
      onMove(distance > 0 ? -1 : 1);
    }
  };

  return { onClick: onStageClick, onTouchStart, onTouchMove, onTouchCancel, onTouchEnd };
}

function LightboxThumbnails({
  thumbsRef,
  photos,
  index,
  isEnglish,
  onSelect,
}: {
  thumbsRef: RefObject<HTMLDivElement | null>;
  photos: GalleryPhoto[];
  index: number;
  isEnglish: boolean;
  onSelect: (index: number, direction: number) => void;
}) {
  return (
    <div
      ref={thumbsRef}
      className="lightbox-thumbnails"
      role="group"
      aria-label={isEnglish ? 'Image thumbnails' : '图片缩略图'}
    >
      {photos.map((item, i) => (
        <button
          key={`${item.src}-${i}`}
          type="button"
          aria-label={`${isEnglish ? 'View image' : '查看图片'} ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
          tabIndex={i === index ? 0 : -1}
          onClick={() => onSelect(i, i < index ? -1 : 1)}
        >
          <SiteImage src={item.src} alt="" />
        </button>
      ))}
    </div>
  );
}

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
  const captionId = useId();
  const isEnglish = locale === 'en';
  const photo = photos[index];
  const outgoingPhoto = slide ? photos[slide.from] : undefined;

  useLightboxModalLifecycle(dialogRef, triggerRef);
  useCenteredThumbnail(thumbsRef, index);
  const stageHandlers = useSwipeNavigation(photos.length, onMove, onClose);

  return (
    <dialog
      ref={dialogRef}
      className={`article-lightbox${watermark ? ' article-lightbox-watermarked' : ''}`}
      aria-label={isEnglish ? 'Image preview' : '图片预览'}
      aria-describedby={photo?.alt ? captionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) =>
        handleLightboxNavigationKey({
          event,
          thumbs: thumbsRef.current,
          photoCount: photos.length,
          onMove,
          onSelect,
        })
      }
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
          <div className="lightbox-stage" {...stageHandlers}>
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
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) onSlideEnd();
                }}
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
          <p id={captionId} className="lightbox-caption">
            {photo.alt}
          </p>
          <LightboxThumbnails
            thumbsRef={thumbsRef}
            photos={photos}
            index={index}
            isEnglish={isEnglish}
            onSelect={onSelect}
          />
        </>
      )}
    </dialog>
  );
};
