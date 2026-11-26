import { STATUS_HISTORY_LIMITS } from '../../data/status-constants';
import { fetchStatusData } from './uptime-robot';

const STATUS_API_TIMEOUT_MS = 8_000;

const json = (payload: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      ...headers,
    },
  });

export async function handleStatusApi(request: Request, url: URL, apiKey?: string): Promise<Response> {
  if (request.method !== 'GET') return json({ code: 405, message: 'Method not allowed' }, 405, { Allow: 'GET' });
  if (!apiKey) return json({ code: 503, message: '监控服务尚未配置', source: 'api' }, 503);

  try {
    const started = Date.now();
    const result = await fetchStatusData({
      apiKey,
      historyDays:
        url.searchParams.get('days') === String(STATUS_HISTORY_LIMITS.overviewDays)
          ? STATUS_HISTORY_LIMITS.overviewDays
          : STATUS_HISTORY_LIMITS.defaultDays,
      timeoutMs: STATUS_API_TIMEOUT_MS,
      deduplicateRequests: false,
    });
    return json({ code: 200, message: 'success', source: result.source, data: result.data }, 200, {
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=300',
      'Server-Timing': `uptime-robot;dur=${Date.now() - started}`,
    });
  } catch (error) {
    console.error('status.fetch.failed', error instanceof Error ? error.message : String(error));
    return json({ code: 502, message: '监控服务请求失败，请稍后重试', source: 'api' }, 502);
  }
}
