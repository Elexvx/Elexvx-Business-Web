import { statusConfig } from '../../data/service-status';
import type { AvailabilityDay, MonitorState, StatusMonitor } from '../../data/service-status';

const statusDayFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' });
const statusDayLabelCache = new Map<number, string>();

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
  if (status === 2) return 'healthy';
  if (status === 8 || status === 9) return 'error';
  return 'unknown';
}

export function availabilityTone(percent: number, currentDayDown = false): StatusTone {
  if (percent >= 99.9) return 'healthy';
  if (percent >= 95) return 'warning';
  if (percent > 0) return 'error';
  return currentDayDown ? 'error' : 'unknown';
}

function aggregateStatus(monitors: StatusMonitor[]): MonitorState {
  if (monitors.some((monitor) => monitor.status === 8 || monitor.status === 9)) return 9;
  if (monitors.some((monitor) => monitor.status !== 2)) return 1;
  return 2;
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

export function formatStatusTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatDay(timestamp: number): string {
  const cachedLabel = statusDayLabelCache.get(timestamp);
  if (cachedLabel) return cachedLabel;

  const label = statusDayFormatter.format(new Date(timestamp * 1000));
  if (statusDayLabelCache.size >= 240) statusDayLabelCache.clear();
  statusDayLabelCache.set(timestamp, label);
  return label;
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0 || days > 0) parts.push(`${hours}小时`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}分钟`);
  parts.push(`${remainingSeconds}秒`);
  return parts.join(' ');
}

export function formatInterval(interval: number): string {
  if (interval >= 3600) return `${Math.floor(interval / 3600)}小时`;
  if (interval >= 60) return `${Math.floor(interval / 60)}分钟`;
  return `${interval}秒`;
}
