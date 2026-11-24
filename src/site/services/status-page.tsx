'use client';

import { CalendarOutlined } from '@ant-design/icons';

import { serviceNavigationConfig } from '../../data/service-navigation';
import { Eyebrow } from '../components/ui';
import { StatusErrorState, StatusLogin, StatusPanel, StatusSkeleton } from './status-components';
import { StatusHistory } from './status-history';
import { useStatusData } from './use-status-data';

const statusHomeHref = '/status/';
const statusHistoryHref = '/status/history/';

export const StatusPage = ({ history = false }: { history?: boolean }) => {
  const historyDays = serviceNavigationConfig.status.historyDays;
  const { data, error, loading, refreshing, passwordRequired, login, refresh } = useStatusData(historyDays);

  return (
    <section className="service-status-page">
      <div className="service-status-main">
        <header className="service-status-heading">
          <div>
            <Eyebrow>平台服务状态</Eyebrow>
            <h1>{history ? '历史可用性' : '服务状态'}</h1>
            <p>{history ? `查看最近 ${historyDays} 天的服务运行记录` : serviceNavigationConfig.status.description}</p>
          </div>
        </header>

        {history ? (
          <a className="service-status-back" href={statusHomeHref}>
            返回当前状态
          </a>
        ) : null}

        <div
          className={`service-status-result${history ? '' : ' service-status-result-current'}${
            loading ? ' is-loading' : ''
          }`}
          aria-busy={loading}
        >
          {loading ? (
            <StatusSkeleton history={history} />
          ) : passwordRequired ? (
            <StatusLogin onLogin={login} />
          ) : error || !data ? (
            <StatusErrorState error={error} onRetry={() => void refresh()} />
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
