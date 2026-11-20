import { afterEach, describe, expect, it, vi } from 'vitest';
import { CANONICAL_ORIGIN } from '../src/data/site-origins';
import { createShareCard, shareDataFromDocument } from '../src/site/sharing/card';

type CanvasContextMock = {
  fillStyle: string;
  strokeStyle: string;
  font: string;
  fillRect: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  measureText: (text: string) => { width: number };
};

function measureGlyphWidth(text: string): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        width += 46;
        i += 1;
        continue;
      }
    }
    if (code >= 0xd800 && code <= 0xdfff) {
      width += 20;
    } else if (code >= 0x2e80) {
      width += 46;
    } else {
      width += 24;
    }
  }
  return width;
}

function createCanvasContextMock(): CanvasContextMock {
  return {
    fillStyle: '',
    strokeStyle: '',
    font: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    measureText: (text: string) => ({ width: measureGlyphWidth(text) }),
  };
}

function createDocumentMock({
  meta = {},
  canonical = '',
  title = '',
  mainCtx = createCanvasContextMock(),
  cropCtx = createCanvasContextMock(),
  dataUrl = 'data:image/png;base64,MOCK_CARD',
}: {
  meta?: Record<string, string>;
  canonical?: string;
  title?: string;
  mainCtx?: CanvasContextMock | null;
  cropCtx?: CanvasContextMock | null;
  dataUrl?: string;
} = {}) {
  let canvasCount = 0;
  return {
    title,
    querySelector: (selector: string) => {
      const metaMatch = selector.match(/^meta\[property="([^"]+)"\]$/);
      if (metaMatch) {
        const content = meta[metaMatch[1]];
        return content !== undefined ? { content } : null;
      }
      if (selector === 'link[rel="canonical"]') {
        return canonical ? { href: canonical } : null;
      }
      return null;
    },
    createElement: (tag: string) => {
      if (tag !== 'canvas') throw new Error(`Unexpected element: ${tag}`);
      canvasCount += 1;
      const ctx = canvasCount === 1 ? mainCtx : cropCtx;
      return {
        width: 0,
        height: 0,
        getContext: () => ctx,
        toDataURL: () => dataUrl,
      };
    },
  };
}

function stubBrowserGlobals({
  documentMock,
  origin = CANONICAL_ORIGIN,
  onImageSrc,
}: {
  documentMock: ReturnType<typeof createDocumentMock>;
  origin?: string;
  onImageSrc?: (
    src: string,
    image: { width: number; height: number; onload?: () => void; onerror?: () => void }
  ) => void;
}) {
  vi.stubGlobal('document', documentMock);
  vi.stubGlobal('window', {
    location: { origin },
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  });
  vi.stubGlobal(
    'Image',
    class MockImage {
      width = 1200;
      height = 630;
      onload?: () => void;
      onerror?: () => void;
      private currentSrc = '';
      get src() {
        return this.currentSrc;
      }
      set src(value: string) {
        this.currentSrc = value;
        if (!value) return;
        queueMicrotask(() => {
          if (onImageSrc) onImageSrc(value, this);
          else this.onload?.();
        });
      }
    }
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('shareDataFromDocument', () => {
  it('extracts og metadata, strips brand suffixes, and resolves image against window origin', () => {
    vi.stubGlobal(
      'document',
      createDocumentMock({
        meta: {
          'og:title': 'Research Title · Elexvx Research',
          'og:description': 'Research description',
          'og:image': '/images/cover.png',
        },
        canonical: 'https://www.elexvx.com/research/demo/',
      })
    );
    vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } });

    expect(shareDataFromDocument()).toEqual({
      title: 'Research Title',
      description: 'Research description',
      url: 'https://www.elexvx.com/research/demo/',
      image: 'http://localhost:5173/images/cover.png',
    });
  });

  it('falls back to document.title, default share image, canonical origin, and handles missing window', () => {
    vi.stubGlobal(
      'document',
      createDocumentMock({
        title: '公司介绍 | 宏翔商道-Elexvx',
      })
    );
    vi.stubGlobal('window', undefined);

    expect(shareDataFromDocument()).toEqual({
      title: '公司介绍',
      description: '',
      url: `${CANONICAL_ORIGIN}/`,
      image: '/share/elexvx.png',
    });

    vi.stubGlobal('window', { location: { origin: 'null' } });
    expect(shareDataFromDocument().image).toBe('/share/elexvx.png');
  });
});

describe('createShareCard', () => {
  it('renders Chinese and English cards with QR codes and surrogate-safe line truncation', async () => {
    const mainCtxZh = createCanvasContextMock();
    stubBrowserGlobals({
      documentMock: createDocumentMock({ mainCtx: mainCtxZh }),
    });

    const astralTitle = `${'研'.repeat(18)}${'🚀'.repeat(40)}`;
    const zhCard = await createShareCard(
      {
        title: astralTitle,
        description: 'A'.repeat(90),
        url: 'https://www.elexvx.com/research/demo/',
        image: 'https://www.elexvx.com/images/cover.png',
      },
      'zh-CN'
    );

    expect(zhCard).toBe('data:image/png;base64,MOCK_CARD');
    const fillTextCallsZh = mainCtxZh.fillText.mock.calls.map((call) => String(call[0]));
    const titleLines = mainCtxZh.fillText.mock.calls
      .filter((call) => Number(call[2]) >= 630 && Number(call[2]) < 810)
      .map((call) => String(call[0]));
    expect(fillTextCallsZh).toContain('长按识别二维码，阅读全文');
    expect(titleLines).toHaveLength(3);
    const truncatedTitleLine = titleLines[2];
    expect(truncatedTitleLine).toContain('🚀');
    expect(truncatedTitleLine.endsWith('…')).toBe(true);
    const unpairedSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
    expect(truncatedTitleLine).not.toMatch(unpairedSurrogate);
    for (const line of fillTextCallsZh) {
      expect(line).not.toMatch(unpairedSurrogate);
    }

    const mainCtxEn = createCanvasContextMock();
    stubBrowserGlobals({
      documentMock: createDocumentMock({ mainCtx: mainCtxEn }),
    });
    await createShareCard(
      {
        title: 'Short English Title',
        description: '',
        url: 'https://www.elexvx.com/en/research/demo/',
        image: 'https://www.elexvx.com/images/cover.png',
      },
      'en'
    );
    expect(mainCtxEn.fillText.mock.calls.map((call) => String(call[0]))).toContain('Discover the full story');
    expect(mainCtxEn.drawImage).toHaveBeenCalledTimes(3);
  });

  it('draws fallback cover when image is external or fails to load', async () => {
    const externalCtx = createCanvasContextMock();
    stubBrowserGlobals({
      documentMock: createDocumentMock({ mainCtx: externalCtx }),
    });
    await createShareCard(
      {
        title: 'External Image Card',
        description: 'Fallback cover check',
        url: 'https://www.elexvx.com/research/demo/',
        image: 'https://cdn.other.example/cover.png',
      },
      'en'
    );
    expect(externalCtx.fillRect).toHaveBeenCalledWith(48, 150, 804, 405);

    const failedCtx = createCanvasContextMock();
    stubBrowserGlobals({
      documentMock: createDocumentMock({ mainCtx: failedCtx }),
      onImageSrc: (src, image) => {
        if (src === '/images/broken.png') image.onerror?.();
        else image.onload?.();
      },
    });
    await createShareCard(
      {
        title: 'Broken Cover Card',
        description: 'Fallback cover check',
        url: 'https://www.elexvx.com/research/demo/',
        image: 'https://www.elexvx.com/images/broken.png',
      },
      'zh-CN'
    );
    expect(failedCtx.fillRect).toHaveBeenCalledWith(48, 150, 804, 405);
  });

  it('throws when 2D canvas context is unavailable and rejects on image load timeout', async () => {
    stubBrowserGlobals({
      documentMock: createDocumentMock({ mainCtx: null }),
    });
    await expect(
      createShareCard(
        { title: 'T', description: '', url: 'https://www.elexvx.com/', image: '/share/elexvx.png' },
        'zh-CN'
      )
    ).rejects.toThrow('Canvas unavailable');

    stubBrowserGlobals({
      documentMock: createDocumentMock({ cropCtx: null }),
    });
    await expect(
      createShareCard(
        { title: 'T', description: '', url: 'https://www.elexvx.com/', image: '/share/elexvx.png' },
        'zh-CN'
      )
    ).rejects.toThrow('Canvas unavailable');

    vi.useFakeTimers();
    stubBrowserGlobals({
      documentMock: createDocumentMock(),
      onImageSrc: () => {
        // Never invoke onload or onerror to trigger load timeout.
      },
    });
    const pending = createShareCard(
      { title: 'T', description: '', url: 'https://www.elexvx.com/', image: '/share/elexvx.png' },
      'en'
    );
    const rejection = expect(pending).rejects.toThrow('Image timeout');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
  });
});
