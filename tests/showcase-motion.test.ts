import { describe, expect, it } from 'vitest';

import {
  advanceCursorMotion,
  computeScrollRise,
  createCursorMotionState,
  enterCursorMotion,
  formatCursorTransform,
  leaveCursorMotion,
  moveCursorTarget,
} from '../src/site/components/showcase-motion';

describe('computeScrollRise', () => {
  it('starts scaled down and shifted below the viewport before scrolling into view', () => {
    const frame = computeScrollRise(800, 800);

    expect(frame.settled).toBe(false);
    expect(frame.scale).toBe(0.5);
    expect(frame.translateY).toBe(64);
    expect(frame.transform).toBe('translate3d(0, 64.00px, 0) scale(0.5000)');
  });

  it('progresses monotonically through intermediate scroll offsets', () => {
    const early = computeScrollRise(650, 800);
    const late = computeScrollRise(300, 800);

    expect(early.settled).toBe(false);
    expect(late.settled).toBe(false);
    expect(early.scale).toBeGreaterThan(0.5);
    expect(late.scale).toBeGreaterThan(early.scale);
    expect(late.scale).toBeLessThan(1);
    expect(late.translateY).toBeLessThan(early.translateY);
    expect(early.translateY).toBeLessThan(64);
  });

  it('clears the inline transform once settled in view or when viewport height is invalid', () => {
    expect(computeScrollRise(128, 800)).toEqual({
      settled: true,
      translateY: 0,
      scale: 1,
      transform: '',
    });
    expect(computeScrollRise(200, 0)).toEqual({
      settled: true,
      translateY: 0,
      scale: 1,
      transform: '',
    });
  });
});

describe('cursor motion state', () => {
  it('snaps to entry coordinates, springs above 1 briefly, and settles cleanly', () => {
    const state = createCursorMotionState();
    enterCursorMotion(state, 320, 240);

    let peakScale = state.currentScale;
    let steps = 0;
    while (advanceCursorMotion(state) && steps < 120) {
      peakScale = Math.max(peakScale, state.currentScale);
      steps += 1;
    }

    expect(steps).toBeLessThan(120);
    expect(peakScale).toBeGreaterThan(1);
    expect(state.currentX).toBe(320);
    expect(state.currentY).toBe(240);
    expect(state.currentScale).toBe(1);
    expect(state.currentOpacity).toBe(1);
    expect(formatCursorTransform(state)).toBe('translate3d(320.00px, 240.00px, 0) translate(-50%, -50%) scale(1.0000)');
  });

  it('lerps smoothly toward updated pointer targets and fades out in place on leave', () => {
    const state = createCursorMotionState();
    enterCursorMotion(state, 100, 100);
    while (advanceCursorMotion(state)) {
      // Settle at entry point.
    }

    moveCursorTarget(state, 500, 300);
    expect(advanceCursorMotion(state)).toBe(true);
    expect(state.currentX).toBeGreaterThan(100);
    expect(state.currentX).toBeLessThan(500);

    while (advanceCursorMotion(state)) {
      // Settle at new target.
    }
    expect(state.currentX).toBe(500);
    expect(state.currentY).toBe(300);

    leaveCursorMotion(state);
    while (advanceCursorMotion(state)) {
      // Fade out in place.
    }
    expect(state.hovering).toBe(false);
    expect(state.currentOpacity).toBe(0);
    expect(state.currentX).toBe(500);
    expect(state.currentY).toBe(300);
  });
});
