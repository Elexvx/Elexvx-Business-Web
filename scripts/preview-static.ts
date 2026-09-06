import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, resolve } from 'node:path';

const distRoot = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 4174);

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

const safePath = (pathname: string) => {
  const decoded = decodeURIComponent(pathname);
  const candidate = resolve(distRoot, `.${normalize(decoded)}`);
  const fromRoot = relative(distRoot, candidate);
  return !fromRoot.startsWith('..') && !fromRoot.includes('..' + '/') ? candidate : null;
};

const findFile = (pathname: string) => {
  const target = safePath(pathname);
  if (!target) return null;

  const candidates = [
    target,
    join(target, 'index.html'),
    pathname.endsWith('/') ? null : `${target}.html`,
    join(distRoot, '404.html'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
};

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  const file = findFile(pathname);

  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(file === join(distRoot, '404.html') ? 404 : 200, {
    'Cache-Control': 'no-cache',
    'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static export preview: http://127.0.0.1:${port}`);
});
