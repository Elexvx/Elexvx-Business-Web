import type { AvailabilityDay, StatusData, StatusMonitor } from '../../data/service-status.ts';
import {
  isMonitorDown,
  isMonitorUp,
  MONITOR_STATE,
  STATUS_HISTORY_LIMITS,
  type MonitorState,
  type MonitorType,
} from '../../data/status-constants.ts';

const UPTIMEROBOT_DOWN_LOG_TYPE = 1;
const UPTIMEROBOT_PAUSED_LOG_TYPE = 99;
const DEFAULT_MONITOR_TYPE: MonitorType = 1;
const MILLISECONDS_PER_SECOND = 1000;
const DEFAULT_RANGE_BATCH_SIZE = 20;
const DEFAULT_API_BASE_URL = 'https://api.uptimerobot.com/v2/';
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
const DEFAULT_CACHE_TTL_MS = 300_000;
const DEFAULT_STALE_TTL_MS = 86_400_000;

interface UptimeRobotLog {
  type?: number;
  datetime?: number;
  duration?: number;
}

interface UptimeRobotMonitor {
  id?: number;
  friendly_name?: string;
  url?: string;
  status?: number;
  type?: number;
  interval?: number;
  custom_uptime_ranges?: string;
  logs?: UptimeRobotLog[];
}

interface UptimeRobotResponse {
  stat?: string;
  monitors?: UptimeRobotMonitor[];
  error?: { message?: string };
}

interface DateRangeRequest {
  dates: Date[];
  start: number;
  end: number;
  ranges: string;
}

interface StatusCache {
  expiresAt: number;
  staleUntil: number;
  data: StatusData;
}

interface RangeBatch {
  ranges: string;
  dayCount: number;
  includesOverall: boolean;
}

const cacheByHistoryDays = new Map<number, StatusCache>();
const inFlightRequestsByHistoryDays = new Map<number, Promise<StatusData>>();

function normalizeHistoryDays(value: number | undefined): number {
  return Math.max(
    STATUS_HISTORY_LIMITS.minDays,
    Math.min(
      STATUS_HISTORY_LIMITS.maxDays,
      Math.floor(value ?? STATUS_HISTORY_LIMITS.defaultDays) || STATUS_HISTORY_LIMITS.defaultDays
    )
  );
}

function startOfToday(): Date {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

export function buildDateRanges(historyDays: number): DateRangeRequest {
  const safeHistoryDays = normalizeHistoryDays(historyDays);
  const today = startOfToday();
  const dates = Array.from({ length: safeHistoryDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    return date;
  });
  const rangeValues = dates.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return `${Math.floor(date.getTime() / MILLISECONDS_PER_SECOND)}_${Math.floor(nextDay.getTime() / MILLISECONDS_PER_SECOND)}`;
  });
  const oldest = dates.at(-1) ?? today;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const start = Math.floor(oldest.getTime() / MILLISECONDS_PER_SECOND);
  const end = Math.floor(tomorrow.getTime() / MILLISECONDS_PER_SECOND);
  rangeValues.push(`${start}_${end}`);

  return { dates, start, end, ranges: rangeValues.join('-') };
}

function formatPercent(value: string | number | undefined): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Number(numeric.toFixed(2))));
}

function dateKeyFromUnix(timestamp: number): string {
  const date = new Date(timestamp * MILLISECONDS_PER_SECOND);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function createRangeBatches(ranges: DateRangeRequest, batchSize: number): RangeBatch[] {
  const values = ranges.ranges.split('-');
  const overall = values.pop();
  if (!overall) throw new Error('无法生成 UptimeRobot 时间范围');

  const batches: RangeBatch[] = [];
  for (let index = 0; index < values.length; index += batchSize) {
    const days = values.slice(index, index + batchSize);
    batches.push({
      ranges: [...days, ...(index === 0 ? [overall] : [])].join('-'),
      dayCount: days.length,
      includesOverall: index === 0,
    });
  }
  return batches;
}

function mergeBatchResponses(responses: UptimeRobotResponse[], batches: RangeBatch[]): UptimeRobotResponse {
  const baseMonitors = responses[0]?.monitors;
  if (!Array.isArray(baseMonitors)) return responses[0] ?? {};
  if (responses.length === 1) return responses[0];

  return {
    ...responses[0],
    monitors: baseMonitors.map((baseMonitor, monitorIndex) => {
      const dailyValues: string[] = [];
      let overallValue = '0';

      responses.forEach((response, batchIndex) => {
        const monitor =
          response.monitors?.find((item) => item.id === baseMonitor.id) ?? response.monitors?.[monitorIndex];
        if (!monitor) throw new Error('UptimeRobot 分批响应缺少监控数据');
        const values = (monitor.custom_uptime_ranges ?? '').split('-');
        if (batches[batchIndex]?.includesOverall) overallValue = values.pop() ?? '0';
        dailyValues.push(...values.slice(0, batches[batchIndex]?.dayCount));
      });

      return {
        ...baseMonitor,
        custom_uptime_ranges: `${dailyValues.join('-')}-${overallValue}`,
      };
    }),
  };
}

function applyOutageLogs(
  days: AvailabilityDay[],
  dateIndex: Map<string, number>,
  logs: UptimeRobotLog[] | undefined
): { times: number; duration: number } {
  const down = { times: 0, duration: 0 };
  for (const log of logs ?? []) {
    if (log.type !== UPTIMEROBOT_DOWN_LOG_TYPE && log.type !== UPTIMEROBOT_PAUSED_LOG_TYPE) continue;
    const duration = Math.max(0, Number(log.duration ?? 0));
    const dayIndex = dateIndex.get(dateKeyFromUnix(Number(log.datetime ?? 0)));
    if (dayIndex !== undefined) {
      days[dayIndex].down.times += 1;
      days[dayIndex].down.duration += duration;
    }
    down.times += 1;
    down.duration += duration;
  }
  return down;
}

function formatMonitor(monitor: UptimeRobotMonitor, monitorIndex: number, dates: Date[]): StatusMonitor {
  const values = (monitor.custom_uptime_ranges ?? '').split('-');
  const percent = formatPercent(values.pop());
  const dateIndex = new Map<string, number>();
  const days: AvailabilityDay[] = dates.map((date, index) => {
    const unixTimestamp = Math.floor(date.getTime() / MILLISECONDS_PER_SECOND);
    dateIndex.set(dateKeyFromUnix(unixTimestamp), index);
    return {
      date: unixTimestamp,
      percent: formatPercent(values[index]),
      down: { times: 0, duration: 0 },
    };
  });
  const down = applyOutageLogs(days, dateIndex, monitor.logs);

  return {
    id: Number(monitor.id ?? monitorIndex + 1),
    name: monitor.friendly_name?.trim() || `监控项目 ${monitorIndex + 1}`,
    ...(monitor.url ? { url: monitor.url } : {}),
    status: (monitor.status ?? MONITOR_STATE.seemsDown) as MonitorState,
    type: (monitor.type ?? DEFAULT_MONITOR_TYPE) as MonitorType,
    interval: Number(monitor.interval ?? 0),
    percent,
    days: [...days].reverse(),
    down,
  };
}

function summarizeMonitors(monitors: StatusMonitor[]) {
  return monitors.reduce(
    (total, monitor) => {
      if (isMonitorUp(monitor.status)) total.ok += 1;
      else if (isMonitorDown(monitor.status)) total.error += 1;
      else total.unknown += 1;
      return total;
    },
    { count: monitors.length, ok: 0, error: 0, unknown: 0 }
  );
}

export function formatUptimeRobotData(response: UptimeRobotResponse, ranges: DateRangeRequest): StatusData {
  if (!Array.isArray(response.monitors)) {
    throw new Error(response.error?.message || 'UptimeRobot 未返回监控数据');
  }

  const monitors = response.monitors.map((monitor, monitorIndex) => formatMonitor(monitor, monitorIndex, ranges.dates));
  return { summary: summarizeMonitors(monitors), monitors, timestamp: Date.now() };
}

async function fetchBatchedMonitors(options: {
  apiKey: string;
  apiUrl: string;
  timeoutMs: number;
  batches: RangeBatch[];
}): Promise<UptimeRobotResponse[]> {
  return Promise.all(
    options.batches.map(async (batch) => {
      const body = new URLSearchParams({
        api_key: options.apiKey,
        format: 'json',
        custom_uptime_ranges: batch.ranges,
      });
      const response = await fetch(options.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(options.timeoutMs),
      });

      if (!response.ok) throw new Error(`UptimeRobot 请求失败（${response.status}）`);
      return (await response.json()) as UptimeRobotResponse;
    })
  );
}

async function refreshStatusCache(options: {
  apiKey: string;
  apiUrl?: string;
  historyDays: number;
  timeoutMs: number;
  rangeBatchSize: number;
}): Promise<StatusData> {
  const ranges = buildDateRanges(options.historyDays);
  const batches = createRangeBatches(ranges, options.rangeBatchSize);
  const apiBaseUrl = options.apiUrl ?? DEFAULT_API_BASE_URL;
  const apiUrl = `${apiBaseUrl.replace(/\/+$/u, '')}/getMonitors`;
  const payloads = await fetchBatchedMonitors({
    apiKey: options.apiKey,
    apiUrl,
    timeoutMs: options.timeoutMs,
    batches,
  });
  return formatUptimeRobotData(mergeBatchResponses(payloads, batches), ranges);
}

function resolveStaleOrThrow(cached: StatusCache | undefined, error: unknown): { data: StatusData; source: 'cache' } {
  if (cached && cached.staleUntil > Date.now()) return { data: cached.data, source: 'cache' };
  throw error;
}

export async function fetchStatusData(options: {
  apiKey: string;
  apiUrl?: string;
  historyDays?: number;
  cacheTtlMs?: number;
  staleTtlMs?: number;
  timeoutMs?: number;
  rangeBatchSize?: number;
  deduplicateRequests?: boolean;
}): Promise<{ data: StatusData; source: 'api' | 'cache' }> {
  const historyDays = normalizeHistoryDays(options.historyDays);
  const now = Date.now();
  const cached = cacheByHistoryDays.get(historyDays);
  if (cached && cached.expiresAt > now) return { data: cached.data, source: 'cache' };

  const shouldDeduplicate = options.deduplicateRequests !== false;
  const inFlightRequest = shouldDeduplicate ? inFlightRequestsByHistoryDays.get(historyDays) : undefined;
  if (inFlightRequest) {
    try {
      return { data: await inFlightRequest, source: 'cache' };
    } catch (error) {
      return resolveStaleOrThrow(cached, error);
    }
  }

  const request = refreshStatusCache({
    apiKey: options.apiKey,
    apiUrl: options.apiUrl,
    historyDays,
    timeoutMs: options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    rangeBatchSize: options.rangeBatchSize ?? DEFAULT_RANGE_BATCH_SIZE,
  });
  if (shouldDeduplicate) inFlightRequestsByHistoryDays.set(historyDays, request);

  try {
    const data = await request;
    const completedAt = Date.now();
    cacheByHistoryDays.set(historyDays, {
      data,
      expiresAt: completedAt + (options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS),
      staleUntil: completedAt + (options.staleTtlMs ?? DEFAULT_STALE_TTL_MS),
    });
    return { data, source: 'api' };
  } catch (error) {
    return resolveStaleOrThrow(cached, error);
  } finally {
    if (shouldDeduplicate) inFlightRequestsByHistoryDays.delete(historyDays);
  }
}

export function resetStatusCacheForTests() {
  cacheByHistoryDays.clear();
  inFlightRequestsByHistoryDays.clear();
}
