import { serviceNavigationConfig } from './service-navigation';
import type { MonitorState, MonitorType } from './status-constants';

export {
  isMonitorDown,
  isMonitorUp,
  MONITOR_STATE,
  STATUS_HISTORY_LIMITS,
  type MonitorState,
  type MonitorType,
} from './status-constants';

export interface AvailabilityDay {
  date: number;
  percent: number;
  down: { times: number; duration: number };
}

export interface StatusMonitor {
  id: number;
  name: string;
  url?: string;
  status: MonitorState;
  type: MonitorType;
  interval: number;
  percent: number;
  days: AvailabilityDay[];
  down: { times: number; duration: number };
}

interface StatusSummary {
  count: number;
  ok: number;
  error: number;
  unknown: number;
}

export interface StatusData {
  summary: StatusSummary;
  monitors: StatusMonitor[];
  timestamp: number;
}

export interface StatusApiResponse {
  code: number;
  message: string;
  source: 'api' | 'cache' | 'demo';
  data?: StatusData;
  passwordRequired?: boolean;
}

export const statusConfig = serviceNavigationConfig.status;
