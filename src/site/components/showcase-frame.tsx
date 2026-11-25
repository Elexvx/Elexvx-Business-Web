'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { useI18n } from '../providers/i18n';
import {
  advanceCursorMotion,
  computeScrollRise,
  createCursorMotionState,
  enterCursorMotion,
  formatCursorTransform,
  leaveCursorMotion,
  moveCursorTarget,
} from './showcase-motion';
import { SiteImage } from './site-image';
import { prefersReducedMotion } from './use-hero-launch-phase';

const PlayIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M8 5.14v14l11-7-11-7Z" />
  </svg>
);

const shouldTrackCursor = (event: ReactPointerEvent<HTMLElement>): boolean =>
  event.pointerType !== 'touch' && !prefersReducedMotion();

function usePreviewScrollRise(facadeRef: RefObject<HTMLElement | null>, enabled: boolean) {
  // Keep inline transform cleared once settled or active so mobile Safari does not clip WebGL layers.
  useEffect(() => {
    const preview = facadeRef.current?.closest<HTMLElement>('.home-mac-preview');
    if (!preview) return;

    if (!enabled || prefersReducedMotion()) {
      preview.style.transform = '';
      return;
    }

    let rafId = 0;
    let appliedTranslateY = 0;

    const update = () => {
      rafId = 0;
      const naturalTop = preview.getBoundingClientRect().top - appliedTranslateY;
      const frame = computeScrollRise(naturalTop, window.innerHeight);
      appliedTranslateY = frame.translateY;
      preview.style.transform = frame.transform;
    };

    const scheduleUpdate = () => {
      if (!rafId) rafId = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      preview.style.transform = '';
    };
  }, [facadeRef, enabled]);
}

function useShowcaseCursor(
  facadeRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLSpanElement | null>,
  active: boolean
) {
  const motionRef = useRef(createCursorMotionState());
  const rafIdRef = useRef(0);

  const stop = useCallback(() => {
    if (rafIdRef.current) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    const facade = facadeRef.current;
    if (facade) delete facade.dataset.cursorActive;
  }, [facadeRef]);

  const scheduleFrame = useCallback(() => {
    if (rafIdRef.current) return;

    const tick = () => {
      const cursor = cursorRef.current;
      if (!cursor) {
        rafIdRef.current = 0;
        return;
      }

      const needsMoreFrames = advanceCursorMotion(motionRef.current);
      cursor.style.opacity = motionRef.current.currentOpacity.toFixed(3);
      cursor.style.transform = formatCursorTransform(motionRef.current);
      rafIdRef.current = needsMoreFrames ? window.requestAnimationFrame(tick) : 0;
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
  }, [cursorRef]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (active) stop();
  }, [active, stop]);

  const enterAt = (facade: HTMLElement, clientX: number, clientY: number) => {
    const rect = facade.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    enterCursorMotion(motionRef.current, clientX - rect.left, clientY - rect.top);
    facade.dataset.cursorActive = 'true';
    scheduleFrame();
  };

  const onPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    if (!shouldTrackCursor(event) || !facadeRef.current) return;
    enterAt(facadeRef.current, event.clientX, event.clientY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!shouldTrackCursor(event) || !facadeRef.current) return;
    const facade = facadeRef.current;
    if (!motionRef.current.hovering) {
      enterAt(facade, event.clientX, event.clientY);
      return;
    }

    const rect = facade.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    moveCursorTarget(motionRef.current, event.clientX - rect.left, event.clientY - rect.top);
    scheduleFrame();
  };

  const onPointerLeave = () => {
    if (facadeRef.current) delete facadeRef.current.dataset.cursorActive;
    leaveCursorMotion(motionRef.current);
    scheduleFrame();
  };

  return { stop, onPointerEnter, onPointerMove, onPointerLeave };
}

export function ShowcaseFrame({
  src,
  title,
  previewImage,
  eager = false,
}: {
  src: string;
  title: string;
  previewImage?: string;
  eager?: boolean;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const facadeRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  usePreviewScrollRise(facadeRef, Boolean(previewImage) && !active);
  const cursor = useShowcaseCursor(facadeRef, cursorRef, active);

  const launch = () => {
    cursor.stop();
    const preview = facadeRef.current?.closest<HTMLElement>('.home-mac-preview');
    if (preview) preview.style.transform = '';
    setActive(true);
  };

  return (
    <div className="home-mac-screen">
      {active ? (
        <iframe src={src} title={title} allow="fullscreen" allowFullScreen />
      ) : (
        <>
          {previewImage ? (
            <button
              type="button"
              ref={facadeRef}
              className="home-mac-facade home-mac-facade--image"
              aria-label={t('进入 3D 预览')}
              onPointerEnter={cursor.onPointerEnter}
              onPointerMove={cursor.onPointerMove}
              onPointerLeave={cursor.onPointerLeave}
              onClick={launch}
            >
              <SiteImage
                className="home-mac-facade-image"
                src={previewImage}
                alt={title}
                sizes="(max-width: 720px) calc(100vw - 40px), min(1376px, calc(100vw - 64px))"
                fetchPriority={eager ? 'high' : undefined}
                loading={eager ? 'eager' : 'lazy'}
              />
              <span ref={cursorRef} className="home-mac-facade-cursor" aria-hidden="true">
                <PlayIcon size={20} />
                <span>{t('进入 3D 预览')}</span>
              </span>
            </button>
          ) : (
            <div className="home-mac-facade">
              <p className="home-mac-facade-title">{title}</p>
              <button type="button" className="action-button home-mac-facade-button" onClick={launch}>
                <PlayIcon size={16} />
                <span>{t('进入 3D 预览')}</span>
              </button>
            </div>
          )}
          <noscript>
            <iframe src={src} title={title} loading="lazy" allow="fullscreen" allowFullScreen />
          </noscript>
        </>
      )}
    </div>
  );
}
