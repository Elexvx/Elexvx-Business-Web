export type Particle = {
  x: number;
  y: number;
  size: number;
};

type Point = { x: number; y: number };
type ParticleFrame = {
  width: number;
  height: number;
  time: number;
  center: Point;
};

const SEED = 20261201;
const AREA_PER_PARTICLE = 1350;
const MAX_PARTICLES = 760;
const RAMP_STEPS = 48;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

export const buildParticles = (width: number, height: number): Particle[] => {
  const area = width * height;
  const count = clamp(Math.round(area / AREA_PER_PARTICLE), 1, MAX_PARTICLES);
  const spacingSquared = (area / count) * 0.54;
  const random = createSeededRandom(SEED);
  const particles: Particle[] = [];

  // Poisson disk placement keeps a minimum gap without leaving visible rows.
  for (let attempt = 0; attempt < count * 14 && particles.length < count; attempt++) {
    const x = random() * width;
    const y = random() * height;
    const hasNeighbor = particles.some((point) => (point.x - x) ** 2 + (point.y - y) ** 2 < spacingSquared);
    if (!hasNeighbor) particles.push({ x, y, size: 0.68 + random() * 0.45 });
  }
  return particles;
};

const buildColorRamp = (stops: [number, number, number][]) =>
  Array.from({ length: RAMP_STEPS }, (_, index) => {
    const position = (index / (RAMP_STEPS - 1)) * (stops.length - 1);
    const segment = Math.min(Math.floor(position), stops.length - 2);
    const progress = position - segment;
    const channels = stops[segment].map((channel, i) =>
      Math.round(channel + (stops[segment + 1][i] - channel) * progress)
    );
    return `rgb(${channels.join(', ')})`;
  });

const LIGHT_PALETTE = buildColorRamp([
  [52, 87, 207],
  [19, 132, 151],
  [112, 74, 185],
]);

const DARK_PALETTE = buildColorRamp([
  [98, 145, 255],
  [79, 219, 203],
  [177, 141, 255],
]);

export const resolvePalette = () =>
  document.documentElement.getAttribute('data-theme') === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

export const getRestingCenter = (time: number): Point => ({
  x: 0.47 + Math.sin(time * 0.51 - 0.68) * 0.25,
  y: 0.49 + Math.sin(time * 0.67 - 0.5) * 0.17,
});

const smoothstep = (min: number, max: number, value: number) => {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
};

export const drawParticles = (
  context: CanvasRenderingContext2D,
  particles: Particle[],
  palette: readonly string[],
  { width, height, time, center }: ParticleFrame
) => {
  context.clearRect(0, 0, width, height);
  context.lineCap = 'round';

  const fieldSize = Math.min(width, height * 1.12);
  const verticalStretch = clamp(height / width, 0.92, 1.48);
  const centerX = center.x * width;
  const centerY = center.y * height;
  const radius = fieldSize * (0.255 + 0.044 * Math.sin(time * 1.2) + 0.012 * Math.sin(time * 2.3));
  const size = clamp(fieldSize / 760, 0.77, 1.1);

  for (const particle of particles) {
    const dx = particle.x - centerX;
    const dy = (particle.y - centerY) / verticalStretch;
    const distance = Math.hypot(dx, dy);
    const rippleX = Math.sin(particle.x * 0.011 + particle.y * 0.007 + time * 0.89);
    const rippleY = Math.cos(particle.y * 0.013 - particle.x * 0.008 - time * 0.76);
    const ringDistance = distance - radius + fieldSize * (rippleX + 0.55 * rippleY) * 0.029;

    // A broad, quiet shoulder keeps the crest from looking like a drawn circle.
    const crest = 1 - smoothstep(0, fieldSize * 0.124, Math.abs(ringDistance));
    const inner = 1 - smoothstep(0, radius, distance);
    const energy = crest * crest * 0.89 + inner * 0.13;
    const radialX = dx / Math.max(1, distance);
    const radialY = dy / Math.max(1, distance);
    const offset = energy * fieldSize * 0.062;

    const x = particle.x + rippleY * 6 + radialX * offset - radialY * offset * 0.38;
    const y = particle.y + rippleX * 6 + radialY * offset + radialX * offset * 0.38;
    const angle = Math.atan2(dy, dx) + rippleX * 0.42 + rippleY * 0.24;
    const halfLength = (0.16 + energy * 3.9) * particle.size * size;
    const tipX = Math.cos(angle) * halfLength;
    const tipY = Math.sin(angle) * halfLength;

    // Neighbors share a color because the ramp is sampled in space and time.
    const hue = 0.5 + Math.sin(x * 0.007 - y * 0.006 + time * 0.8 + rippleY * 0.7) * 0.5;
    const copyDistance = Math.hypot((x / width - 0.5) * 2.8, (y / height - 0.48) * 2.5);
    const copyAttenuation = 0.43 + smoothstep(0, 0.94, copyDistance) * 0.57;

    context.strokeStyle = palette[Math.round(hue * (palette.length - 1))];
    context.lineWidth = (0.72 + energy * 1.95) * particle.size * size;
    context.globalAlpha = (0.13 + energy * 0.82) * copyAttenuation;
    context.beginPath();
    context.moveTo(x - tipX, y - tipY);
    context.lineTo(x + tipX, y + tipY);
    context.stroke();
  }
  context.globalAlpha = 1;
};
