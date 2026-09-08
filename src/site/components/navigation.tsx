'use client';
import { ArrowRightOutlined, MenuOutlined } from '@ant-design/icons';

import { useEffect, useRef, useState } from 'react';

import { navigationGroups, withNewsCategories, type NavigationGroup } from '../../data/research-navigation';
import { useI18n } from '../providers/i18n';

import dynamic from 'next/dynamic';
import { useAvailableLink, usePublishedNews } from '../providers/content-context';
import { classNames, Logo } from './ui';
const NavigationSearch = dynamic(() => import('./navigation-search').then((module) => module.NavigationSearch));

export const GlobalNav = ({ activePath = '/', tone = 'light' }: { activePath?: string; tone?: 'light' | 'dark' }) => {
  const { locale, t, href } = useI18n();
  const isAvailableLink = useAvailableLink();
  const newsCategories = usePublishedNews().map((item) => item.category);
  const visibleNavigationGroups = withNewsCategories(navigationGroups, newsCategories)
    .map((group) => ({
      ...group,
      columns: group.columns
        .map((column) => ({
          ...column,
          links: column.links.filter((link) => isAvailableLink(link.href)),
        }))
        .filter((column) => column.links.length > 0),
    }))
    .filter((group) => isAvailableLink(group.href) && group.columns.length > 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);
  const [panelGroup, setPanelGroup] = useState<NavigationGroup | null>(null);
  const [panelContentVisible, setPanelContentVisible] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const contentSwapTimerRef = useRef<number | null>(null);
  const contentFrameRef = useRef<number | null>(null);

  const clearInteractionTimers = () => {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  };

  const clearContentTransition = () => {
    if (contentSwapTimerRef.current !== null) window.clearTimeout(contentSwapTimerRef.current);
    if (contentFrameRef.current !== null) window.cancelAnimationFrame(contentFrameRef.current);
    contentSwapTimerRef.current = null;
    contentFrameRef.current = null;
  };

  const revealPanelContent = () => {
    contentFrameRef.current = window.requestAnimationFrame(() => {
      contentFrameRef.current = window.requestAnimationFrame(() => {
        setPanelContentVisible(true);
        contentFrameRef.current = null;
      });
    });
  };

  const activateGroup = (groupId: string) => {
    const nextGroup = visibleNavigationGroups.find((group) => group.id === groupId);
    if (!nextGroup) return;

    clearInteractionTimers();
    if (openGroup && panelGroup && panelGroup.id !== groupId) {
      clearContentTransition();
      setPanelContentVisible(false);
      contentSwapTimerRef.current = window.setTimeout(() => {
        setPanelGroup(nextGroup);
        contentSwapTimerRef.current = null;
        revealPanelContent();
      }, 180);
    } else {
      clearContentTransition();
      setPanelGroup(nextGroup);
      setPanelContentVisible(true);
      if (!panelGroup) {
        contentFrameRef.current = window.requestAnimationFrame(() => {
          contentFrameRef.current = window.requestAnimationFrame(() => {
            setOpenGroup(groupId);
            contentFrameRef.current = null;
          });
        });
        return;
      }
    }
    setOpenGroup(groupId);
  };

  const scheduleOpen = (groupId: string) => {
    clearInteractionTimers();
    if (openGroup === groupId) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      activateGroup(groupId);
    }, 280);
  };

  const cancelScheduledOpen = () => {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  };

  const closeDesktopMenu = () => {
    clearInteractionTimers();
    clearContentTransition();
    setPanelContentVisible(true);
    setOpenGroup(null);
  };

  const scheduleClose = () => {
    clearInteractionTimers();
    clearContentTransition();
    closeTimerRef.current = window.setTimeout(() => setOpenGroup(null), 240);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        closeDesktopMenu();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closeDesktopMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    if (menuOpen) document.body.classList.add('menu-is-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.body.classList.remove('menu-is-open');
      clearInteractionTimers();
      clearContentTransition();
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={classNames('global-nav', tone === 'dark' && 'global-nav-dark')}
        ref={navRef}
        onMouseEnter={() => {
          if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }}
        onMouseLeave={scheduleClose}
      >
        <div className="global-nav-inner">
          <a className="brand-lockup" href={href('/')} aria-label={t('Elexvx Research 首页')}>
            <Logo inverse={tone === 'dark'} />
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
                href={href(group.href)}
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
            {/* Temporarily hidden; keep both action links available for restoration. */}
            {/*
              <>
                <a className="nav-utility-link" href={href('/company')}>
                  {t('关于公司')}
                </a>
                <a className="nav-primary-link" href={href('/contact')}>
                  {t('开放合作')}
                </a>
              </>
            */}
            <button
              className="mobile-menu-button"
              type="button"
              aria-label={t(menuOpen ? '关闭导航菜单' : '打开导航菜单')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => {
                setMobileOpenGroup(null);
                setMenuOpen((value) => !value);
              }}
            >
              <MenuOutlined aria-hidden="true" />
            </button>
          </div>
        </div>

        {panelGroup && (
          <div
            className={classNames('desktop-menu-panel', openGroup && 'is-open')}
            id="desktop-menu-panel"
            role="region"
            aria-label={`${t(panelGroup.label)} navigation`}
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
                          href={href(link.href)}
                          key={`${panelGroup.id}-primary-${link.href}-${link.label}`}
                          onClick={closeDesktopMenu}
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
                            href={href(link.href)}
                            key={`${panelGroup.id}-${column.title}-${link.href}-${link.label}`}
                            onClick={closeDesktopMenu}
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
        )}
      </header>

      <div
        className={classNames('mobile-navigation', tone === 'dark' && 'mobile-navigation-dark', menuOpen && 'is-open')}
        id="mobile-navigation"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-navigation-inner">
          <div className="mobile-navigation-heading">
            {menuOpen && <NavigationSearch onNavigate={() => setMenuOpen(false)} />}
            <button
              type="button"
              className="mobile-close-button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('关闭导航菜单')}
            >
              ×
            </button>
          </div>
          <nav className="mobile-navigation-groups" aria-label={t('移动端主导航')}>
            {visibleNavigationGroups.map((group) => (
              <details className="mobile-navigation-group" key={group.id} open={mobileOpenGroup === group.id}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setMobileOpenGroup((currentGroup) => (currentGroup === group.id ? null : group.id));
                  }}
                >
                  {group.id === 'research' ? (
                    <a
                      href={href(group.href)}
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                      }}
                    >
                      {t(group.label)}
                    </a>
                  ) : (
                    <span>{t(group.label)}</span>
                  )}
                  <span className="mobile-summary-chevron" aria-hidden="true" />
                </summary>
                <div className="mobile-navigation-links">
                  {group.columns
                    .flatMap((column) => column.links)
                    .map((link, linkIndex) => (
                      <a
                        href={href(link.href)}
                        key={`${group.id}-${link.href}-${linkIndex}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{t(link.label)}</span>
                        <ArrowRightOutlined aria-hidden="true" />
                      </a>
                    ))}
                </div>
              </details>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};
