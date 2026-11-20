import dynamic from 'next/dynamic';
import type { RefObject } from 'react';

import type { NavigationGroup } from '../../data/research-navigation';
import type { Locale } from '../providers/i18n';
import { classNames } from './ui';

const NavigationSearch = dynamic(() => import('./navigation-search').then((module) => module.NavigationSearch));

export const MobileNavigationDrawer = ({
  drawerRef,
  tone,
  menuOpen,
  locale,
  t,
  visibleNavigationGroups,
  mobileOpenGroup,
  onToggleGroup,
  resolveHref,
  onClose,
}: {
  drawerRef: RefObject<HTMLDivElement | null>;
  tone: 'light' | 'dark';
  menuOpen: boolean;
  locale: Locale;
  t: (text: string) => string;
  visibleNavigationGroups: NavigationGroup[];
  mobileOpenGroup: string | null;
  onToggleGroup: (groupId: string) => void;
  resolveHref: (value: string) => string;
  onClose: () => void;
}) => (
  <div
    ref={drawerRef}
    className={classNames('mobile-navigation', tone === 'dark' && 'mobile-navigation-dark', menuOpen && 'is-open')}
    id="mobile-navigation"
    role="dialog"
    aria-modal="true"
    aria-label={locale === 'en' ? 'Mobile navigation' : '移动端导航菜单'}
    aria-hidden={!menuOpen}
  >
    <div className="mobile-navigation-inner">
      <div className="mobile-navigation-heading">
        {menuOpen && <NavigationSearch onNavigate={onClose} />}
        <button type="button" className="mobile-close-button" onClick={onClose} aria-label={t('关闭导航菜单')}>
          ×
        </button>
      </div>
      <nav className="mobile-navigation-groups" aria-label={t('移动端主导航')}>
        {visibleNavigationGroups.map((group) => (
          <details className="mobile-navigation-group" key={group.id} open={mobileOpenGroup === group.id}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                onToggleGroup(group.id);
              }}
            >
              <span>{t(group.label)}</span>
              <span className="mobile-summary-chevron" aria-hidden="true" />
            </summary>
            <div className="mobile-navigation-links">
              {group.columns
                .flatMap((column) => column.links)
                .map((link, linkIndex) => (
                  <a href={resolveHref(link.href)} key={`${group.id}-${link.href}-${linkIndex}`} onClick={onClose}>
                    <span>{t(link.label)}</span>
                  </a>
                ))}
            </div>
          </details>
        ))}
      </nav>
    </div>
  </div>
);
