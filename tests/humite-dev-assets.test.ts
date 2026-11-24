import { request as httpRequest } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startHumiteDevAssetServer } from '../scripts/humite-dev-assets';

const sendRawRequest = (origin: string, path: string, method = 'GET') =>
  new Promise<{ status: number; headers: Record<string, string | string[] | undefined>; body: string }>(
    (resolve, reject) => {
      const target = new URL(origin);
      const req = httpRequest(
        {
          hostname: target.hostname,
          port: target.port,
          path,
          method,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            resolve({
              status: res.statusCode ?? 0,
              headers: res.headers,
              body: Buffer.concat(chunks).toString('utf8'),
            });
          });
        }
      );
      req.on('error', reject);
      req.end();
    }
  );

describe('startHumiteDevAssetServer', () => {
  let assetServer: Awaited<ReturnType<typeof startHumiteDevAssetServer>>;

  beforeAll(async () => {
    assetServer = await startHumiteDevAssetServer();
  });

  afterAll(async () => {
    await assetServer.close();
  });

  it('serves the Humite showcase index page with query params', async () => {
    const response = await fetch(`${assetServer.origin}/visuals/humite-library/index.html?theme=light`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('观文藏阁');
  });

  it.each(['/visuals/humite-library/', '/visuals/humite-library'])(
    'serves directory index.html for %s',
    async (path) => {
      const response = await fetch(`${assetServer.origin}${path}`);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      expect(html).toContain('观文藏阁');
    }
  );

  it.each([
    ['/visuals/humite-library/assets/MingLibrarySerif.woff2', 'font/woff2'],
    ['/products/humite-cover-textured.png', 'image/png'],
    ['/optimized/001af0c6e0c9d9d8-1254.webp', 'image/webp'],
  ])('serves %s with content-type %s on HEAD', async (path, expectedType) => {
    const response = await fetch(`${assetServer.origin}${path}`, { method: 'HEAD' });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(expectedType);
  });

  it.each(['/../humite-content.ts', '/%2e%2e/humite-content.ts', '/missing.txt'])(
    'returns 404 for traversal or missing path %s',
    async (path) => {
      const response = await sendRawRequest(assetServer.origin, path);

      expect(response.status).toBe(404);
    }
  );

  it('returns 405 for non-GET/HEAD methods', async () => {
    const response = await fetch(`${assetServer.origin}/visuals/humite-library/index.html`, { method: 'POST' });

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
  });
});
