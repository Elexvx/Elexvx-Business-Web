import { handleStatusApi } from '../src/server/status/status-api';

export default {
  async fetch(request: Request): Promise<Response> {
    return handleStatusApi(request, new URL(request.url), process.env.UPTIMEROBOT_API_KEY);
  },
};
