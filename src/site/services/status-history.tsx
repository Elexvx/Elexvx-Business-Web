'use client';

import { serviceNavigationConfig } from '../../data/service-navigation';
import type { StatusData } from '../../data/service-status';
import { Eyebrow } from '../components/ui';
import { useI18n } from '../providers/i18n';
import { AvailabilityStrip, StatusDot } from './status-components';
import { formatDuration, formatPercent, monitorDisplayName, statusTone } from './status-utils';

export function StatusHistory({ data }: { data: StatusData }) {
  const { locale, t } = useI18n();
  const isEn = locale === 'en';
  const days = serviceNavigationConfig.status.historyDays;

  return (
    <section className="service-status-panel" aria-labelledby="service-history-title">
      <header className="service-status-panel-heading">
        <div>
          <Eyebrow>{isEn ? `History / ${days} days` : `历史记录 / ${days} 天`}</Eyebrow>
          <h2 id="service-history-title">{t('历史可用性')}</h2>
        </div>
        <span>{t('每个条代表一天的可用率')}</span>
      </header>
      <div className="service-history-list">
        {data.monitors.map((monitor) => {
          const name = t(monitorDisplayName(monitor.name));
          return (
            <section className="service-history-row" key={monitor.id}>
              <div className="service-history-heading">
                <div className="service-status-group-identity">
                  <StatusDot tone={statusTone(monitor.status)} />
                  <strong>{name}</strong>
                </div>
                <span>{formatPercent(monitor.percent)}</span>
              </div>
              <AvailabilityStrip days={monitor.days} label={name} currentStatus={monitor.status} />
              {monitor.down.times > 0 ? (
                <p>
                  {isEn
                    ? `In the last ${days} days: ${monitor.down.times} outage${monitor.down.times === 1 ? '' : 's'}, ${formatDuration(monitor.down.duration, locale)} total downtime.`
                    : `最近 ${days} 天发生 ${monitor.down.times} 次中断，累计 ${formatDuration(monitor.down.duration)}。`}
                </p>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}
