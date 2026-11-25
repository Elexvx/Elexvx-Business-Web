'use client';

import { useEffect, useRef } from 'react';

import {
  advanceSpring,
  buildParticles,
  drawParticles,
  getRestingCenter,
  resolvePalette,
  type Particle,
} from './hero-particles-engine';

const DESKTOP_MAX_DPR = 1.5;
const MOBILE_MAX_DPR = 3;
const MAX_CANVAS_PIXELS = 2_500_000;
const MOBILE_BREAKPOINT_PX = 720;
const DESKTOP_FRAME_MS = 1000 / 60;
const MOBILE_FRAME_MS = 1000 / 30;
const MAX_FRAME_DELTA_MS = 50;
const MS_PER_SECOND = 1000;
const RAF_ROUNDING_TOLERANCE_MS = 1;
const POINTER_REST_WEIGHT = 0.24;
const POINTER_ACTIVE_WEIGHT = 0.76;
const POINTER_SPRING_RESPONSE = 10;
const REST_SPRING_RESPONSE = 4.5;
const INTERSECTION_THRESHOLD = 0.01;

type CanvasViewport = {
  width: number;
  height: number;
  dpr: number;
};

type SimulationState = {
  viewport: CanvasViewport;
  palette: readonly string[];
  particles: Particle[];
  inView: boolean;
  reducedMotion: boolean;
  rafId: number;
  lastTime: number;
  simulationTime: number;
  centerX: { position: number; velocity: number };
  centerY: { position: number; velocity: number };
  pointer: { active: boolean; x: number; y: number };
};

function createInitialSimulation(): SimulationState {
  const initialCenter = getRestingCenter(0);
  return {
    viewport: { width: 0, height: 0, dpr: 1 },
    palette: resolvePalette(),
    particles: [],
    inView: typeof IntersectionObserver !== 'function',
    reducedMotion: false,
    rafId: 0,
    lastTime: 0,
    simulationTime: 0,
    centerX: { position: initialCenter.x, velocity: 0 },
    centerY: { position: initialCenter.y, velocity: 0 },
    pointer: { active: false, x: 0, y: 0 },
  };
}

function measureCanvasViewport(canvas: HTMLCanvasElement): CanvasViewport {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const maxDpr = width <= MOBILE_BREAKPOINT_PX ? MOBILE_MAX_DPR : DESKTOP_MAX_DPR;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));
  return { width, height, dpr };
}

function updatePointerFromEvent(canvas: HTMLCanvasElement, event: PointerEvent, pointer: SimulationState['pointer']) {
  if (event.pointerType === 'touch') return;
  const rect = canvas.getBoundingClientRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!inside || !rect.width || !rect.height) {
    pointer.active = false;
    return;
  }
  pointer.x = (event.clientX - rect.left) / rect.width;
  pointer.y = (event.clientY - rect.top) / rect.height;
  pointer.active = true;
}

export const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const hero = canvas.closest<HTMLElement>('.home-product-intro');
    const motionQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined;
    const state = createInitialSimulation();
    state.reducedMotion = Boolean(motionQuery?.matches);

    const drawFrame = () =>
      drawParticles(context, state.particles, state.palette, {
        width: state.viewport.width,
        height: state.viewport.height,
        time: state.simulationTime,
        center: { x: state.centerX.position, y: state.centerY.position },
      });

    const drawStillFrame = () => {
      if (state.inView && !document.hidden && !state.rafId) drawFrame();
    };

    const stopAnimation = () => {
      if (state.rafId) window.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
      state.lastTime = 0;
      state.pointer.active = false;
    };

    const stepSimulation = (elapsedMs: number) => {
      const seconds = Math.min(MAX_FRAME_DELTA_MS, elapsedMs) / MS_PER_SECOND;
      state.simulationTime += seconds;
      const restingCenter = getRestingCenter(state.simulationTime);
      const targetX = state.pointer.active
        ? restingCenter.x * POINTER_REST_WEIGHT + state.pointer.x * POINTER_ACTIVE_WEIGHT
        : restingCenter.x;
      const targetY = state.pointer.active
        ? restingCenter.y * POINTER_REST_WEIGHT + state.pointer.y * POINTER_ACTIVE_WEIGHT
        : restingCenter.y;
      const response = state.pointer.active ? POINTER_SPRING_RESPONSE : REST_SPRING_RESPONSE;
      advanceSpring(state.centerX, targetX, response, seconds);
      advanceSpring(state.centerY, targetY, response, seconds);
      drawFrame();
    };

    const tick = (now: number) => {
      const frameInterval = state.viewport.width <= MOBILE_BREAKPOINT_PX ? MOBILE_FRAME_MS : DESKTOP_FRAME_MS;
      const elapsed = state.lastTime ? now - state.lastTime : frameInterval;
      // Allow small timestamp rounding differences on 60 Hz displays.
      if (elapsed >= frameInterval - RAF_ROUNDING_TOLERANCE_MS) {
        state.lastTime = now;
        stepSimulation(elapsed);
      }
      state.rafId = window.requestAnimationFrame(tick);
    };

    const updateVisibility = () => {
      if (!state.inView || document.hidden || state.reducedMotion) {
        stopAnimation();
        drawStillFrame();
      } else if (!state.rafId) {
        state.rafId = window.requestAnimationFrame(tick);
      }
    };

    const syncSize = () => {
      const next = measureCanvasViewport(canvas);
      if (
        next.width === state.viewport.width &&
        next.height === state.viewport.height &&
        next.dpr === state.viewport.dpr
      ) {
        return;
      }
      state.viewport = next;
      canvas.width = Math.round(next.width * next.dpr);
      canvas.height = Math.round(next.height * next.dpr);
      context.setTransform(next.dpr, 0, 0, next.dpr, 0, 0);
      state.particles = buildParticles(next.width, next.height);
      drawStillFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (state.reducedMotion || !state.inView || document.hidden) return;
      updatePointerFromEvent(canvas, event, state.pointer);
    };
    const handlePointerLeave = () => {
      state.pointer.active = false;
    };
    const handleMotionChange = (event: MediaQueryListEvent) => {
      state.reducedMotion = event.matches;
      updateVisibility();
    };

    const themeObserver = new MutationObserver(() => {
      state.palette = resolvePalette();
      drawStillFrame();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const visibilityObserver =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            ([entry]) => {
              state.inView = entry.intersectionRatio >= INTERSECTION_THRESHOLD;
              updateVisibility();
            },
            { threshold: INTERSECTION_THRESHOLD }
          )
        : undefined;
    visibilityObserver?.observe(canvas);

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(syncSize) : undefined;
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
