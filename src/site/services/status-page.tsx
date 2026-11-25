'use client';

import { CalendarOutlined } from '@ant-design/icons';

import { serviceNavigationConfig } from '../../data/service-navigation';
import { Eyebrow } from '../components/ui';
import { useI18n } from '../providers/i18n';
import { StatusErrorState, StatusLogin, StatusPanel, StatusSkeleton } from './status-components';
import { StatusHistory } from './status-history';
import { useStatusData } from './use-status-data';

const statusHomeHref = '/status/';
const statusHistoryHref = '/status/history/';

export const StatusPage = ({ history = false }: { history?: boolean }) => {
  const { locale, t, href } = useI18n();
  const historyDays = serviceNavigationConfig.status.historyDays;
  const { data, error, loading, refreshing, passwordRequired, login, refresh } = useStatusData(historyDays);
  const subtitle = history
    ? locale === 'en'
      ? `View service uptime records for the last ${historyDays} days.`
      : `查看最近 ${historyDays} 天的服务运行记录`
    : t(serviceNavigationConfig.status.description);

  return (
    <section className="service-status-page">
      <div className="service-status-main">
        <header className="service-status-heading">
          <div>
            <Eyebrow>{t('平台服务状态')}</Eyebrow>
            <h1>{history ? t('历史可用性') : t('服务状态')}</h1>
            <p>{subtitle}</p>
          </div>
        </header>

        {history ? (
          <a className="service-status-back" href={href(statusHomeHref)}>
            {t('返回当前状态')}
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
                  <a href={href(statusHistoryHref)}>
                    <CalendarOutlined aria-hidden="true" /> {t('查看历史记录')}
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
