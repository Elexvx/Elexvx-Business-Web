export type HeroLaunchConfig = {
  /** Whether scheduled launch gating is active; set false or pass releaseAt to show the main hero immediately. */
  enabled: boolean;
  /** Scheduled release timestamp (ISO 8601 with timezone offset, e.g. '2026-12-01T00:00:00+08:00'). */
  releaseAt: string;
};

export type CountdownSnapshot = {
  released: boolean;
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
};

const pad2 = (value: number) => String(value).padStart(2, '0');

export const parseReleaseTimestamp = (value?: string): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const timestamp = Date.parse(trimmed);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const isReleaseReached = (
  launch: Pick<HeroLaunchConfig, 'enabled' | 'releaseAt'>,
  nowMs: number = Date.now()
): boolean => {
  if (!launch.enabled) return true;
  const releaseTimestamp = parseReleaseTimestamp(launch.releaseAt);
  if (releaseTimestamp === null) return true;
  return nowMs >= releaseTimestamp;
};

const DEFAULT_PROGRESS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const getCountdownSnapshot = (releaseAt: string, nowMs: number): CountdownSnapshot => {
  const releaseTimestamp = parseReleaseTimestamp(releaseAt);
  if (releaseTimestamp === null || nowMs >= releaseTimestamp) {
    return {
      released: true,
      remainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progress: 1,
    };
  }

  const remainingMs = Math.max(0, releaseTimestamp - nowMs);
  // Ceiling avoids displaying 00:00:00:00 during the final sub-second before reveal.
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const rawProgress = 1 - remainingMs / DEFAULT_PROGRESS_WINDOW_MS;
  const progress = Math.min(1, Math.max(0.04, rawProgress));

  return {
    released: false,
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    progress,
  };
};

const parseIsoOffsetMinutes = (value: string): { offsetMinutes: number; label: string } => {
  const trimmed = value.trim();
  if (/Z$/i.test(trimmed)) return { offsetMinutes: 0, label: 'UTC' };
  const match = trimmed.match(/([+-])(\d{2}):?(\d{2})$/);
  if (!match) return { offsetMinutes: 8 * 60, label: 'UTC+08:00' };
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return {
    offsetMinutes: sign * (hours * 60 + minutes),
    label: `UTC${match[1]}${match[2]}:${match[3]}`,
  };
};

const formatOffsetLabel = (offsetMinutes: number): string => {
  const normalized = offsetMinutes === 0 ? 0 : offsetMinutes;
  if (normalized === 0) return 'UTC';
  const sign = normalized > 0 ? '+' : '-';
  const abs = Math.abs(normalized);
  return `UTC${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
};

const formatTimestampInOffset = (timestamp: number, offsetMinutes: number, label?: string): string => {
  const shifted = new Date(timestamp + offsetMinutes * 60_000);
  const year = shifted.getUTCFullYear();
  const month = pad2(shifted.getUTCMonth() + 1);
  const day = pad2(shifted.getUTCDate());
  const hour = pad2(shifted.getUTCHours());
  const minute = pad2(shifted.getUTCMinutes());
  return `${year}-${month}-${day} ${hour}:${minute} (${label ?? formatOffsetLabel(offsetMinutes)})`;
};

export const formatReleaseTimestamp = (releaseAt: string): string => {
  const timestamp = parseReleaseTimestamp(releaseAt);
  if (timestamp === null) return '';
  const { offsetMinutes, label } = parseIsoOffsetMinutes(releaseAt);
  return formatTimestampInOffset(timestamp, offsetMinutes, label);
};

export const formatLocalReleaseTimestamp = (releaseAt: string, offsetMinutes?: number): string => {
  const timestamp = parseReleaseTimestamp(releaseAt);
  if (timestamp === null) return '';
  const localOffset = typeof offsetMinutes === 'number' ? offsetMinutes : -new Date(timestamp).getTimezoneOffset();
  return formatTimestampInOffset(timestamp, localOffset);
};
