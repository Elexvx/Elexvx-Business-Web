import { handleRequest, type EsaEnvironment } from './gateway';

declare const __ESA_NOT_FOUND_HTML__: string;

export default {
  fetch(request: Request, context: { waitUntil(task: Promise<unknown>): void }, env: EsaEnvironment) {
    return handleRequest(request, context, env, {
      origin: new URL(request.url).origin,
      prefix: '/_esa-assets',
      notFoundHtml: __ESA_NOT_FOUND_HTML__,
    });
  },
};
