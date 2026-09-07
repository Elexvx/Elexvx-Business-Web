import QRCode from 'qrcode';

export type ShareData = { title: string; description: string; url: string; image: string };

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.src = '';
      reject(new Error('Image timeout'));
    }, 10000);
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
  return {
    title: meta('og:title').replace(/ · Elexvx Research$/, '') || document.title,
    description: meta('og:description'),
    url: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || 'https://www.elexvx.com/',
    image: meta('og:image') || '/share/elexvx.png',
  };
}

export async function createShareCard(data: ShareData, en: boolean): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#f7f7f5';
  ctx.fillRect(0, 0, 900, 1200);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 900, 114);
  ctx.font = 'bold 38px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('Elexvx', 48, 73);
  ctx.font = '18px Arial';
  ctx.fillStyle = '#bbb';
  ctx.fillText('RESEARCH & ENGINEERING', 530, 69);
  // Only load our own image assets. A failed cover still produces a useful branded card.
  try {
    const url = new URL(data.image, window.location.origin);
    if (url.origin !== new URL(data.url).origin && url.origin !== window.location.origin)
      throw new Error('External image');
    const cover = await loadImage(url.pathname);
    const scale = Math.min(804 / cover.width, 405 / cover.height);
    ctx.fillStyle = '#eaeae7';
    ctx.fillRect(48, 150, 804, 405);
    ctx.drawImage(
      cover,
      48 + (804 - cover.width * scale) / 2,
      150 + (405 - cover.height * scale) / 2,
      cover.width * scale,
      cover.height * scale
    );
  } catch {
    ctx.fillStyle = '#181818';
    ctx.fillRect(48, 150, 804, 405);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px Arial';
    ctx.fillText('Elexvx', 95, 375);
  }
  const lines = (text: string, y: number, size: number, maxLines: number, color: string) => {
    ctx.font = `${size >= 40 ? '600 ' : ''}${size}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = color;
    const chars = Array.from(text);
    let line = '',
      row = 0;
    for (let i = 0; i < chars.length; i++) {
      const next = line + chars[i];
      if (ctx.measureText(next).width > 800) {
        if (row === maxLines - 1) {
          while (ctx.measureText(line + '…').width > 800) line = line.slice(0, -1);
          ctx.fillText(line + '…', 48, y + row * size * 1.45);
          return;
        }
        ctx.fillText(line, 48, y + row * size * 1.45);
        row++;
        line = chars[i];
      } else line = next;
    }
    ctx.fillText(line, 48, y + row * size * 1.45);
  };
  lines(data.title, 630, 46, 3, '#111');
  lines(data.description, 844, 25, 3, '#555');
  ctx.strokeStyle = '#d4d4d0';
  ctx.beginPath();
  ctx.moveTo(48, 978);
  ctx.lineTo(852, 978);
  ctx.stroke();
  const qr = await loadImage(await QRCode.toDataURL(data.url, { width: 168, margin: 4, errorCorrectionLevel: 'M' }));
  ctx.drawImage(qr, 684, 1004, 168, 168);
  ctx.fillStyle = '#111';
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText(en ? 'Discover the full story' : '长按识别二维码，阅读全文', 48, 1066);
  ctx.fillStyle = '#666';
  ctx.font = '22px Arial';
  ctx.fillText('www.elexvx.com', 48, 1110);
  return canvas.toDataURL('image/png');
}
