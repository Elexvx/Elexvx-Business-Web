'use client';

import { ArrowRightOutlined, MenuOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { elexvxTheme } from './theme';
import { businessLines, footerColumns, siteIdentity } from '../data/site';
import { navigationGroups, type NavigationGroup } from '../data/research-navigation';
import { useI18n } from './i18n';

export type TileTone = 'light' | 'dark' | 'parchment';

export const classNames = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const Logo = ({ inverse = false }: { inverse?: boolean }) => (
  <img
    className="site-logo"
    src={inverse ? '/brand/elexvx-logo-white.svg' : '/brand/elexvx-logo-black.svg'}
    alt="Elexvx"
    width="112"
    height="26"
  />
);

export const GlobalNav = ({ activePath = '/', tone = 'light' }: { activePath?: string; tone?: 'light' | 'dark' }) => {
  const { locale, t, href, switchHref } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(navigationGroups[0]?.id ?? null);
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
    const nextGroup = navigationGroups.find((group) => group.id === groupId);
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

  const scheduleGroup = (groupId: string) => {
    if (openGroup === groupId) return;
    clearInteractionTimers();
    clearContentTransition();
    openTimerRef.current = window.setTimeout(() => activateGroup(groupId), 110);
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
            {navigationGroups.map((group) => (
              <button
                className={classNames(
                  'nav-link',
                  group.paths.some((path) => activePath.startsWith(path)) && 'is-active',
                  openGroup === group.id && 'is-open'
                )}
                type="button"
                key={group.id}
                aria-expanded={openGroup === group.id}
                aria-controls={openGroup ? 'desktop-menu-panel' : undefined}
                onMouseEnter={() => scheduleGroup(group.id)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible')) activateGroup(group.id);
                }}
                onClick={() => (openGroup === group.id ? closeDesktopMenu() : activateGroup(group.id))}
              >
                {t(group.label)}
                <span className="nav-chevron" aria-hidden="true" />
              </button>
            ))}
          </nav>

          <div className="nav-actions">
            <a className="nav-language-link" href={switchHref} hrefLang={locale === 'en' ? 'zh-CN' : 'en'}>
              {locale === 'en' ? '中文' : 'EN'}
            </a>
            <a className="nav-utility-link" href={href('/company')}>
              {t('关于公司')}
            </a>
            <a className="nav-primary-link" href={href('/contact')}>
              {t('开放合作')}
            </a>
            <button
              className="mobile-menu-button"
              type="button"
              aria-label={t(menuOpen ? '关闭导航菜单' : '打开导航菜单')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((value) => !value)}
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
                <div className="desktop-menu-lead">
                  <p className="desktop-menu-eyebrow">{panelGroup.englishTitle}</p>
                  <h2>{t(panelGroup.title)}</h2>
                  <p>{t(panelGroup.intro)}</p>
                  <a href={href(panelGroup.href)} onClick={closeDesktopMenu}>
                    {t('查看全部')} <ArrowRightOutlined aria-hidden="true" />
                  </a>
                </div>
                <div className="desktop-menu-columns">
                  {panelGroup.columns.map((column) => (
                    <div className="desktop-menu-column" key={column.title}>
                      <h3>{t(column.title)}</h3>
                      {column.links.map((link) => (
                        <a
                          href={href(link.href)}
                          key={`${panelGroup.id}-${column.title}-${link.href}-${link.label}`}
                          onClick={closeDesktopMenu}
                        >
                          {t(link.label)}
                          <ArrowRightOutlined aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
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
            <span>Explore Elexvx Research</span>
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
            {navigationGroups.map((group) => (
              <details className="mobile-navigation-group" key={group.id} open={mobileOpenGroup === group.id}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setMobileOpenGroup((currentGroup) => (currentGroup === group.id ? null : group.id));
                  }}
                >
                  <span>{t(group.label)}</span>
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
          <div className="mobile-navigation-footer">
            <a href={href('/business')}>{t('并行业务')}</a>
            <a href={href('/careers')}>{t('加入我们')}</a>
            <a href={href('/contact')}>{t('开放合作')}</a>
            <a href={switchHref} hrefLang={locale === 'en' ? 'zh-CN' : 'en'}>
              {locale === 'en' ? '中文' : 'English'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export const ActionButton = ({
  href,
  children,
  secondary = false,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  dark?: boolean;
}) => {
  const { t, href: localizedHref } = useI18n();
  return (
    <a
      href={localizedHref(href)}
      className={classNames('action-button', secondary && 'action-button-secondary', dark && 'action-button-on-dark')}
    >
      {typeof children === 'string' ? t(children) : children}
    </a>
  );
};

export const TextLink = ({
  href,
  children,
  onDark = false,
}: {
  href: string;
  children: ReactNode;
  onDark?: boolean;
}) => {
  const { t, href: localizedHref } = useI18n();
  return (
    <a className={classNames('text-link', onDark && 'text-link-on-dark')} href={localizedHref(href)}>
      {typeof children === 'string' ? t(children) : children}
      <ArrowRightOutlined aria-hidden="true" />
    </a>
  );
};

export const Eyebrow = ({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) => {
  const { t } = useI18n();
  return (
    <p className={classNames('eyebrow', onDark && 'eyebrow-on-dark')}>
      {typeof children === 'string' ? t(children) : children}
    </p>
  );
};

export const TechnicalFigure = ({
  variant = 'network',
  label,
}: {
  variant?: 'network' | 'signal' | 'boundary';
  label?: string;
}) => {
  const { t } = useI18n();
  const figureContent = {
    network: {
      eyebrow: 'RESEARCH MAP',
      title: '研究系统 / 真实问题',
      description: '这里将替换为研究方向、问题与方法之间的真实关系图。',
      asset: '研究方向关系图',
    },
    signal: {
      eyebrow: 'PROJECT EVIDENCE',
      title: '项目系统 / 证据边界',
      description: '这里将替换为真实项目现场、系统截图或技术架构图。',
      asset: '项目现场或系统架构图',
    },
    boundary: {
      eyebrow: 'METHOD MAP',
      title: '方向 → 方法 → 输出',
      description: '这里将替换为已核验的研究流程或成果素材。',
      asset: '研究流程 / 输出关系图',
    },
  }[variant];

  return (
    <figure className={classNames('technical-figure', `technical-figure-${variant}`)}>
      <div className="technical-figure-head">
        <div>
          <p className="technical-figure-eyebrow">{figureContent.eyebrow}</p>
          <figcaption>{t(label ?? figureContent.title)}</figcaption>
        </div>
        <span className="technical-figure-status">REAL ASSET / PENDING</span>
      </div>
      <div className="technical-figure-body">
        <div className="technical-figure-state">
          <span className="technical-figure-state-label">CONTENT STATE</span>
          <strong>{t('结构已保留')}</strong>
          <p>{t(figureContent.description)}</p>
        </div>
        <dl className="technical-figure-facts">
          <div>
            <dt>{t('当前展示')}</dt>
            <dd>{t(figureContent.asset)}</dd>
          </div>
          <div>
            <dt>{t('公开状态')}</dt>
            <dd>{t('素材确认后替换')}</dd>
          </div>
        </dl>
      </div>
    </figure>
  );
};

export const EvidenceList = ({
  items,
  onDark = false,
}: {
  items: Array<{ label: string; value: string }>;
  onDark?: boolean;
}) => {
  const { t } = useI18n();
  return (
    <dl className={classNames('evidence-list', onDark && 'evidence-list-on-dark')}>
      {items.map((item) => (
        <div className="evidence-row" key={item.label}>
          <dt>{t(item.label)}</dt>
          <dd>{t(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
};

export const ResearchTile = ({
  tone,
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
}: {
  tone: TileTone;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => {
  const { t } = useI18n();
  return (
    <section className={classNames('research-tile', `research-tile-${tone}`, className)}>
      <div className="tile-inner">
        <div className="tile-copy">
          {eyebrow && <Eyebrow onDark={tone === 'dark'}>{eyebrow}</Eyebrow>}
          <h2>{t(title)}</h2>
          {description && <p className="tile-description">{t(description)}</p>}
          {actions && <div className="tile-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
};

export const Footer = () => {
  const { locale, t, href, switchHref } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-columns">
          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h2>{column.title}</h2>
              {column.links.map((link) => (
                <a href={href(link.href)} key={link.href}>
                  {t(link.label)}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-legal">
          <span>{t(siteIdentity.companyName)}</span>
          <div className="footer-legal-meta">
            <span>© 2026 Elexvx</span>
            <a href={switchHref} hrefLang={locale === 'en' ? 'zh-CN' : 'en'}>
              {locale === 'en' ? 'English · Global' : '中文 · 中国'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const SiteShell = ({
  children,
  activePath = '/',
  navTone = 'dark',
  className,
}: {
  children: ReactNode;
  activePath?: string;
  navTone?: 'light' | 'dark';
  className?: string;
}) => (
  <ConfigProvider theme={elexvxTheme} componentSize="large">
    <div className={classNames('site-shell', 'site-shell-openai', className)}>
      <GlobalNav activePath={activePath} tone={navTone} />
      <main>{children}</main>
      <Footer />
    </div>
  </ConfigProvider>
);

export const BusinessStrip = ({ onDark = false }: { onDark?: boolean }) => {
  const { t, href } = useI18n();
  return (
    <div className={classNames('business-strip', onDark && 'business-strip-on-dark')}>
      <div className="business-strip-heading">
        <Eyebrow onDark={onDark}>ELEXVX COMPANY</Eyebrow>
        <h2>{t('研究之外，我们也在承接真实世界的复杂工作。')}</h2>
      </div>
      <div className="business-strip-links">
        {businessLines.map((line) => (
          <a href={href(line.href)} key={line.slug}>
            <span>
              <strong>{t(line.title)}</strong>
              <small>{line.englishTitle}</small>
            </span>
            <ArrowRightOutlined aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
};
