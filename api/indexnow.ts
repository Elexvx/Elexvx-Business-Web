import type { IncomingMessage, ServerResponse } from 'node:http';

import { submitRecentIndexNowArticles } from '../src/server/indexnow.js';

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'private, no-store');

  if (request.method !== 'GET') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET');
    response.end(JSON.stringify({ ok: false, message: 'Method not allowed' }));
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.authorization !== `Bearer ${cronSecret}`) {
    response.statusCode = 401;
    response.end(JSON.stringify({ ok: false, message: 'Unauthorized' }));
    return;
  }

  try {
    const result = await submitRecentIndexNowArticles({ lookbackDays: 3 });
    response.statusCode = 200;
    response.end(
      JSON.stringify({
        ok: true,
        submitted: result.urls.length,
        status: result.status,
        message: result.urls.length
          ? 'IndexNow received the URLs; indexing is not guaranteed.'
          : 'No recent article URLs.',
      })
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'indexnow.submit.failed',
        message: error instanceof Error ? error.message : 'unknown',
      })
    );
    response.statusCode = 502;
    response.end(
      JSON.stringify({
        ok: false,
        message: error instanceof Error ? error.message : 'IndexNow submission failed',
      })
    );
  }
}
