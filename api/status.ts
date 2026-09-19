import type { IncomingMessage, ServerResponse } from 'node:http';

import { isAuthenticated, isPasswordProtectionEnabled } from '../src/server/status/auth.js';
import type { StatusApiResponse } from '../src/data/service-status.js';
import { fetchStatusData } from '../src/server/status/uptime-robot.js';

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const startedAt = Date.now();
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'private, no-store');

  if (request.method !== 'GET') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET');
    response.end(JSON.stringify({ code: 405, message: 'Method not allowed', source: 'api' }));
    return;
  }

  if (!(await isAuthenticated(request))) {
    const payload: StatusApiResponse = {
      code: 401,
      message: '需要密码才能查看服务状态',
      source: 'api',
      passwordRequired: isPasswordProtectionEnabled(),
    };
    response.statusCode = 401;
    response.end(JSON.stringify(payload));
    return;
  }

  const apiKey = process.env.UPTIMEROBOT_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    response.statusCode = 503;
    response.end(JSON.stringify({ code: 503, message: '监控服务尚未配置', source: 'api' }));
    return;
  }

  try {
    const result = await fetchStatusData({
      apiKey,
      apiUrl: process.env.UPTIMEROBOT_API_URL || process.env.API_URL,
      historyDays: Number(process.env.COUNT_DAYS || 60),
    });
    const payload: StatusApiResponse = {
      code: 200,
      message: 'success',
      source: result.source,
      data: result.data,
    };
    response.statusCode = 200;
    if (!isPasswordProtectionEnabled()) {
      response.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
      response.setHeader('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    }
    response.setHeader('Server-Timing', `uptime-robot;dur=${Date.now() - startedAt}`);
    console.info(
      JSON.stringify({
        event: 'status.fetch.complete',
        durationMs: Date.now() - startedAt,
        source: result.source,
      })
    );
    response.end(JSON.stringify(payload));
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'status.fetch.failed',
        durationMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : 'unknown',
      })
    );
    response.statusCode = 502;
    response.end(
      JSON.stringify({
        code: 502,
        message: error instanceof Error ? error.message : '监控服务请求失败',
        source: 'api',
      })
    );
  }
}
