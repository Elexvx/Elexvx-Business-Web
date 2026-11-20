'use client';
import { MenuOutlined } from '@ant-design/icons';

import { useI18n } from '../providers/i18n';
import { useVisibleNavigationGroups } from '../providers/content-context';
import { resolveOriginHref } from '../routing/content-href';
import { DesktopMenuPanel } from './desktop-menu-panel';
import { MobileNavigationDrawer } from './mobile-navigation-drawer';
import { classNames, Logo } from './ui';
import { useNavigationMenus } from './use-navigation-menus';

export const GlobalNav = ({
  activePath = '/',
  tone = 'light',
  linkOrigin,
}: {
  activePath?: string;
  tone?: 'light' | 'dark';
  linkOrigin?: string;
}) => {
  const { locale, t, href } = useI18n();
  const resolveHref = (value: string) => resolveOriginHref(href(value), linkOrigin);
  const visibleNavigationGroups = useVisibleNavigationGroups();
  const {
    menuOpen,
    setMenuOpen,
    openGroup,
    mobileOpenGroup,
    setMobileOpenGroup,
    panelGroup,
    panelContentVisible,
    navRef,
    mobileMenuButtonRef,
    mobileNavigationRef,
    activateGroup,
    scheduleOpen,
    cancelScheduledOpen,
    closeDesktopMenu,
    scheduleClose,
    cancelScheduledClose,
    toggleMobileMenu,
  } = useNavigationMenus(visibleNavigationGroups);

  return (
    <>
      <header
        className={classNames('global-nav', tone === 'dark' && 'global-nav-dark')}
        ref={navRef}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
      >
        <div className="global-nav-inner">
          <a className="brand-lockup" href={resolveHref('/')} aria-label={t('Elexvx Research 首页')}>
            <Logo inverse={tone === 'dark'} eager />
            <span className="brand-divider" aria-hidden="true" />
            <span className="research-wordmark">Research</span>
          </a>

          <nav className="desktop-nav" aria-label={t('主导航')}>
            {visibleNavigationGroups.map((group) => (
              <a
                className={classNames(
                  'nav-link',
                  group.paths.some((path) => activePath.startsWith(path)) && 'is-active',
                  openGroup === group.id && 'is-open'
                )}
                key={group.id}
                href={resolveHref(group.href)}
                aria-expanded={openGroup === group.id}
                aria-controls={openGroup === group.id ? 'desktop-menu-panel' : undefined}
                onMouseEnter={() => scheduleOpen(group.id)}
                onMouseLeave={cancelScheduledOpen}
                onFocus={() => activateGroup(group.id)}
                onClick={closeDesktopMenu}
              >
                {t(group.label)}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className="mobile-menu-button"
              ref={mobileMenuButtonRef}
              type="button"
              aria-label={t(menuOpen ? '关闭导航菜单' : '打开导航菜单')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={toggleMobileMenu}
            >
              <MenuOutlined aria-hidden="true" />
            </button>
          </div>
        </div>

        {panelGroup && (
          <DesktopMenuPanel
            panelGroup={panelGroup}
            openGroup={openGroup}
            panelContentVisible={panelContentVisible}
            locale={locale}
            t={t}
            resolveHref={resolveHref}
            onNavigate={closeDesktopMenu}
          />
        )}
      </header>

      <MobileNavigationDrawer
        drawerRef={mobileNavigationRef}
        tone={tone}
        menuOpen={menuOpen}
        locale={locale}
        t={t}
        visibleNavigationGroups={visibleNavigationGroups}
        mobileOpenGroup={mobileOpenGroup}
        onToggleGroup={(groupId) => setMobileOpenGroup((currentGroup) => (currentGroup === groupId ? null : groupId))}
        resolveHref={resolveHref}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
};
