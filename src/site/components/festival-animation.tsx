'use client';

import { useEffect, useRef } from 'react';
import { useTheme, type ColorTheme } from '../providers/theme-provider';
import { createRibbons, createSnowFlakes, stepAndDrawRibbons, stepAndDrawSnowFlakes } from './festival-canvas';

const MAX_DEVICE_PIXEL_RATIO = 2;
const INITIAL_FRAME_DT_SECONDS = 0.016;
const MAX_FRAME_DT_SECONDS = 0.05;

export const FestivalAnimation = ({ effect }: { effect: 'snow' | 'ribbon' }) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<ColorTheme>(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const snowFlakes = effect === 'snow' ? createSnowFlakes(width, height) : [];
    const ribbons = effect === 'ribbon' ? createRibbons(width, height) : [];

    const motionQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let reducedMotion = Boolean(motionQuery?.matches);
    let animationId = 0;
    let lastTimestamp = 0;
    let elapsed = 0;

    const renderFrame = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      elapsed += dt;

      if (effect === 'snow') {
        stepAndDrawSnowFlakes(ctx, snowFlakes, width, height, elapsed, dt, themeRef.current);
        return;
      }

      stepAndDrawRibbons(ctx, ribbons, width, height, elapsed, dt);
    };

    const stopLoop = () => {
      if (animationId !== 0) {
        window.cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };

    const tick = (timestamp: number) => {
      if (document.visibilityState === 'hidden' || reducedMotion) {
        animationId = 0;
        return;
      }
      const dt =
        lastTimestamp === 0
          ? INITIAL_FRAME_DT_SECONDS
          : Math.min((timestamp - lastTimestamp) / 1000, MAX_FRAME_DT_SECONDS);
      lastTimestamp = timestamp;
      renderFrame(dt);
      animationId = window.requestAnimationFrame(tick);
    };

    const startOrRenderStatic = () => {
      stopLoop();
      lastTimestamp = 0;
      if (reducedMotion) {
        renderFrame(0);
        return;
      }
      if (document.visibilityState !== 'hidden') {
        animationId = window.requestAnimationFrame(tick);
      }
    };

    const handleResize = () => {
      resizeCanvas();
      if (reducedMotion) renderFrame(0);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopLoop();
      else startOrRenderStatic();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      startOrRenderStatic();
    };

    startOrRenderStatic();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery?.addEventListener('change', handleMotionChange);

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery?.removeEventListener('change', handleMotionChange);
    };
  }, [effect]);

  return <canvas ref={canvasRef} className="festival-canvas" aria-hidden="true" data-festival-effect={effect} />;
};
