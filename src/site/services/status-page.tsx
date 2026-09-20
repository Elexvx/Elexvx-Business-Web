'use client';

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ExportOutlined,
  LockOutlined,
  ReloadOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent as ReactFormEvent } from 'react';

import { serviceNavigationConfig } from '../../data/service-navigation';
import type {
  AvailabilityDay,
  MonitorState,
  StatusApiResponse,
  StatusData,
  StatusMonitor,
} from '../../data/service-status';
import { Eyebrow } from '../components/ui';
import { createDemoStatusData } from './status-demo';
import {
  availabilityTone,
  formatDay,
  formatDuration,
  formatPercent,
  formatStatusTime,
  groupStatusMonitors,
  monitorDisplayName,
  statusTone,
  type StatusGroup,
  type StatusTone,
} from './status-utils';

interface StatusPageProps {
  history?: boolean;
}

interface StatusDataState {
  data?: StatusData;
  error?: string;
  loading: boolean;
  refreshing: boolean;
  passwordRequired: boolean;
}

interface StoredStatusData {
  savedAt: number;
  data: StatusData;
}

const STATUS_CACHE_KEY = 'elexvx-status-data-v1';
const STATUS_CACHE_MAX_AGE_MS = 10 * 60 * 1000;
const STATUS_OVERVIEW_DAYS = serviceNavigationConfig.status.historyDays;

const statusCacheKey = (historyDays: number) => `${STATUS_CACHE_KEY}-${historyDays}`;

const readStoredStatusData = (historyDays: number): StatusData | undefined => {
  try {
    const value = window.localStorage.getItem(statusCacheKey(historyDays));
    if (!value) return undefined;
    const stored = JSON.parse(value) as StoredStatusData;
    if (!stored.data || Date.now() - stored.savedAt > STATUS_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(statusCacheKey(historyDays));
      return undefined;
    }
    return stored.data;
  } catch {
    return undefined;
  }
};

const storeStatusData = (data: StatusData, historyDays: number) => {
  try {
    window.localStorage.setItem(statusCacheKey(historyDays), JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // A cached snapshot is optional when storage is unavailable.
  }
};

async function parseResponse(response: Response): Promise<StatusApiResponse> {
  try {
    return (await response.json()) as StatusApiResponse;
  } catch {
    return { code: response.status, message: '服务状态接口返回了无效响应', source: 'api' };
  }
}

function useStatusData(historyDays: number) {
  const [state, setState] = useState<StatusDataState>(() => {
    const storedData = readStoredStatusData(historyDays);
    return {
      ...(storedData ? { data: storedData } : {}),
      loading: !storedData,
      refreshing: Boolean(storedData),
      passwordRequired: false,
    };
  });
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setState((current) => ({
      ...current,
      error: undefined,
      loading: current.data ? false : true,
      refreshing: Boolean(current.data),
    }));

    try {
      const response = await fetch(`/api/status/?days=${historyDays}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const payload = await parseResponse(response);

      if ((!response.ok || !payload.data) && process.env.NODE_ENV === 'development') {
        const demoData = createDemoStatusData(serviceNavigationConfig.status.historyDays);
        if (mountedRef.current) {
          setState({ data: demoData, loading: false, refreshing: false, passwordRequired: false });
        }
        return;
      }

      if (!response.ok || !payload.data) {
        if (response.status === 401 && payload.passwordRequired) {
          if (mountedRef.current) setState({ loading: false, refreshing: false, passwordRequired: true });
          return;
        }
        throw new Error(payload.message || '无法获取服务状态');
      }

      if (mountedRef.current) {
        storeStatusData(payload.data, historyDays);
        setState({ data: payload.data, loading: false, refreshing: false, passwordRequired: false });
      }
    } catch (error) {
      if (mountedRef.current) {
        if (process.env.NODE_ENV === 'development') {
          setState({
            data: createDemoStatusData(serviceNavigationConfig.status.historyDays),
            loading: false,
            refreshing: false,
            passwordRequired: false,
          });
          return;
        }
        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : '无法获取服务状态',
          loading: false,
          refreshing: false,
        }));
      }
    }
  }, [historyDays]);

  const login = useCallback(
    async (password: string) => {
      const bytes = new TextEncoder().encode(password);
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const passwordHash = [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, '0')).join('');
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordHash }),
      });
      const payload = await parseResponse(response);
      if (!response.ok) throw new Error(payload.message || '登录失败');
      await load();
    },
    [load]
  );

  useEffect(() => {
    mountedRef.current = true;
    void load();
    const timer = window.setInterval(() => void load(), serviceNavigationConfig.status.refreshIntervalSeconds * 1000);
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [load]);

  return { ...state, login, refresh: load };
}

function StatusDot({ tone }: { tone: StatusTone }) {
  return <span className={`service-status-dot service-status-dot-${tone}`} aria-hidden="true" />;
}

function AvailabilityStrip({
  days,
  label,
  currentStatus,
}: {
  days: AvailabilityDay[];
  label: string;
  currentStatus: MonitorState;
}) {
  const visibleDays = days.slice(-serviceNavigationConfig.status.historyDays);
  const currentDayDown = currentStatus === 8 || currentStatus === 9;

  return (
    <div className="service-availability-strip" aria-label={`${label}最近 ${days.length} 天可用性`} role="img">
      {visibleDays.map((day, index) => {
        const isLatestDay = index === visibleDays.length - 1;
        const markCurrentDayDown = isLatestDay && currentDayDown && day.percent === 0;
        return (
          <span
            className={`service-availability-bar service-availability-${availabilityTone(day.percent, markCurrentDayDown)}`}
            key={`${day.date}-${index}`}
            title={`${isLatestDay ? '今天' : formatDay(day.date)} · 可用率 ${formatPercent(day.percent)}`}
          />
        );
      })}
    </div>
  );
}

function MonitorRow({ monitor }: { monitor: StatusMonitor }) {
  const tone = statusTone(monitor.status);
  const name = monitorDisplayName(monitor.name);
  const statusLabel = tone === 'healthy' ? '正常运行' : tone === 'error' ? '服务异常' : '状态未知';
  return (
    <div className="service-monitor-row">
      <div className="service-monitor-identity">
        <StatusDot tone={tone} />
        <div>
          <strong>{name}</strong>
          <span>{statusLabel}</span>
        </div>
      </div>
      <AvailabilityStrip days={monitor.days} label={name} currentStatus={monitor.status} />
      <span className="service-monitor-uptime">{formatPercent(monitor.percent)}</span>
      {monitor.url ? (
        <a
          className="service-monitor-action"
          href={monitor.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`打开${name}`}
        >
          <ExportOutlined aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}

function GroupLabel({ group }: { group: StatusGroup }) {
  const tone = statusTone(group.status);
  return (
    <div className="service-status-group-label">
      <div className="service-status-group-identity">
        <StatusDot tone={tone} />
        <div>
          <strong>{group.name}</strong>
          <span>{group.monitors.length} 个组件</span>
        </div>
      </div>
      <AvailabilityStrip days={group.days} label={group.name} currentStatus={group.status} />
      <span className="service-group-uptime">{formatPercent(group.percent)}</span>
    </div>
  );
}

function StatusSummary({
  data,
  onRefresh,
  refreshing,
}: {
  data: StatusData;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const hasErrors = data.summary.error > 0;
  const hasUnknown = data.summary.unknown > 0;
  const unavailable = data.monitors.filter((monitor) => monitor.status === 8 || monitor.status === 9);
  const tone: StatusTone = hasErrors ? 'error' : hasUnknown ? 'warning' : 'healthy';
  const title = hasErrors ? '部分系统出现异常' : hasUnknown ? '部分系统状态未知' : '所有系统运行正常';
  return (
    <div className={`service-status-summary service-status-summary-${tone}`} role="alert">
      <span className="service-status-summary-icon" aria-hidden="true">
        {hasErrors ? <WarningFilled /> : <CheckCircleFilled />}
      </span>
      <div>
        <h2 id="service-status-summary-title">{title}</h2>
        <div className="service-status-summary-details">
          <span>最近更新：{formatStatusTime(data.timestamp)}</span>
          {unavailable.length > 0 ? (
            <span>受影响服务：{unavailable.map((monitor) => monitorDisplayName(monitor.name)).join('、')}。</span>
          ) : null}
        </div>
      </div>
      <button
        className={`service-refresh-button${refreshing ? ' is-refreshing' : ''}`}
        type="button"
        aria-label="刷新状态"
        title="刷新状态"
        onClick={() => void onRefresh()}
        disabled={refreshing}
      >
        <ReloadOutlined aria-hidden="true" />
      </button>
    </div>
  );
}

function StatusPanel({
  data,
  onRefresh,
  refreshing,
}: {
  data: StatusData;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const groups = useMemo(() => groupStatusMonitors(data.monitors), [data.monitors]);
  const [openGroups, setOpenGroups] = useState<string[]>(() => groups.map((group) => group.id));

  useEffect(() => {
    setOpenGroups(groups.map((group) => group.id));
  }, [groups]);

  const toggleGroup = (id: string) => {
    setOpenGroups((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  return (
    <section className="service-status-panel" aria-labelledby="service-status-summary-title">
      <StatusSummary data={data} onRefresh={onRefresh} refreshing={refreshing} />
      <div className="service-status-groups">
        {groups.map((group) => {
          const open = openGroups.includes(group.id);
          return (
            <div className="service-status-group" key={group.id}>
              <button
                className="service-status-group-trigger"
                type="button"
                aria-expanded={open}
                aria-controls={`${group.id}-monitors`}
                onClick={() => toggleGroup(group.id)}
              >
                <GroupLabel group={group} />
                <span className={`service-status-chevron${open ? ' is-open' : ''}`} aria-hidden="true" />
              </button>
              {open ? (
                <div className="service-monitor-list" id={`${group.id}-monitors`}>
                  {group.monitors.map((monitor) => (
                    <MonitorRow key={monitor.id} monitor={monitor} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusHistory({ data }: { data: StatusData }) {
  return (
    <section className="service-status-panel" aria-labelledby="service-history-title">
      <header className="service-status-panel-heading">
        <div>
          <Eyebrow>HISTORY / {serviceNavigationConfig.status.historyDays} DAYS</Eyebrow>
          <h2 id="service-history-title">历史可用性</h2>
        </div>
        <span>每个条代表一天的可用率</span>
      </header>
      <div className="service-history-list">
        {data.monitors.map((monitor) => (
          <section className="service-history-row" key={monitor.id}>
            <div className="service-history-heading">
              <div className="service-status-group-identity">
                <StatusDot tone={statusTone(monitor.status)} />
                <strong>{monitorDisplayName(monitor.name)}</strong>
              </div>
              <span>{formatPercent(monitor.percent)}</span>
            </div>
            <AvailabilityStrip
              days={monitor.days}
              label={monitorDisplayName(monitor.name)}
              currentStatus={monitor.status}
            />
            {monitor.down.times > 0 ? (
              <p>
                最近 {serviceNavigationConfig.status.historyDays} 天发生 {monitor.down.times} 次中断，累计{' '}
                {formatDuration(monitor.down.duration)}。
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}

function StatusLogin({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (event: ReactFormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setError('请输入访问密码');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await onLogin(password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="service-login-panel" aria-labelledby="service-login-title">
      <LockOutlined className="service-login-icon" aria-hidden="true" />
      <h2 id="service-login-title">服务状态受保护</h2>
      <p>请输入访问密码后查看监控数据。</p>
      {error ? (
        <p className="service-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <form onSubmit={submit}>
        <label>
          <span className="sr-only">访问密码</span>
          <input
            autoComplete="current-password"
            type="password"
            placeholder="访问密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? '验证中…' : '登录'}
        </button>
      </form>
    </section>
  );
}

const statusHomeHref = '/status/';
const statusHistoryHref = '/status/history/';

export const StatusPage = ({ history = false }: StatusPageProps) => {
  const historyDays = history ? serviceNavigationConfig.status.historyDays : STATUS_OVERVIEW_DAYS;
  const { data, error, loading, refreshing, passwordRequired, login, refresh } = useStatusData(historyDays);

  return (
    <section className="service-status-page">
      <div className="service-status-main">
        <header className="service-status-heading">
          <div>
            <Eyebrow>ELEXVX / PLATFORM STATUS</Eyebrow>
            <h1>{history ? '历史可用性' : '服务状态'}</h1>
            <p>
              {history
                ? `查看最近 ${serviceNavigationConfig.status.historyDays} 天的服务运行记录`
                : serviceNavigationConfig.status.description}
            </p>
          </div>
        </header>

        {history ? (
          <a className="service-status-back" href={statusHomeHref}>
            <ArrowLeftOutlined aria-hidden="true" /> 返回当前状态
          </a>
        ) : null}

        <div
          className={`service-status-result${history ? '' : ' service-status-result-current'}${
            loading ? ' is-loading' : ''
          }`}
          aria-busy={loading}
        >
          {loading ? (
            <div className="service-status-loading" role="status" aria-label="正在加载服务状态">
              <span />
              <span />
              <span />
              <span />
            </div>
          ) : passwordRequired ? (
            <StatusLogin onLogin={login} />
          ) : error || !data ? (
            <section className="service-status-error" role="alert">
              <WarningFilled aria-hidden="true" />
              <h2>暂时无法获取服务状态</h2>
              <p>{error || '请稍后重试'}</p>
              <button type="button" onClick={() => void refresh()}>
                重新加载
              </button>
            </section>
          ) : (
            <>
              {history ? (
                <StatusHistory data={data} />
              ) : (
                <StatusPanel data={data} onRefresh={refresh} refreshing={refreshing} />
              )}
              {!history ? (
                <div className="service-history-action">
                  <a href={statusHistoryHref}>
                    <CalendarOutlined aria-hidden="true" /> 查看历史记录
                  </a>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
