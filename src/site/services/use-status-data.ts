'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { serviceNavigationConfig } from '../../data/service-navigation';
import type { StatusApiResponse, StatusData } from '../../data/service-status';
import { createDemoStatusData } from './status-demo';

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
const MILLISECONDS_PER_SECOND = 1000;

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
  } catch (error) {
    console.warn('status.response.invalid_json', error instanceof Error ? error.message : String(error));
    return { code: response.status, message: '服务状态接口返回了无效响应', source: 'api' };
  }
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function useStatusData(historyDays: number) {
  const [state, setState] = useState<StatusDataState>({
    loading: true,
    refreshing: false,
    passwordRequired: false,
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
      const passwordHash = await sha256Hex(password);
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
    // Restore browser data after hydration so the initial render matches the export.
    const storedData = readStoredStatusData(historyDays);
    if (storedData) {
      setState({ data: storedData, loading: false, refreshing: true, passwordRequired: false });
    }
    void load();
    const timer = window.setInterval(
      () => void load(),
      serviceNavigationConfig.status.refreshIntervalSeconds * MILLISECONDS_PER_SECOND
    );
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [historyDays, load]);

  return { ...state, login, refresh: load };
}
