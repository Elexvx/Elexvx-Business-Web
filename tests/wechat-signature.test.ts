import { describe, it, expect, vi } from 'vitest';
import { signTicket, validateShareUrl, createTicketProvider } from '../server/wechat-signature';

describe('WeChat signatures', () => {
  it('signs all four exact fields in the required order', () => {
    expect(signTicket('ticket', 'https://www.elexvx.com/?a=1&b=2', 'nonce', 123)).toBe(
      'af73aa2e494d6051afeb7efd6154ccad8b3a8356'
    );
  });
  it('preserves query encoding and removes only the fragment', () => {
    expect(validateShareUrl('https://www.elexvx.com/a/?q=%2f&x=1#heading', ['https://www.elexvx.com'])).toBe(
      'https://www.elexvx.com/a/?q=%2f&x=1'
    );
  });
  it.each([
    'http://www.elexvx.com/',
    'https://www.elexvx.com.evil.test/',
    'https://user:pass@www.elexvx.com/',
    'https://localhost/',
  ])('rejects unauthorized signing target %s', (url) => {
    expect(() => validateShareUrl(url, ['https://www.elexvx.com'])).toThrow();
  });
  it('shares in-flight requests and caches tickets', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ errcode: 0, ticket: 'ticket', expires_in: 7200 })));
    const getTicket = createTicketProvider('id', 'secret', request);
    expect(await Promise.all([getTicket(), getTicket()])).toEqual(['ticket', 'ticket']);
    expect(await getTicket()).toBe('ticket');
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('recovers after an upstream error instead of caching failure', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'token' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ticket: 'ticket', expires_in: 7200 })));
    const getTicket = createTicketProvider('id', 'secret', request);
    await expect(getTicket()).rejects.toThrow();
    await expect(getTicket()).resolves.toBe('ticket');
  });
});
