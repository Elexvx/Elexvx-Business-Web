'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { SiteImage } from './site-image';
import { useI18n } from '../providers/i18n';

const GalleryContext = createContext<((button: HTMLButtonElement) => void) | null>(null);
type Photo = { src: string; alt: string };

export function ArticleImage({ src, alt }: Photo) {
  const open = useContext(GalleryContext);
  const { locale } = useI18n();
  if (!open) return <SiteImage src={src} alt={alt} />;
  return (
    <button
      type="button"
      className="article-image-trigger"
      data-gallery-image
      aria-label={`${locale === 'en' ? 'Enlarge image' : '放大图片'}：${alt}`}
      onClick={(event) => open(event.currentTarget)}
    >
      <SiteImage src={src} alt={alt} />
    </button>
  );
}

export function ArticleGallery({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const { locale } = useI18n();
  const en = locale === 'en';
  const move = (step: number) => setIndex((value) => (value + step + photos.length) % photos.length);
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
  const photo = photos[index];
  return (
    <GalleryContext.Provider
      value={(button) => {
        const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[data-gallery-image]') || []);
        setPhotos(
          buttons.map((item) => {
            const img = item.querySelector('img')!;
            return { src: img.currentSrc || img.src, alt: img.alt };
          })
        );
        trigger.current = button;
        setIndex(buttons.indexOf(button));
        setOpened(true);
      }}
    >
      <div ref={root} className="article-gallery-root">
        {children}
      </div>
      <dialog
        ref={dialog}
        className="article-lightbox"
        aria-label={en ? 'Article image gallery' : '文章图片预览'}
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
                ×
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
                ‹
              </button>
              <SiteImage key={photo.src} className="lightbox-photo" src={photo.src} alt={photo.alt} loading="eager" />
              <button
                className="lightbox-arrow lightbox-next"
                type="button"
                onClick={() => move(1)}
                disabled={photos.length < 2}
                aria-label={en ? 'Next image' : '下一张'}
              >
                ›
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
                  onClick={() => setIndex(i)}
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
