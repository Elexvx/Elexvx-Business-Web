import { afterEach, describe, expect, it, vi } from 'vitest';

import { MONITOR_STATE } from '../src/data/service-status';
import {
  buildDateRanges,
  fetchStatusData,
  formatUptimeRobotData,
  resetStatusCacheForTests,
} from '../src/server/status/uptime-robot';
import { availabilityTone, formatDuration, formatPercent, statusTone } from '../src/site/services/status-utils';

describe('UptimeRobot status history caches', () => {
  afterEach(() => {
    vi.useRealTimers();
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

  it('clamps requested history days into safe bounds and appends the overall range', () => {
    expect(buildDateRanges(1).dates).toHaveLength(7);
    expect(buildDateRanges(365).dates).toHaveLength(90);
    expect(buildDateRanges(0).dates).toHaveLength(60);
    expect(buildDateRanges(14).ranges.split('-')).toHaveLength(15);
  });

  it('falls back to stale cached status data when an expired refresh fails within the stale window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T00:00:00.000Z'));

    const fetchMock = vi
      .fn<(...args: [RequestInfo | URL, RequestInit?]) => Promise<Response>>()
      .mockImplementationOnce(async (_input, init) => {
        const requestBody = new URLSearchParams(String(init?.body ?? ''));
        const rangeCount = requestBody.get('custom_uptime_ranges')?.split('-').length ?? 0;
        return new Response(
          JSON.stringify({
            stat: 'ok',
            monitors: [
              {
                id: 1,
                friendly_name: 'A01-企业官网',
                status: MONITOR_STATE.up,
                type: 1,
                interval: 300,
                custom_uptime_ranges: Array.from({ length: rangeCount }, () => '99.90').join('-'),
              },
            ],
          }),
          { status: 200 }
        );
      })
      .mockRejectedValueOnce(new Error('Upstream timeout'));
    vi.stubGlobal('fetch', fetchMock);

    const initial = await fetchStatusData({
      apiKey: 'test-key',
      historyDays: 14,
      cacheTtlMs: 10,
      staleTtlMs: 60_000,
    });
    expect(initial.source).toBe('api');

    vi.setSystemTime(new Date('2026-11-16T00:00:01.000Z'));
    const fallback = await fetchStatusData({
      apiKey: 'test-key',
      historyDays: 14,
      cacheTtlMs: 10,
      staleTtlMs: 60_000,
    });
    expect(fallback.source).toBe('cache');
    expect(fallback.data).toEqual(initial.data);
  });

  it('formats monitor logs, per-day buckets, summary counts, and clamped percentages', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-18T12:00:00.000Z'));

    const ranges = buildDateRanges(7);
    const todayUnix = Math.floor(ranges.dates[0].getTime() / 1000);
    const twoDaysAgoUnix = Math.floor(ranges.dates[2].getTime() / 1000);
    const outsideRangeUnix = Math.floor(ranges.dates[6].getTime() / 1000) - 86_400;

    const formatted = formatUptimeRobotData(
      {
        stat: 'ok',
        monitors: [
          {
            id: 10,
            friendly_name: ' Primary API ',
            url: 'https://www.elexvx.com',
            status: MONITOR_STATE.up,
            type: 1,
            interval: 300,
            custom_uptime_ranges: ['120.5', 'NaN', '', '99.123', '100', '100', '100', '98.765'].join('-'),
            logs: [
              { type: 1, datetime: todayUnix + 3600, duration: 45 },
              { type: 99, datetime: twoDaysAgoUnix + 3600, duration: 120 },
              { type: 2, datetime: todayUnix + 7200, duration: 999 },
              { type: 1, datetime: outsideRangeUnix + 3600, duration: 30 },
            ],
          },
          {
            id: 11,
            friendly_name: '',
            status: MONITOR_STATE.down,
            custom_uptime_ranges: Array.from({ length: 8 }, () => '90').join('-'),
          },
          {
            id: 12,
            friendly_name: 'Paused Worker',
            status: MONITOR_STATE.paused,
            custom_uptime_ranges: Array.from({ length: 8 }, () => '100').join('-'),
          },
        ],
      },
      ranges
    );

    expect(formatted.summary).toEqual({ count: 3, ok: 1, error: 1, unknown: 1 });
    const primary = formatted.monitors[0];
    expect(primary.name).toBe('Primary API');
    expect(primary.percent).toBe(98.77);
    expect(primary.down).toEqual({ times: 3, duration: 195 });
    // days are reversed chronologically: index 6 is today, index 4 is two days ago
    expect(primary.days[6].percent).toBe(100);
    expect(primary.days[6].down).toEqual({ times: 1, duration: 45 });
    expect(primary.days[5].percent).toBe(0);
    expect(primary.days[4].percent).toBe(0);
    expect(primary.days[4].down).toEqual({ times: 1, duration: 120 });
    expect(primary.days[3].percent).toBe(99.12);
    expect(formatted.monitors[1].name).toBe('监控项目 2');

    expect(() => formatUptimeRobotData({ error: { message: 'Invalid API key' } }, ranges)).toThrow('Invalid API key');
    expect(() => formatUptimeRobotData({}, ranges)).toThrow('UptimeRobot 未返回监控数据');
  });

  it('rejects mismatched multi-batch responses and recovers cleanly from concurrent in-flight errors', async () => {
    const mismatchFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestBody = new URLSearchParams(String(init?.body ?? ''));
      const rangeCount = requestBody.get('custom_uptime_ranges')?.split('-').length ?? 0;
      const isFirstBatch = rangeCount === 21;
      return new Response(
        JSON.stringify({
          stat: 'ok',
          monitors: isFirstBatch
            ? [
                {
                  id: 1,
                  friendly_name: 'Primary',
                  status: MONITOR_STATE.up,
                  custom_uptime_ranges: Array.from({ length: rangeCount }, () => '100').join('-'),
                },
              ]
            : [],
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal('fetch', mismatchFetch);
    await expect(fetchStatusData({ apiKey: 'test-key', historyDays: 60 })).rejects.toThrow(
      'UptimeRobot 分批响应缺少监控数据'
    );

    resetStatusCacheForTests();

    let rejectFirst!: (reason?: unknown) => void;
    const pendingResponse = new Promise<Response>((_resolve, reject) => {
      rejectFirst = reject;
    });
    const recoveryFetch = vi
      .fn<(...args: [RequestInfo | URL, RequestInit?]) => Promise<Response>>()
      .mockReturnValueOnce(pendingResponse)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            stat: 'ok',
            monitors: [
              {
                id: 1,
                friendly_name: 'Recovered',
                status: MONITOR_STATE.up,
                custom_uptime_ranges: Array.from({ length: 15 }, () => '100').join('-'),
              },
            ],
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal('fetch', recoveryFetch);

    const first = fetchStatusData({ apiKey: 'test-key', historyDays: 14 });
    const second = fetchStatusData({ apiKey: 'test-key', historyDays: 14 });
    rejectFirst(new Error('Transient network failure'));

    await expect(first).rejects.toThrow('Transient network failure');
    await expect(second).rejects.toThrow('Transient network failure');
    expect(recoveryFetch).toHaveBeenCalledTimes(1);

    const recovered = await fetchStatusData({ apiKey: 'test-key', historyDays: 14 });
    expect(recovered.source).toBe('api');
    expect(recovered.data.monitors[0].name).toBe('Recovered');
    expect(recoveryFetch).toHaveBeenCalledTimes(2);
  });
});

describe('status formatting and classification helpers', () => {
  it('maps monitor states and availability thresholds to expected UI tones', () => {
    expect(statusTone(MONITOR_STATE.up)).toBe('healthy');
    expect(statusTone(MONITOR_STATE.seemsDown)).toBe('error');
    expect(statusTone(MONITOR_STATE.down)).toBe('error');
    expect(statusTone(MONITOR_STATE.paused)).toBe('unknown');
    expect(statusTone(MONITOR_STATE.notCheckedYet)).toBe('unknown');

    expect(availabilityTone(99.9)).toBe('healthy');
    expect(availabilityTone(99.89)).toBe('warning');
    expect(availabilityTone(95)).toBe('warning');
    expect(availabilityTone(94.99)).toBe('error');
    expect(availabilityTone(0)).toBe('unknown');
    expect(availabilityTone(0, true)).toBe('error');
  });

  it('formats percentages and outage durations cleanly', () => {
    expect(formatPercent(100)).toBe('100%');
    expect(formatPercent(99.95)).toBe('99.95%');
    expect(formatDuration(45)).toBe('45秒');
    expect(formatDuration(65)).toBe('1分钟 5秒');
    expect(formatDuration(90_061)).toBe('1天 1小时 1分钟 1秒');
  });
});
