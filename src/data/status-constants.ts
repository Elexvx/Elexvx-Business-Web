export type MonitorState = 0 | 1 | 2 | 8 | 9;
export type MonitorType = 1 | 2 | 3 | 4 | 5;

export const MONITOR_STATE = {
  paused: 0,
  notCheckedYet: 1,
  up: 2,
  seemsDown: 8,
  down: 9,
} as const satisfies Record<string, MonitorState>;

export const STATUS_HISTORY_LIMITS = {
  minDays: 7,
  maxDays: 90,
  overviewDays: 14,
  defaultDays: 60,
} as const;

export const isMonitorUp = (status: MonitorState): boolean => status === MONITOR_STATE.up;

export const isMonitorDown = (status: MonitorState): boolean =>
  status === MONITOR_STATE.seemsDown || status === MONITOR_STATE.down;
