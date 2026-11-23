import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const parsePathname = (rawUrl = '/') => {
  try {
    if (/^https?:\/\//i.test(rawUrl)) {
      return new URL(rawUrl).pathname;
    }
    const normalizedStart = rawUrl.startsWith('/') ? rawUrl.replace(/^\/+/, '/') : `/${rawUrl}`;
    return new URL(normalizedStart, 'http://127.0.0.1').pathname;
  } catch {
    return null;
  }
};

const safeResolveAsset = (assetRoot: string, pathname: string) => {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decoded.includes('\0') || decoded.split(/[\\/]/).includes('..')) {
    return null;
  }

  const candidate = resolve(assetRoot, `.${normalize(decoded)}`);
  const fromRoot = relative(assetRoot, candidate);
  if (isAbsolute(fromRoot) || fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
    return null;
  }

  return candidate;
};

const statSafe = async (target: string) => {
  try {
    return await stat(target);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return null;
    }
    throw error;
  }
};

const findAssetFile = async (assetRoot: string, pathname: string) => {
  const candidate = safeResolveAsset(assetRoot, pathname);
  if (!candidate) return null;

  const candidateStat = await statSafe(candidate);
  if (!candidateStat) return null;

  if (candidateStat.isFile()) {
    return { file: candidate, size: candidateStat.size };
  }

  if (candidateStat.isDirectory()) {
    const indexFile = join(candidate, 'index.html');
    const indexStat = await statSafe(indexFile);
    if (indexStat?.isFile()) {
      return { file: indexFile, size: indexStat.size };
    }
  }

  return null;
};

export async function startHumiteDevAssetServer(
  root = resolve(process.cwd(), 'release-assets/humite')
): Promise<{ origin: string; close: () => Promise<void> }> {
  const assetRoot = resolve(root);

  const server = createServer((request, response) => {
    void (async () => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, {
          Allow: 'GET, HEAD',
          'Content-Type': 'text/plain; charset=utf-8',
        });
        response.end('Method Not Allowed');
        return;
      }

      const pathname = parsePathname(request.url);
      const resolved = pathname ? await findAssetFile(assetRoot, pathname) : null;
      if (!resolved) {
        response.writeHead(404, {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/plain; charset=utf-8',
        });
        response.end('Not found');
        return;
      }

      const contentType = contentTypes[extname(resolved.file).toLowerCase()] ?? 'application/octet-stream';
      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Length': String(resolved.size),
        'Content-Type': contentType,
      });

      if (request.method === 'HEAD') {
        response.end();
        return;
      }

      const stream = createReadStream(resolved.file);
      stream.on('error', () => {
        if (!response.headersSent) {
          response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        }
        response.destroy();
      });
      stream.pipe(response);
    })().catch(() => {
      if (!response.headersSent) {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      if (!response.writableEnded) {
        response.end('Internal Server Error');
      }
    });
  });

  await new Promise<void>((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', rejectListen);
      resolveListen();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to determine Humite dev asset server port.');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => {
      if (!server.listening) return Promise.resolve();
      return new Promise<void>((resolveClose, rejectClose) => {
        server.closeAllConnections?.();
        server.close((error) => {
          if (error) rejectClose(error);
          else resolveClose();
        });
      });
    },
  };
}
