import { isMonitorDown, isMonitorUp, MONITOR_STATE, statusConfig } from '../../data/service-status';
import type { AvailabilityDay, MonitorState, StatusMonitor } from '../../data/service-status';
import type { Locale } from '../providers/i18n';

const HEALTHY_AVAILABILITY_PERCENT = 99.9;
const WARNING_AVAILABILITY_PERCENT = 95;
const STATUS_DAY_CACHE_LIMIT = 240;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const MILLISECONDS_PER_SECOND = 1000;

const statusDayFormatters: Record<Locale, Intl.DateTimeFormat> = {
  'zh-CN': new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }),
  en: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
};
const statusDayLabelCache = new Map<string, string>();

export type StatusTone = 'healthy' | 'warning' | 'error' | 'unknown';

export interface StatusGroup {
  id: string;
  name: string;
  monitors: StatusMonitor[];
  percent: number;
  status: MonitorState;
  days: AvailabilityDay[];
}

export function monitorDisplayName(name: string): string {
  return name.replace(/^[A-Za-z]+\d+\s*[-—]\s*/u, '').trim() || name;
}

function monitorPrefix(name: string): string | undefined {
  return /^([A-Za-z]+)\d+/u.exec(name.trim())?.[1]?.toLocaleUpperCase();
}

export function statusTone(status: MonitorState): StatusTone {
  if (isMonitorUp(status)) return 'healthy';
  if (isMonitorDown(status)) return 'error';
  return 'unknown';
}

export function availabilityTone(percent: number, currentDayDown = false): StatusTone {
  if (percent >= HEALTHY_AVAILABILITY_PERCENT) return 'healthy';
  if (percent >= WARNING_AVAILABILITY_PERCENT) return 'warning';
  if (percent > 0) return 'error';
  return currentDayDown ? 'error' : 'unknown';
}

function aggregateStatus(monitors: StatusMonitor[]): MonitorState {
  if (monitors.some((monitor) => isMonitorDown(monitor.status))) return MONITOR_STATE.down;
  if (monitors.some((monitor) => !isMonitorUp(monitor.status))) return MONITOR_STATE.notCheckedYet;
  return MONITOR_STATE.up;
}

function aggregateDays(monitors: StatusMonitor[]): AvailabilityDay[] {
  const byDate = new Map<number, AvailabilityDay[]>();
  for (const monitor of monitors) {
    for (const day of monitor.days) {
      const entries = byDate.get(day.date) ?? [];
      entries.push(day);
      byDate.set(day.date, entries);
    }
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => left - right)
    .map(([date, days]) => ({
      date,
      percent: Number((days.reduce((total, day) => total + day.percent, 0) / days.length).toFixed(2)),
      down: days.reduce(
        (total, day) => ({
          times: total.times + day.down.times,
          duration: total.duration + day.down.duration,
        }),
        { times: 0, duration: 0 }
      ),
    }));
}

function createGroup(id: string, name: string, monitors: StatusMonitor[]): StatusGroup {
  return {
    id,
    name,
    monitors,
    percent:
      monitors.length > 0
        ? Number((monitors.reduce((total, monitor) => total + monitor.percent, 0) / monitors.length).toFixed(2))
        : 0,
    status: aggregateStatus(monitors),
    days: aggregateDays(monitors),
  };
}

export function groupStatusMonitors(monitors: StatusMonitor[]): StatusGroup[] {
  const claimed = new Set<number>();
  const groups = statusConfig.groups.flatMap((definition, index) => {
    const prefixes = new Set(definition.prefixes.map((prefix) => prefix.toLocaleUpperCase()));
    const matching = monitors.filter((monitor) => {
      const matches = prefixes.has(monitorPrefix(monitor.name) ?? '');
      if (matches) claimed.add(monitor.id);
      return matches;
    });
    return matching.length > 0 ? [createGroup(`group-${index + 1}`, definition.name, matching)] : [];
  });
  const remaining = monitors.filter((monitor) => !claimed.has(monitor.id));
  if (remaining.length > 0) groups.push(createGroup('other-services', '其他服务', remaining));
  return groups;
}

export function formatPercent(percent: number): string {
  return `${percent.toFixed(percent === Math.round(percent) ? 0 : 2)}%`;
}

export function formatStatusTime(timestamp: number, locale: Locale = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatDay(timestamp: number, locale: Locale = 'zh-CN'): string {
  const cacheKey = `${locale}:${timestamp}`;
  const cachedLabel = statusDayLabelCache.get(cacheKey);
  if (cachedLabel) return cachedLabel;

  const label = statusDayFormatters[locale].format(new Date(timestamp * MILLISECONDS_PER_SECOND));
  if (statusDayLabelCache.size >= STATUS_DAY_CACHE_LIMIT) statusDayLabelCache.clear();
  statusDayLabelCache.set(cacheKey, label);
  return label;
}

export function formatDuration(seconds: number, locale: Locale = 'zh-CN'): string {
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const hours = Math.floor((seconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  const units =
    locale === 'en'
      ? { day: 'd', hour: 'h', minute: 'm', second: 's' }
      : { day: '天', hour: '小时', minute: '分钟', second: '秒' };
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}${units.day}`);
  if (hours > 0 || days > 0) parts.push(`${hours}${units.hour}`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}${units.minute}`);
  parts.push(`${remainingSeconds}${units.second}`);
  return parts.join(' ');
}
