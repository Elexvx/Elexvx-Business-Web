import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchStatusData, resetStatusCacheForTests } from '../src/server/status/uptime-robot';

describe('UptimeRobot status history caches', () => {
  afterEach(() => {
    resetStatusCacheForTests();
    vi.unstubAllGlobals();
  });

  it('keeps overview and full-history requests isolated while reusing each cache', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestBody = new URLSearchParams(String(init?.body ?? ''));
      const rangeCount = requestBody.get('custom_uptime_ranges')?.split('-').length ?? 0;
      return new Response(
        JSON.stringify({
          stat: 'ok',
          monitors: [
            {
              id: 1,
              friendly_name: 'A01-企业官网',
              status: 2,
              type: 1,
              interval: 300,
              custom_uptime_ranges: Array.from({ length: rangeCount }, () => '100.00').join('-'),
            },
          ],
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const [overview, history] = await Promise.all([
      fetchStatusData({ apiKey: 'test-key', historyDays: 14 }),
      fetchStatusData({ apiKey: 'test-key', historyDays: 60 }),
    ]);

    expect(overview.data.monitors[0]?.days).toHaveLength(14);
    expect(history.data.monitors[0]?.days).toHaveLength(60);
    expect(fetchMock).toHaveBeenCalledTimes(4);

    expect((await fetchStatusData({ apiKey: 'test-key', historyDays: 14 })).source).toBe('cache');
    expect((await fetchStatusData({ apiKey: 'test-key', historyDays: 60 })).source).toBe('cache');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
