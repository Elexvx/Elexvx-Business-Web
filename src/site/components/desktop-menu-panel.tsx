import type { NavigationGroup } from '../../data/research-navigation';
import type { Locale } from '../providers/i18n-context';
import { classNames } from './ui';

export const DesktopMenuPanel = ({
  panelGroup,
  openGroup,
  panelContentVisible,
  locale,
  t,
  resolveHref,
  onNavigate,
}: {
  panelGroup: NavigationGroup;
  openGroup: string | null;
  panelContentVisible: boolean;
  locale: Locale;
  t: (text: string) => string;
  resolveHref: (value: string) => string;
  onNavigate: () => void;
}) => (
  <div
    className={classNames('desktop-menu-panel', openGroup && 'is-open')}
    id="desktop-menu-panel"
    role="region"
    aria-label={locale === 'en' ? `${t(panelGroup.label)} navigation` : `${panelGroup.label}导航`}
    aria-hidden={!openGroup}
  >
    <div className="desktop-menu-panel-inner" key={panelGroup.id}>
      <div className={classNames('desktop-menu-panel-content', !panelContentVisible && 'is-content-hidden')}>
        {panelGroup.columns[0] && (
          <div className="desktop-menu-primary-group">
            <p className="desktop-menu-group-label">
              {locale === 'en' ? 'Explore ' : '探索'}
              {t(panelGroup.label)}
            </p>
            <div className="desktop-menu-primary-links">
              {panelGroup.columns[0].links.map((link) => (
                <a
                  href={resolveHref(link.href)}
                  key={`${panelGroup.id}-primary-${link.href}-${link.label}`}
                  onClick={onNavigate}
                >
                  {t(link.label)}
                </a>
              ))}
            </div>
          </div>
        )}
        {panelGroup.columns.length > 1 && (
          <div className="desktop-menu-secondary-group">
            <p className="desktop-menu-group-label">{t(panelGroup.columns[1].title)}</p>
            <div className="desktop-menu-secondary-links">
              {panelGroup.columns.slice(1).flatMap((column) =>
                column.links.map((link) => (
                  <a
                    href={resolveHref(link.href)}
                    key={`${panelGroup.id}-${column.title}-${link.href}-${link.label}`}
                    onClick={onNavigate}
                  >
                    {t(link.label)}
                  </a>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
