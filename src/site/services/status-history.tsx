'use client';

import { serviceNavigationConfig } from '../../data/service-navigation';
import type { StatusData } from '../../data/service-status';
import { Eyebrow } from '../components/ui';
import { AvailabilityStrip, StatusDot } from './status-components';
import { formatDuration, formatPercent, monitorDisplayName, statusTone } from './status-utils';

export function StatusHistory({ data }: { data: StatusData }) {
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
