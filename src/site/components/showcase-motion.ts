const CURSOR_LERP = 0.22;
const SCALE_SPRING_STIFFNESS = 0.24;
const SCALE_SPRING_DAMPING = 0.66;
const OPACITY_LERP = 0.24;
const ENTER_SCALE = 0.72;
const ENTER_SCALE_VELOCITY = 0.08;
const SETTLE_POSITION_EPSILON = 0.2;
const SETTLE_SCALE_EPSILON = 0.004;
const SETTLE_OPACITY_EPSILON = 0.01;

const SCROLL_RISE_START_RATIO = 1;
const SCROLL_RISE_END_RATIO = 0.16;
const SCROLL_RISE_MIN_SCALE = 0.5;
const SCROLL_RISE_OFFSET_PX = 64;
const SCROLL_RISE_EXPONENT = 1.6;
const SCROLL_SETTLE_THRESHOLD = 0.999;

export type CursorMotionState = {
  hovering: boolean;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  currentScale: number;
  targetScale: number;
  scaleVel: number;
  currentOpacity: number;
  targetOpacity: number;
};

export type ScrollRiseFrame = {
  settled: boolean;
  translateY: number;
  scale: number;
  transform: string;
};

export const createCursorMotionState = (): CursorMotionState => ({
  hovering: false,
  currentX: 0,
  currentY: 0,
  targetX: 0,
  targetY: 0,
  currentScale: ENTER_SCALE,
  targetScale: ENTER_SCALE,
  scaleVel: 0,
  currentOpacity: 0,
  targetOpacity: 0,
});

export function enterCursorMotion(state: CursorMotionState, x: number, y: number): void {
  state.hovering = true;
  state.currentX = x;
  state.currentY = y;
  state.targetX = x;
  state.targetY = y;
  state.currentScale = ENTER_SCALE;
  state.targetScale = 1;
  state.scaleVel = ENTER_SCALE_VELOCITY;
  state.targetOpacity = 1;
}

export function moveCursorTarget(state: CursorMotionState, x: number, y: number): void {
  state.targetX = x;
  state.targetY = y;
}

export function leaveCursorMotion(state: CursorMotionState): void {
  state.hovering = false;
  state.targetScale = ENTER_SCALE;
  state.targetOpacity = 0;
}

function isCursorMotionSettled(state: CursorMotionState, dx: number, dy: number): boolean {
  return (
    Math.hypot(dx, dy) < SETTLE_POSITION_EPSILON &&
    Math.abs(state.targetScale - state.currentScale) < SETTLE_SCALE_EPSILON &&
    Math.abs(state.scaleVel) < SETTLE_SCALE_EPSILON &&
    Math.abs(state.targetOpacity - state.currentOpacity) < SETTLE_OPACITY_EPSILON
  );
}

/** Advances cursor position, spring scale, and opacity by one frame; returns whether more frames are needed. */
export function advanceCursorMotion(state: CursorMotionState): boolean {
  const dx = state.targetX - state.currentX;
  const dy = state.targetY - state.currentY;
  state.currentX += dx * CURSOR_LERP;
  state.currentY += dy * CURSOR_LERP;

  const scaleForce = (state.targetScale - state.currentScale) * SCALE_SPRING_STIFFNESS;
  state.scaleVel = (state.scaleVel + scaleForce) * SCALE_SPRING_DAMPING;
  state.currentScale += state.scaleVel;
  state.currentOpacity += (state.targetOpacity - state.currentOpacity) * OPACITY_LERP;

  if (!isCursorMotionSettled(state, dx, dy)) return true;

  state.currentX = state.targetX;
  state.currentY = state.targetY;
  state.currentScale = state.targetScale;
  state.scaleVel = 0;
  state.currentOpacity = state.targetOpacity;
  return false;
}

export const formatCursorTransform = (state: CursorMotionState): string =>
  `translate3d(${state.currentX.toFixed(2)}px, ${state.currentY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${state.currentScale.toFixed(4)})`;

/** Maps a preview card's natural viewport offset to a bottom-up rise/expand transform, clearing once settled. */
export function computeScrollRise(naturalTop: number, viewportHeight: number): ScrollRiseFrame {
  if (viewportHeight <= 0) {
    return { settled: true, translateY: 0, scale: 1, transform: '' };
  }

  const start = viewportHeight * SCROLL_RISE_START_RATIO;
  const end = viewportHeight * SCROLL_RISE_END_RATIO;
  const rawProgress = (start - naturalTop) / Math.max(1, start - end);
  const progress = Math.min(1, Math.max(0, rawProgress));

  if (progress >= SCROLL_SETTLE_THRESHOLD) {
    return { settled: true, translateY: 0, scale: 1, transform: '' };
  }

  const eased = 1 - (1 - progress) ** SCROLL_RISE_EXPONENT;
  const scale = SCROLL_RISE_MIN_SCALE + (1 - SCROLL_RISE_MIN_SCALE) * eased;
  const translateY = SCROLL_RISE_OFFSET_PX * (1 - eased);
  return {
    settled: false,
    translateY,
    scale,
    transform: `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
  };
}
