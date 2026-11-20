import QRCode from 'qrcode';
import { CANONICAL_ORIGIN } from '../../data/site-origins';
import type { Locale } from '../providers/i18n';

type ShareData = { title: string; description: string; url: string; image: string };

const IMAGE_LOAD_TIMEOUT_MS = 10_000;

const CARD_LAYOUT = {
  width: 900,
  height: 1200,
  paddingX: 48,
  headerHeight: 114,
  logoX: 48,
  logoY: 35,
  logoWidth: 200,
  logoHeight: 44,
  taglineX: 530,
  taglineY: 69,
  coverY: 150,
  coverWidth: 804,
  coverHeight: 405,
  fallbackLogoX: 95,
  fallbackLogoY: 295,
  fallbackLogoWidth: 420,
  fallbackLogoHeight: 92,
  textMaxWidth: 800,
  lineHeightRatio: 1.45,
  titleY: 630,
  titleSize: 46,
  titleMaxLines: 3,
  descriptionOffsetY: 56,
  descriptionSize: 25,
  descriptionMaxLines: 3,
  dividerOffsetY: 44,
  dividerRightX: 852,
  qrSize: 168,
  qrX: 684,
  qrOffsetY: 26,
  footerPromptOffsetY: 88,
  footerUrlOffsetY: 132,
  footerBottomPadding: 222,
} as const;

const CARD_PALETTE = {
  background: '#f7f7f5',
  headerBackground: '#111',
  headerTagline: '#bbb',
  coverFallbackBackground: '#181818',
  title: '#111',
  description: '#555',
  divider: '#d4d4d0',
  footerPrompt: '#111',
  footerUrl: '#666',
} as const;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.src = '';
      reject(new Error('Image timeout'));
    }, IMAGE_LOAD_TIMEOUT_MS);
    image.onload = () => {
      clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Image unavailable'));
    };
    image.src = src;
  });

/** Keep the production canonical URL: never put localhost or tracking tokens into a QR code. */
export function shareDataFromDocument(): ShareData {
  const meta = (name: string) => document.querySelector<HTMLMetaElement>(`meta[property="${name}"]`)?.content || '';
  const rawTitle = meta('og:title') || document.title;
  const rawImage = meta('og:image') || '/share/elexvx.png';
  const origin =
    typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : undefined;
  return {
    title: rawTitle.replace(/\s*(?:·\s*Elexvx Research|\|\s*宏翔商道-Elexvx)$/u, '') || rawTitle,
    description: meta('og:description'),
    url: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || `${CANONICAL_ORIGIN}/`,
    image: origin ? new URL(rawImage, origin).href : rawImage,
  };
}

function drawCardHeader(ctx: CanvasRenderingContext2D, brandLogo: HTMLImageElement) {
  ctx.fillStyle = CARD_PALETTE.background;
  ctx.fillRect(0, 0, CARD_LAYOUT.width, CARD_LAYOUT.height);
  ctx.fillStyle = CARD_PALETTE.headerBackground;
  ctx.fillRect(0, 0, CARD_LAYOUT.width, CARD_LAYOUT.headerHeight);
  ctx.drawImage(brandLogo, CARD_LAYOUT.logoX, CARD_LAYOUT.logoY, CARD_LAYOUT.logoWidth, CARD_LAYOUT.logoHeight);
  ctx.font = '18px Arial';
  ctx.fillStyle = CARD_PALETTE.headerTagline;
  ctx.fillText('RESEARCH & ENGINEERING', CARD_LAYOUT.taglineX, CARD_LAYOUT.taglineY);
}

async function drawCoverImage(ctx: CanvasRenderingContext2D, data: ShareData, brandLogo: HTMLImageElement) {
  // Only load our own image assets. A failed cover still produces a useful branded card.
  try {
    const url = new URL(data.image, window.location.origin);
    if (url.origin !== new URL(data.url).origin && url.origin !== window.location.origin)
      throw new Error('External image');
    const cover = await loadImage(url.pathname);
    // Crop to fill the cover area without side gutters or distortion.
    const scale = Math.max(CARD_LAYOUT.coverWidth / cover.width, CARD_LAYOUT.coverHeight / cover.height);
    const sourceWidth = CARD_LAYOUT.coverWidth / scale;
    const sourceHeight = CARD_LAYOUT.coverHeight / scale;
    ctx.drawImage(
      cover,
      (cover.width - sourceWidth) / 2,
      (cover.height - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      CARD_LAYOUT.paddingX,
      CARD_LAYOUT.coverY,
      CARD_LAYOUT.coverWidth,
      CARD_LAYOUT.coverHeight
    );
  } catch {
    ctx.fillStyle = CARD_PALETTE.coverFallbackBackground;
    ctx.fillRect(CARD_LAYOUT.paddingX, CARD_LAYOUT.coverY, CARD_LAYOUT.coverWidth, CARD_LAYOUT.coverHeight);
    ctx.drawImage(
      brandLogo,
      CARD_LAYOUT.fallbackLogoX,
      CARD_LAYOUT.fallbackLogoY,
      CARD_LAYOUT.fallbackLogoWidth,
      CARD_LAYOUT.fallbackLogoHeight
    );
  }
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  size: number,
  maxLines: number,
  color: string
): number {
  ctx.font = `${size >= 40 ? '600 ' : ''}${size}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = color;
  const chars = Array.from(text);
  let line = '';
  let row = 0;
  for (let i = 0; i < chars.length; i++) {
    const next = line + chars[i];
    if (ctx.measureText(next).width > CARD_LAYOUT.textMaxWidth) {
      if (row === maxLines - 1) {
        while (ctx.measureText(line + '…').width > CARD_LAYOUT.textMaxWidth) {
          line = Array.from(line).slice(0, -1).join('');
        }
        const lineY = y + row * size * CARD_LAYOUT.lineHeightRatio;
        ctx.fillText(line + '…', CARD_LAYOUT.paddingX, lineY);
        return lineY;
      }
      ctx.fillText(line, CARD_LAYOUT.paddingX, y + row * size * CARD_LAYOUT.lineHeightRatio);
      row++;
      line = chars[i];
    } else {
      line = next;
    }
  }
  const finalY = y + row * size * CARD_LAYOUT.lineHeightRatio;
  ctx.fillText(line, CARD_LAYOUT.paddingX, finalY);
  return finalY;
}

async function drawCardFooter(ctx: CanvasRenderingContext2D, url: string, dividerY: number, locale: Locale) {
  ctx.strokeStyle = CARD_PALETTE.divider;
  ctx.beginPath();
  ctx.moveTo(CARD_LAYOUT.paddingX, dividerY);
  ctx.lineTo(CARD_LAYOUT.dividerRightX, dividerY);
  ctx.stroke();

  const qr = await loadImage(
    await QRCode.toDataURL(url, { width: CARD_LAYOUT.qrSize, margin: 4, errorCorrectionLevel: 'M' })
  );
  ctx.drawImage(qr, CARD_LAYOUT.qrX, dividerY + CARD_LAYOUT.qrOffsetY, CARD_LAYOUT.qrSize, CARD_LAYOUT.qrSize);
  ctx.fillStyle = CARD_PALETTE.footerPrompt;
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText(
    locale === 'en' ? 'Discover the full story' : '长按识别二维码，阅读全文',
    CARD_LAYOUT.paddingX,
    dividerY + CARD_LAYOUT.footerPromptOffsetY
  );
  ctx.fillStyle = CARD_PALETTE.footerUrl;
  ctx.font = '22px Arial';
  ctx.fillText('www.elexvx.com', CARD_LAYOUT.paddingX, dividerY + CARD_LAYOUT.footerUrlOffsetY);
}

function cropCanvasHeight(sourceCanvas: HTMLCanvasElement, height: number): string {
  const output = document.createElement('canvas');
  output.width = sourceCanvas.width;
  output.height = height;
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Canvas unavailable');
  outputContext.drawImage(sourceCanvas, 0, 0);
  return output.toDataURL('image/png');
}

export async function createShareCard(data: ShareData, locale: Locale): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_LAYOUT.width;
  canvas.height = CARD_LAYOUT.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const brandLogo = await loadImage('/brand/elexvx-logo-white-600.webp');
  drawCardHeader(ctx, brandLogo);
  await drawCoverImage(ctx, data, brandLogo);

  const titleBottom = drawWrappedText(
    ctx,
    data.title,
    CARD_LAYOUT.titleY,
    CARD_LAYOUT.titleSize,
    CARD_LAYOUT.titleMaxLines,
    CARD_PALETTE.title
  );
  const descriptionBottom = data.description
    ? drawWrappedText(
        ctx,
        data.description,
        titleBottom + CARD_LAYOUT.descriptionOffsetY,
        CARD_LAYOUT.descriptionSize,
        CARD_LAYOUT.descriptionMaxLines,
        CARD_PALETTE.description
      )
    : titleBottom;

  const dividerY = Math.ceil(descriptionBottom + CARD_LAYOUT.dividerOffsetY);
  await drawCardFooter(ctx, data.url, dividerY, locale);
  return cropCanvasHeight(canvas, dividerY + CARD_LAYOUT.footerBottomPadding);
}
