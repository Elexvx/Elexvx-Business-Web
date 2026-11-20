import type { ColorTheme } from '../providers/theme-provider';

export type SnowFlake = {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  driftX: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  rotation: number;
  spin: number;
  opacity: number;
  crystal: boolean;
};

export type RibbonParticle = {
  x: number;
  y: number;
  length: number;
  width: number;
  speedY: number;
  driftX: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  angle: number;
  spin: number;
  flipPhase: number;
  flipSpeed: number;
  curve: number;
  opacity: number;
  frontColor: string;
  backColor: string;
};

const SNOW_AREA_PER_FLAKE = 22_000;
const SNOW_MIN_COUNT = 28;
const SNOW_MAX_COUNT = 72;
const SNOW_CRYSTAL_RATIO = 0.24;
const SNOW_WRAP_MARGIN_PX = 16;
const SNOW_SWAY_FACTOR = 0.45;

const RIBBON_AREA_PER_PARTICLE = 28_000;
const RIBBON_MIN_COUNT = 22;
const RIBBON_MAX_COUNT = 54;
const RIBBON_WRAP_MARGIN_PX = 40;
const RIBBON_SWAY_FACTOR = 0.55;

const RIBBON_PALETTE: ReadonlyArray<{ front: string; back: string }> = [
  { front: '#dc2626', back: '#991b1b' },
  { front: '#e11d48', back: '#9f1239' },
  { front: '#ef4444', back: '#b91c1c' },
  { front: '#c81e1e', back: '#f59e0b' },
  { front: '#f43f5e', back: '#be123c' },
];

const clampCount = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(value)));

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

export const createSnowFlakes = (width: number, height: number): SnowFlake[] => {
  const count = clampCount((width * height) / SNOW_AREA_PER_FLAKE, SNOW_MIN_COUNT, SNOW_MAX_COUNT);
  return Array.from({ length: count }, () => {
    const crystal = Math.random() < SNOW_CRYSTAL_RATIO;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: crystal ? randomRange(4.5, 8.5) : randomRange(1.4, 3.4),
      speedY: crystal ? randomRange(18, 34) : randomRange(24, 52),
      driftX: randomRange(3, 12),
      swayAmp: randomRange(10, 26),
      swayFreq: randomRange(0.45, 1.15),
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: randomRange(-0.45, 0.45),
      opacity: crystal ? randomRange(0.42, 0.78) : randomRange(0.35, 0.85),
      crystal,
    };
  });
};

const drawCrystalFlake = (ctx: CanvasRenderingContext2D, radius: number) => {
  const branchPos = radius * 0.58;
  const branchLen = radius * 0.32;
  ctx.beginPath();
  for (let arm = 0; arm < 6; arm += 1) {
    const angle = (arm * Math.PI) / 3;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.moveTo(0, 0);
    ctx.lineTo(cos * radius, sin * radius);

    const bx = cos * branchPos;
    const by = sin * branchPos;
    const leftAngle = angle - Math.PI / 4;
    const rightAngle = angle + Math.PI / 4;
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(leftAngle) * branchLen, by + Math.sin(leftAngle) * branchLen);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(rightAngle) * branchLen, by + Math.sin(rightAngle) * branchLen);
  }
  ctx.stroke();
};

const drawSnowFlake = (ctx: CanvasRenderingContext2D, flake: SnowFlake, theme: ColorTheme) => {
  const isLight = theme === 'light';
  const strokeColor = isLight
    ? `rgba(110, 142, 178, ${flake.opacity * 0.88})`
    : `rgba(232, 244, 255, ${flake.opacity})`;
  const fillColor = isLight ? `rgba(126, 158, 194, ${flake.opacity * 0.72})` : `rgba(255, 255, 255, ${flake.opacity})`;

  ctx.save();
  ctx.translate(flake.x, flake.y);

  if (flake.crystal) {
    ctx.rotate(flake.rotation);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.15;
    ctx.lineCap = 'round';
    drawCrystalFlake(ctx, flake.radius);
  } else {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(0, 0, flake.radius, 0, Math.PI * 2);
    ctx.fill();
    if (isLight) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.7})`;
      ctx.beginPath();
      ctx.arc(-flake.radius * 0.22, -flake.radius * 0.22, flake.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
};

export const createRibbons = (width: number, height: number): RibbonParticle[] => {
  const count = clampCount((width * height) / RIBBON_AREA_PER_PARTICLE, RIBBON_MIN_COUNT, RIBBON_MAX_COUNT);
  return Array.from({ length: count }, (_, index) => {
    const palette = RIBBON_PALETTE[index % RIBBON_PALETTE.length];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      length: randomRange(20, 38),
      width: randomRange(4.2, 7.5),
      speedY: randomRange(44, 86),
      driftX: randomRange(-12, 18),
      swayAmp: randomRange(14, 34),
      swayFreq: randomRange(0.7, 1.5),
      swayPhase: Math.random() * Math.PI * 2,
      angle: randomRange(-0.7, 0.7),
      spin: randomRange(-1.2, 1.2),
      flipPhase: Math.random() * Math.PI * 2,
      flipSpeed: randomRange(2.1, 4.6),
      curve: randomRange(3.5, 8.5),
      opacity: randomRange(0.72, 0.94),
      frontColor: palette.front,
      backColor: palette.back,
    };
  });
};

const drawRibbon = (ctx: CanvasRenderingContext2D, ribbon: RibbonParticle) => {
  const halfLen = ribbon.length * 0.5;
  const twist = Math.cos(ribbon.flipPhase);
  const halfWidth = Math.max(0.24, Math.abs(twist)) * ribbon.width * 0.5;
  const bend = ribbon.curve * Math.sin(ribbon.flipPhase * 0.65);

  ctx.save();
  ctx.translate(ribbon.x, ribbon.y);
  ctx.rotate(ribbon.angle);
  ctx.globalAlpha = ribbon.opacity;
  ctx.fillStyle = twist >= 0 ? ribbon.frontColor : ribbon.backColor;

  ctx.beginPath();
  ctx.moveTo(-halfLen, -halfWidth);
  ctx.bezierCurveTo(-halfLen * 0.3, -halfWidth + bend, halfLen * 0.3, -halfWidth - bend, halfLen, -halfWidth * 0.75);
  ctx.lineTo(halfLen, halfWidth * 0.75);
  ctx.bezierCurveTo(halfLen * 0.3, halfWidth - bend, -halfLen * 0.3, halfWidth + bend, -halfLen, halfWidth);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

export const stepAndDrawSnowFlakes = (
  ctx: CanvasRenderingContext2D,
  flakes: SnowFlake[],
  width: number,
  height: number,
  elapsed: number,
  dt: number,
  theme: ColorTheme
) => {
  for (const flake of flakes) {
    if (dt > 0) {
      flake.y += flake.speedY * dt;
      flake.x +=
        (flake.driftX + Math.sin(elapsed * flake.swayFreq + flake.swayPhase) * flake.swayAmp * SNOW_SWAY_FACTOR) * dt;
      flake.rotation += flake.spin * dt;
      if (flake.y > height + SNOW_WRAP_MARGIN_PX) {
        flake.y = -SNOW_WRAP_MARGIN_PX;
        flake.x = Math.random() * width;
      }
      if (flake.x > width + SNOW_WRAP_MARGIN_PX) flake.x = -SNOW_WRAP_MARGIN_PX;
      else if (flake.x < -SNOW_WRAP_MARGIN_PX) flake.x = width + SNOW_WRAP_MARGIN_PX;
    }
    drawSnowFlake(ctx, flake, theme);
  }
};

export const stepAndDrawRibbons = (
  ctx: CanvasRenderingContext2D,
  ribbons: RibbonParticle[],
  width: number,
  height: number,
  elapsed: number,
  dt: number
) => {
  for (const ribbon of ribbons) {
    if (dt > 0) {
      ribbon.y += ribbon.speedY * dt;
      ribbon.x +=
        (ribbon.driftX + Math.sin(elapsed * ribbon.swayFreq + ribbon.swayPhase) * ribbon.swayAmp * RIBBON_SWAY_FACTOR) *
        dt;
      ribbon.angle += ribbon.spin * dt;
      ribbon.flipPhase += ribbon.flipSpeed * dt;
      if (ribbon.y > height + RIBBON_WRAP_MARGIN_PX) {
        ribbon.y = -RIBBON_WRAP_MARGIN_PX;
        ribbon.x = Math.random() * width;
      }
      if (ribbon.x > width + RIBBON_WRAP_MARGIN_PX) ribbon.x = -RIBBON_WRAP_MARGIN_PX;
      else if (ribbon.x < -RIBBON_WRAP_MARGIN_PX) ribbon.x = width + RIBBON_WRAP_MARGIN_PX;
    }
    drawRibbon(ctx, ribbon);
  }
};
