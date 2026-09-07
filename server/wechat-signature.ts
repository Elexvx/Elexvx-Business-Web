import { createHash, randomBytes } from 'node:crypto';

export function validateShareUrl(raw: string, origins: string[]): string {
  if (!raw || raw.length > 4096) throw new Error('Invalid URL');
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || !origins.includes(url.origin))
    throw new Error('Origin not allowed');
  // Preserve the exact URL encoding and query string supplied by the WeChat WebView.
  return raw.split('#')[0];
}

export function signTicket(ticket: string, url: string, nonceStr: string, timestamp: number): string {
  return createHash('sha1')
    .update(`jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`)
    .digest('hex');
}

export function createTicketProvider(appId: string, secret: string, request: typeof fetch = fetch) {
  let cache: { value: string; until: number } | undefined;
  let pending: Promise<string> | undefined;
  return async () => {
    if (cache && cache.until > Date.now()) return cache.value;
    if (pending) return pending;
    pending = (async () => {
      const tokenResponse = await request('https://api.weixin.qq.com/cgi-bin/stable_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_type: 'client_credential', appid: appId, secret, force_refresh: false }),
        signal: AbortSignal.timeout(10000),
      });
      const token = (await tokenResponse.json()) as { access_token?: string; errcode?: number; errmsg?: string };
      if (!tokenResponse.ok || !token.access_token) {
        const ip = token.errmsg?.match(/invalid ip\s+([\d.]+)/i)?.[1];
        console.warn('WeChat token failure', { code: token.errcode, ip });
        throw new Error('WeChat token unavailable');
      }
      const ticketResponse = await request(
        `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${encodeURIComponent(token.access_token)}&type=jsapi`,
        { signal: AbortSignal.timeout(10000) }
      );
      const ticket = (await ticketResponse.json()) as { ticket?: string; expires_in?: number; errcode?: number };
      if (!ticketResponse.ok || ticket.errcode || !ticket.ticket || !ticket.expires_in)
        throw new Error('WeChat ticket unavailable');
      cache = { value: ticket.ticket, until: Date.now() + Math.max(0, ticket.expires_in - 300) * 1000 };
      return cache.value;
    })();
    try {
      return await pending;
    } finally {
      pending = undefined;
    }
  };
}

export const createNonce = () => randomBytes(16).toString('hex');
