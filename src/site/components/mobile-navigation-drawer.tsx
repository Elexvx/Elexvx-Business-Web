import dynamic from 'next/dynamic';
import { Dialog } from 'radix-ui';
import { useRef, type RefObject } from 'react';

import type { NavigationGroup } from '../../data/research-navigation';
import type { Locale } from '../providers/i18n';
import { classNames } from './ui';
import { ModalContent } from './primitives/modal';

const NavigationSearch = dynamic(() => import('./navigation-search').then((module) => module.NavigationSearch));

export const MobileNavigationDrawer = ({
  triggerRef,
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
  triggerRef: RefObject<HTMLButtonElement | null>;
  tone: 'light' | 'dark';
  menuOpen: boolean;
  locale: Locale;
  t: (text: string) => string;
  visibleNavigationGroups: NavigationGroup[];
  mobileOpenGroup: string | null;
  onToggleGroup: (groupId: string) => void;
  resolveHref: (value: string) => string;
  onClose: () => void;
}) => {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef}>
      <ModalContent
        container={portalRef.current}
        returnFocusRef={triggerRef}
        className={classNames('mobile-navigation', tone === 'dark' && 'mobile-navigation-dark', menuOpen && 'is-open')}
        id="mobile-navigation"
        aria-describedby={undefined}
        onEscapeKeyDown={(event) => {
          const search = event.target instanceof Element ? event.target.closest('.navigation-search') : null;
          if (search?.querySelector<HTMLInputElement>('input')?.value) event.preventDefault();
        }}
      >
        <Dialog.Title className="ui-visually-hidden">
          {locale === 'en' ? 'Mobile navigation' : '移动端导航菜单'}
        </Dialog.Title>
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
      </ModalContent>
    </div>
  );
};
