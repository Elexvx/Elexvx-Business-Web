import { createServer } from 'node:http';
import { createNonce, createTicketProvider, signTicket, validateShareUrl } from '../server/wechat-signature';

const appId = process.env.WECHAT_APP_ID;
const secret = process.env.WECHAT_APP_SECRET;
const origins = (process.env.WECHAT_ALLOWED_ORIGINS || 'https://www.elexvx.com')
  .split(',')
  .map((value) => value.trim());
if (!appId || !secret) throw new Error('Configure WECHAT_APP_ID and WECHAT_APP_SECRET in the server environment.');
const getTicket = createTicketProvider(appId, secret);
const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  if (req.method !== 'GET' || requestUrl.pathname !== '/api/wechat/signature') {
    res.writeHead(404);
    res.end('{"error":"Not found"}');
    return;
  }
  let signedUrl: string;
  try {
    signedUrl = validateShareUrl(requestUrl.searchParams.get('url') || '', origins);
  } catch {
    res.writeHead(400);
    res.end('{"error":"Invalid page URL"}');
    return;
  }
  try {
    const ticket = await getTicket();
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = createNonce();
    res.end(
      JSON.stringify({ appId, timestamp, nonceStr, signature: signTicket(ticket, signedUrl, nonceStr, timestamp) })
    );
  } catch {
    // Never expose tokens, credentials, or upstream response bodies to clients or logs.
    res.writeHead(503);
    res.end('{"error":"Share configuration temporarily unavailable"}');
  }
});
server.requestTimeout = 25000;
server.listen(Number(process.env.WECHAT_SHARE_PORT || 8787), '127.0.0.1', () =>
  console.log('WeChat signing service listening on loopback.')
);
