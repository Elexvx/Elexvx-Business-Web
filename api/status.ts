import { handleRequest } from '../src/server/esa/gateway';

export default {
  async fetch(request: Request): Promise<Response> {
    return handleRequest(
      request,
      { waitUntil: () => undefined },
      { UPTIMEROBOT_API_KEY: process.env.UPTIMEROBOT_API_KEY }
    );
  },
};
