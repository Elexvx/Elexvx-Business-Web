'use client';

import { useEffect, useRef } from 'react';

import {
  buildParticles,
  drawParticles,
  getRestingCenter,
  resolvePalette,
  type Particle,
} from './hero-particles-engine';

const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MAX_CANVAS_PIXELS = 2_500_000;
const DESKTOP_FRAME_MS = 1000 / 60;
const MOBILE_FRAME_MS = 1000 / 30;
const MAX_FRAME_DELTA_MS = 50;

export const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const hero = canvas.closest<HTMLElement>('.home-product-intro');
    const motionQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let reducedMotion = Boolean(motionQuery?.matches);
    let inView = typeof IntersectionObserver !== 'function';

    let palette = resolvePalette();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let rafId = 0;
    let lastTime = 0;
    let simulationTime = 0;

    const center = getRestingCenter(simulationTime);
    const pointer = { active: false, x: 0, y: 0 };

    const drawFrame = () => drawParticles(context, particles, palette, { width, height, time: simulationTime, center });

    const drawStillFrame = () => {
      if (inView && !document.hidden && !rafId) drawFrame();
    };

    const stopAnimation = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;
      pointer.active = false;
    };

    const tick = (now: number) => {
      const frameInterval = width <= 720 ? MOBILE_FRAME_MS : DESKTOP_FRAME_MS;
      const elapsed = lastTime ? now - lastTime : frameInterval;
      // Allow small timestamp rounding differences on 60 Hz displays.
      if (elapsed >= frameInterval - 1) {
        lastTime = now;
        const delta = Math.min(MAX_FRAME_DELTA_MS, elapsed);
        simulationTime += delta / 1000;
        const restingCenter = getRestingCenter(simulationTime);
        const targetX = pointer.active ? restingCenter.x * 0.18 + pointer.x * 0.82 : restingCenter.x;
        const targetY = pointer.active ? restingCenter.y * 0.18 + pointer.y * 0.82 : restingCenter.y;
        const follow = 1 - Math.exp(-delta / (pointer.active ? 185 : 470));
        center.x += (targetX - center.x) * follow;
        center.y += (targetY - center.y) * follow;
        drawFrame();
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const updateVisibility = () => {
      if (!inView || document.hidden || reducedMotion) {
        stopAnimation();
        drawStillFrame();
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const nextDpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
        Math.sqrt(MAX_CANVAS_PIXELS / (nextWidth * nextHeight))
      );
      if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = buildParticles(width, height);
      drawStillFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion || !inView || document.hidden || event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        pointer.active = false;
        return;
      }

      if (!rect.width || !rect.height) return;
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const themeObserver = new MutationObserver(() => {
      palette = resolvePalette();
      drawStillFrame();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const visibilityObserver =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.intersectionRatio >= 0.01;
              updateVisibility();
            },
            { threshold: 0.01 }
          )
        : null;
    visibilityObserver?.observe(canvas);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      updateVisibility();
    };

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(syncSize) : null;
    resizeObserver?.observe(canvas);
    window.addEventListener('resize', syncSize);
    hero?.addEventListener('pointermove', handlePointerMove, { passive: true });
    hero?.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('visibilitychange', updateVisibility);
    motionQuery?.addEventListener('change', handleMotionChange);

    syncSize();
    updateVisibility();

    return () => {
      stopAnimation();
      themeObserver.disconnect();
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncSize);
      hero?.removeEventListener('pointermove', handlePointerMove);
      hero?.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('visibilitychange', updateVisibility);
      motionQuery?.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-hero-particles" aria-hidden="true" />;
};
