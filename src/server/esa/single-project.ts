import { handleRequest, type EsaEnvironment, type PublishManifest } from './gateway';

declare const __ESA_NOT_FOUND_HTML__: string;
declare const __ESA_PUBLISH_MANIFEST__: PublishManifest;

export default {
  fetch(request: Request, context: { waitUntil(task: Promise<unknown>): void }, env: EsaEnvironment) {
    return handleRequest(request, context, env, __ESA_PUBLISH_MANIFEST__, __ESA_NOT_FOUND_HTML__);
  },
};
