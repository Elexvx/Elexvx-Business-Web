export type ParticleKind = 'dash' | 'dot';

export type Particle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: ParticleKind;
  length: number;
  radius: number;
  baseAngle: number;
  angle: number;
  phase: number;
  speed: number;
  driftRadius: number;
  baseAlpha: number;
  paletteIndex: number;
};

export type PointerState = {
  active: boolean;
  strength: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type Palette = readonly string[];

const PARTICLE_SEED = 20261201;
const AREA_PER_PARTICLE = 7600;
const MIN_PARTICLE_COUNT = 84;
const MAX_PARTICLE_COUNT = 210;
const DASH_RATIO = 0.72;

const SPRING_STIFFNESS = 0.028;
const POINTER_STRENGTH_LERP = 0.12;
const POINTER_VELOCITY_DECAY = 0.84;
const PARTICLE_VELOCITY_DAMPING = 0.86;
const ANGLE_INTERPOLATION_RATE = 0.14;
const POINTER_REPULSION_FORCE = 2.5;
const POINTER_SWIRL_FORCE = 0.55;
const POINTER_VELOCITY_TRANSFER = 0.045;
const MIN_CENTER_ATTENUATION = 0.32;

const LIGHT_PALETTE: Palette = [
  '#1d1d1f', // subtle ink neutral
  '#0066cc', // cool blue accent
  '#10b981', // soft emerald-mint
  '#6366f1', // soft indigo
];

const DARK_PALETTE: Palette = [
  '#f5f5f7', // subtle light neutral
  '#60a5fa', // soft sky blue
  '#34d399', // soft mint
  '#a5b4fc', // soft lavender-indigo
];

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const pickPaletteIndex = (rand: number): number => {
  if (rand < 0.56) return 0;
  if (rand < 0.8) return 1;
  if (rand < 0.92) return 2;
  return 3;
};

export const buildParticles = (width: number, height: number): Particle[] => {
  const area = Math.max(1, width * height);
  const count = clamp(Math.round(area / AREA_PER_PARTICLE), MIN_PARTICLE_COUNT, MAX_PARTICLE_COUNT);
  const cols = Math.max(8, Math.round(Math.sqrt((count * width) / Math.max(1, height))));
  const rows = Math.max(6, Math.ceil(count / cols));
  const random = createSeededRandom(PARTICLE_SEED);

  const particles: Particle[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (particles.length >= count) break;
      const homeX = clamp((col + 0.18 + random() * 0.64) / cols, 0.03, 0.97);
      const homeY = clamp((row + 0.18 + random() * 0.64) / rows, 0.04, 0.96);
      const x = homeX * width;
      const y = homeY * height;
      const kind: ParticleKind = random() < DASH_RATIO ? 'dash' : 'dot';
      const baseAngle = random() * Math.PI * 2;

      particles.push({
        homeX,
        homeY,
        x,
        y,
        vx: 0,
        vy: 0,
        kind,
        length: 4.5 + random() * 5.5,
        radius: 1.2 + random() * 1.1,
        baseAngle,
        angle: baseAngle,
        phase: random() * Math.PI * 2,
        speed: 0.35 + random() * 0.5,
        driftRadius: 8 + random() * 12,
        baseAlpha: 0.18 + random() * 0.34,
        paletteIndex: pickPaletteIndex(random()),
      });
    }
  }
  return particles;
};

export const resolvePalette = (): Palette =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
    ? LIGHT_PALETTE
    : DARK_PALETTE;

const shortestAngleDiff = (from: number, to: number) => {
  let diff = (to - from + Math.PI) % (Math.PI * 2);
  if (diff < 0) diff += Math.PI * 2;
  return diff - Math.PI;
};

export const stepAndDrawParticles = (
  context: CanvasRenderingContext2D,
  particles: Particle[],
  pointer: PointerState,
  palette: Palette,
  width: number,
  height: number,
  timeSec: number,
  dtFactor: number,
  reducedMotion: boolean
) => {
  if (width <= 0 || height <= 0) return;
  context.clearRect(0, 0, width, height);

  pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * clamp(POINTER_STRENGTH_LERP * dtFactor, 0, 1);
  pointer.vx *= Math.pow(POINTER_VELOCITY_DECAY, dtFactor);
  pointer.vy *= Math.pow(POINTER_VELOCITY_DECAY, dtFactor);

  const interactRadius = clamp(Math.min(width, height) * 0.28, 125, 210);
  const centerX = width * 0.5;
  const centerY = height * 0.47;
  const maskRx = Math.max(220, width * 0.3);
  const maskRy = Math.max(150, height * 0.27);
  const damping = Math.pow(PARTICLE_VELOCITY_DAMPING, dtFactor);
  const angleInterpolation = clamp(ANGLE_INTERPOLATION_RATE * dtFactor, 0, 1);
  context.lineCap = 'round';

  for (const p of particles) {
    const homePxX = p.homeX * width;
    const homePxY = p.homeY * height;
    const floatX = Math.cos(timeSec * p.speed + p.phase) * p.driftRadius;
    const floatY = Math.sin(timeSec * p.speed * 0.85 + p.phase * 1.13) * p.driftRadius;
    const targetX = homePxX + floatX;
    const targetY = homePxY + floatY;

    let ax = (targetX - p.x) * SPRING_STIFFNESS;
    let ay = (targetY - p.y) * SPRING_STIFFNESS;
    let desiredAngle = p.baseAngle + Math.sin(timeSec * 0.45 + p.phase) * 0.35;
    let boost = 0;

    if (pointer.strength > 0.01) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);

      if (dist < interactRadius && dist > 0.001) {
        const norm = 1 - dist / interactRadius;
        const falloff = norm * norm;
        const nx = dx / dist;
        const ny = dy / dist;

        // Repulsion + gentle tangential swirl around cursor.
        const push = falloff * POINTER_REPULSION_FORCE * pointer.strength;
        const swirl = falloff * POINTER_SWIRL_FORCE * pointer.strength;
        ax += nx * push - ny * swirl + pointer.vx * falloff * POINTER_VELOCITY_TRANSFER;
        ay += ny * push + nx * swirl + pointer.vy * falloff * POINTER_VELOCITY_TRANSFER;

        desiredAngle = Math.atan2(ny, nx) + Math.PI * 0.5;
        boost = falloff;
      }
    }

    if (!reducedMotion) {
      p.vx = (p.vx + ax * dtFactor) * damping;
      p.vy = (p.vy + ay * dtFactor) * damping;
      p.x += p.vx * dtFactor;
      p.y += p.vy * dtFactor;
      p.angle += shortestAngleDiff(p.angle, desiredAngle) * angleInterpolation;
    }

    // Soften particles directly behind the central headline & countdown for crisp legibility.
    const mx = (p.x - centerX) / maskRx;
    const my = (p.y - centerY) / maskRy;
    const centerDistSq = mx * mx + my * my;
    const centerAttenuation = clamp(
      MIN_CENTER_ATTENUATION + Math.min(1, centerDistSq) * (1 - MIN_CENTER_ATTENUATION),
      MIN_CENTER_ATTENUATION,
      1
    );
    context.globalAlpha = clamp((p.baseAlpha + boost * 0.38) * centerAttenuation, 0.05, 0.82);
    const color = palette[p.paletteIndex];

    if (p.kind === 'dot') {
      context.fillStyle = color;
      const dotRadius = p.radius * (1 + boost * 0.35);
      context.beginPath();
      context.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
      context.fill();
    } else {
      const halfLength = p.length * (1 + boost * 0.42) * 0.5;
      const dx = Math.cos(p.angle) * halfLength;
      const dy = Math.sin(p.angle) * halfLength;
      context.strokeStyle = color;
      context.lineWidth = 1.7 + boost * 0.45;
      context.beginPath();
      context.moveTo(p.x - dx, p.y - dy);
      context.lineTo(p.x + dx, p.y + dy);
      context.stroke();
    }
  }
  context.globalAlpha = 1;
};
