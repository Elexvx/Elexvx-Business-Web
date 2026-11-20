'use client';

import { useEffect, useRef } from 'react';

import {
  buildParticles,
  clamp,
  resolvePalette,
  stepAndDrawParticles,
  type Particle,
  type PointerState,
} from './hero-particles-engine';

const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MAX_CANVAS_PIXELS = 2_500_000;
const FRAME_INTERVAL_MS = 1000 / 30;
const SIMULATION_FRAME_MS = 1000 / 60;
const MAX_FRAME_DELTA_MS = 50;
const MAX_POINTER_VELOCITY_PX = 28;
const POINTER_IDLE_MS = 650;

/**
 * Renders a restrained, pointer-reactive zero-gravity particle field on canvas
 * for the waiting hero stage, adapting automatically to light/dark themes and reduced motion.
 */
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
    let animateUntil = 0;

    const pointer: PointerState = {
      active: false,
      strength: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    };

    const drawFrame = (timeSec: number, dtFactor: number, still = false) =>
      stepAndDrawParticles(context, particles, pointer, palette, width, height, timeSec, dtFactor, still);

    const drawStillFrame = () => {
      if (inView && !document.hidden && !rafId) drawFrame(0, 1, true);
    };

    const stopAnimation = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;
      animateUntil = 0;
      pointer.active = false;
      pointer.strength = 0;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    const tick = (now: number) => {
      if (now >= animateUntil) {
        stopAnimation();
        drawStillFrame();
        return;
      }
      const elapsed = lastTime ? now - lastTime : FRAME_INTERVAL_MS;
      // Allow small timestamp rounding differences on 60 Hz displays.
      if (elapsed >= FRAME_INTERVAL_MS - 1) {
        lastTime = now;
        drawFrame(now * 0.001, Math.min(MAX_FRAME_DELTA_MS, elapsed) / SIMULATION_FRAME_MS);
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const updateVisibility = () => {
      if (!inView || document.hidden || reducedMotion) stopAnimation();
      drawStillFrame();
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

      if (particles.length === 0) {
        particles = buildParticles(width, height);
      } else {
        for (const p of particles) {
          p.x = p.homeX * width;
          p.y = p.homeY * height;
          p.vx = 0;
          p.vy = 0;
        }
      }

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

      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      if (pointer.active) {
        pointer.vx = clamp(nextX - pointer.x, -MAX_POINTER_VELOCITY_PX, MAX_POINTER_VELOCITY_PX);
        pointer.vy = clamp(nextY - pointer.y, -MAX_POINTER_VELOCITY_PX, MAX_POINTER_VELOCITY_PX);
      }
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.active = true;
      animateUntil = performance.now() + POINTER_IDLE_MS;
      if (!rafId) rafId = window.requestAnimationFrame(tick);
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
