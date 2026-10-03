import { handleRequest, type EsaEnvironment } from './gateway';

declare const __ESA_NOT_FOUND_HTML__: string;

export default {
  fetch(request: Request, context: { waitUntil(task: Promise<unknown>): void }, env: EsaEnvironment) {
    return handleRequest(request, context, env, {
      // ESA treats a fetch to the current hostname as an origin request. Use
      // another binding of this same project to reach its hosted static files.
      origin:
        new URL(request.url).hostname === 'esa-migration-preview.elexvx.com'
          ? 'https://www.elexvx.com'
          : 'https://esa-migration-preview.elexvx.com',
      prefix: '/_esa-assets',
      notFoundHtml: __ESA_NOT_FOUND_HTML__,
    });
  },
};
