export type Particle = {
  x: number;
  y: number;
  size: number;
};

type Point = { x: number; y: number };
type SpringAxis = { position: number; velocity: number };
type ParticleFrame = {
  width: number;
  height: number;
  time: number;
  center: Point;
};

const SEED = 20261201;
const AREA_PER_PARTICLE = 1350;
const COMPACT_AREA_PER_PARTICLE = 900;
const MAX_PARTICLES = 760;
const RAMP_STEPS = 48;
const PLACEMENT_ATTEMPTS_MULTIPLIER = 14;
const POISSON_SPACING_RATIO = 0.54;
const BASE_PARTICLE_SIZE = 0.68;
const RANDOM_PARTICLE_SIZE_RANGE = 0.45;

const FIELD_HEIGHT_WEIGHT = 1.2;
const FIELD_REFERENCE_SIZE = 760;
const MIN_VERTICAL_STRETCH = 0.92;
const MAX_VERTICAL_STRETCH = 1.48;
const MIN_PARTICLE_SCALE = 0.77;
const MAX_PARTICLE_SCALE = 1.1;

const COMPACT_WIDTH_MIN = 420;
const COMPACT_WIDTH_MAX = 760;
const COMPACT_PARTICLE_SCALE = 0.96;
const COMPACT_RADIUS_BOOST = 0.1;
const COMPACT_CREST_WIDTH_BOOST = 0.042;
const COMPACT_WAKE_WIDTH_BOOST = 0.045;
const COMPACT_BASE_ALPHA_BOOST = 0.11;
const COMPACT_LINE_WIDTH_BOOST = 0.35;
const COMPACT_HALF_LENGTH_BOOST = 0.18;
const COMPACT_COPY_ATTENUATION_BOOST = 0.09;

const DRIFT_AMP_PX = 8;
const DRIFT_BAND_WEIGHT = 0.052;
const CREST_WIDTH = 0.088;
const WAKE_LAG = 0.104;
const WAKE_WIDTH = 0.105;
const CREST_ENERGY_WEIGHT = 0.79;
const WAKE_ENERGY_WEIGHT = 0.23;
const RADIAL_DISPLACEMENT_RATIO = 0.047;
const TANGENTIAL_SWIRL_RATIO = 0.6;
const BASE_ALPHA = 0.17;
const ENERGY_ALPHA_GAIN = 0.82;
const BASE_LINE_WIDTH = 0.72;
const ENERGY_LINE_WIDTH_GAIN = 1.95;
const BASE_HALF_LENGTH = 0.19;
const ENERGY_HALF_LENGTH_GAIN = 3.9;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothstep = (min: number, max: number, value: number) => {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
};

const getCompactFactor = (width: number) => 1 - smoothstep(COMPACT_WIDTH_MIN, COMPACT_WIDTH_MAX, width);

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

export const buildParticles = (width: number, height: number): Particle[] => {
  const area = width * height;
  const compact = getCompactFactor(width);
  const areaPerParticle = AREA_PER_PARTICLE + (COMPACT_AREA_PER_PARTICLE - AREA_PER_PARTICLE) * compact;
  const count = clamp(Math.round(area / areaPerParticle), 1, MAX_PARTICLES);
  const spacingSquared = (area / count) * POISSON_SPACING_RATIO;
  const random = createSeededRandom(SEED);
  const particles: Particle[] = [];

  // Poisson disk placement keeps a minimum gap without leaving visible rows.
  for (let attempt = 0; attempt < count * PLACEMENT_ATTEMPTS_MULTIPLIER && particles.length < count; attempt++) {
    const x = random() * width;
    const y = random() * height;
    const hasNeighbor = particles.some((point) => (point.x - x) ** 2 + (point.y - y) ** 2 < spacingSquared);
    if (!hasNeighbor) particles.push({ x, y, size: BASE_PARTICLE_SIZE + random() * RANDOM_PARTICLE_SIZE_RANGE });
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
  x: 0.48 + Math.sin(time * 0.32 - 0.7) * 0.19 + Math.sin(time * 0.59) * 0.055,
  y: 0.49 + Math.sin(time * 0.4 - 0.55) * 0.14 + Math.cos(time * 0.73) * 0.035,
});

export const advanceSpring = (axis: SpringAxis, target: number, response: number, seconds: number) => {
  // Critical damping preserves velocity when the pointer changes direction or leaves.
  const offset = axis.position - target;
  const momentum = axis.velocity + response * offset;
  const decay = Math.exp(-response * seconds);
  axis.position = target + (offset + momentum * seconds) * decay;
  axis.velocity = (axis.velocity - response * momentum * seconds) * decay;
};

type FieldFrameMetrics = {
  width: number;
  height: number;
  time: number;
  fieldSize: number;
  verticalStretch: number;
  centerX: number;
  centerY: number;
  radius: number;
  sizeScale: number;
  crestWidth: number;
  wakeWidth: number;
  baseAlpha: number;
  baseLineWidth: number;
  baseHalfLength: number;
  minCopyAttenuation: number;
  headingX: number;
  headingY: number;
};

const computeFieldMetrics = ({ width, height, time, center }: ParticleFrame): FieldFrameMetrics => {
  const fieldSize = Math.min(width, height * FIELD_HEIGHT_WEIGHT);
  const compact = getCompactFactor(width);
  const heading = time * 0.28 - 0.6 + Math.sin(time * 0.49) * 0.3;
  return {
    width,
    height,
    time,
    fieldSize,
    verticalStretch: clamp(height / width, MIN_VERTICAL_STRETCH, MAX_VERTICAL_STRETCH),
    centerX: center.x * width,
    centerY: center.y * height,
    radius:
      fieldSize *
      (0.28 + COMPACT_RADIUS_BOOST * compact + 0.031 * Math.sin(time * 0.72) + 0.012 * Math.sin(time * 1.31 + 0.7)),
    sizeScale: Math.max(
      clamp(fieldSize / FIELD_REFERENCE_SIZE, MIN_PARTICLE_SCALE, MAX_PARTICLE_SCALE),
      COMPACT_PARTICLE_SCALE * compact
    ),
    crestWidth: CREST_WIDTH + COMPACT_CREST_WIDTH_BOOST * compact,
    wakeWidth: WAKE_WIDTH + COMPACT_WAKE_WIDTH_BOOST * compact,
    baseAlpha: BASE_ALPHA + COMPACT_BASE_ALPHA_BOOST * compact,
    baseLineWidth: BASE_LINE_WIDTH + COMPACT_LINE_WIDTH_BOOST * compact,
    baseHalfLength: BASE_HALF_LENGTH + COMPACT_HALF_LENGTH_BOOST * compact,
    minCopyAttenuation: 0.43 + COMPACT_COPY_ATTENUATION_BOOST * compact,
    headingX: Math.cos(heading),
    headingY: Math.sin(heading),
  };
};

const drawSingleParticle = (
  context: CanvasRenderingContext2D,
  particle: Particle,
  palette: readonly string[],
  metrics: FieldFrameMetrics
) => {
  const driftX = Math.sin(particle.x * 0.008 + particle.y * 0.005 - metrics.time * 0.52);
  const driftY = Math.cos(particle.y * 0.009 - particle.x * 0.005 + metrics.time * 0.43);
  const px = particle.x + driftY * DRIFT_AMP_PX;
  const py = particle.y + driftX * DRIFT_AMP_PX;
  const dx = px - metrics.centerX;
  const dy = (py - metrics.centerY) / metrics.verticalStretch;
  const distance = Math.hypot(dx, dy);
  const radialX = dx / Math.max(1, distance);
  const radialY = dy / Math.max(1, distance);
  const alongWave = radialX * metrics.headingX + radialY * metrics.headingY;
  const acrossWave = radialY * metrics.headingX - radialX * metrics.headingY;

  // Give the advancing arc a crest and a fainter wake that tapers out along the curve.
  const band = (distance - metrics.radius) / metrics.fieldSize + (driftX + driftY * 0.45) * DRIFT_BAND_WEIGHT;
  const crest = Math.exp(-((band / metrics.crestWidth) ** 2));
  const wake = Math.exp(-(((band + WAKE_LAG) / metrics.wakeWidth) ** 2));
  const leadingArc = 0.25 + smoothstep(-0.65, 0.82, alongWave) * 0.75;
  const trailingArc = smoothstep(-0.4, 0.9, acrossWave);
  const energy = crest * leadingArc * CREST_ENERGY_WEIGHT + wake * trailingArc * WAKE_ENERGY_WEIGHT;
  const offset = energy * metrics.fieldSize * RADIAL_DISPLACEMENT_RATIO;

  const x = px + (radialX - radialY * TANGENTIAL_SWIRL_RATIO) * offset;
  const y = py + (radialY + radialX * TANGENTIAL_SWIRL_RATIO) * offset * metrics.verticalStretch;
  const angle = Math.atan2(dy, dx) + 0.42 + driftX * 0.56 + driftY * 0.25;
  const halfLength = (metrics.baseHalfLength + energy * ENERGY_HALF_LENGTH_GAIN) * particle.size * metrics.sizeScale;
  const tipX = Math.cos(angle) * halfLength;
  const tipY = Math.sin(angle) * halfLength;

  // Neighbors share a color because the ramp is sampled in space and time.
  const hue = 0.5 + Math.sin(x * 0.007 - y * 0.006 + metrics.time * 0.43 + driftY * 0.7) * 0.5;
  const copyDistance = Math.hypot((x / metrics.width - 0.5) * 2.8, (y / metrics.height - 0.48) * 2.5);
  const copyAttenuation =
    metrics.minCopyAttenuation + smoothstep(0, 0.94, copyDistance) * (1 - metrics.minCopyAttenuation);

  context.strokeStyle = palette[Math.round(hue * (palette.length - 1))];
  context.lineWidth = (metrics.baseLineWidth + energy * ENERGY_LINE_WIDTH_GAIN) * particle.size * metrics.sizeScale;
  context.globalAlpha = clamp((metrics.baseAlpha + energy * ENERGY_ALPHA_GAIN) * copyAttenuation, 0, 1);
  context.beginPath();
  context.moveTo(x - tipX, y - tipY);
  context.lineTo(x + tipX, y + tipY);
  context.stroke();
};

export const drawParticles = (
  context: CanvasRenderingContext2D,
  particles: Particle[],
  palette: readonly string[],
  frame: ParticleFrame
) => {
  context.clearRect(0, 0, frame.width, frame.height);
  context.lineCap = 'round';
  const metrics = computeFieldMetrics(frame);
  for (const particle of particles) {
    drawSingleParticle(context, particle, palette, metrics);
  }
  context.globalAlpha = 1;
};
