import { createNonce, createTicketProvider, signTicket, validateShareUrl } from '../../server/wechat-signature';
import type { IncomingMessage, ServerResponse } from 'node:http';
let provider: ReturnType<typeof createTicketProvider> | undefined;
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(405, { error: 'Method not allowed' });
  }
  let url: string;
  try {
    const request = new URL(req.url || '/', 'https://www.elexvx.com');
    url = validateShareUrl(request.searchParams.get('url') || '', ['https://www.elexvx.com']);
  } catch {
    return send(400, { error: 'Invalid page URL' });
  }
  const appId = process.env.WECHAT_APP_ID;
  const secret = process.env.WECHAT_APP_SECRET;
  if (!appId || !secret) return send(503, { error: 'Share configuration unavailable' });
  try {
    provider ??= createTicketProvider(appId, secret);
    const ticket = await provider();
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = createNonce();
    return send(200, { appId, timestamp, nonceStr, signature: signTicket(ticket, url, nonceStr, timestamp) });
  } catch {
    return send(503, { error: 'Share configuration temporarily unavailable' });
  }
}
