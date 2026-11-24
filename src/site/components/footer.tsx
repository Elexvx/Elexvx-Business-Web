'use client';
import { Switch } from 'radix-ui';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { SiteImage } from './site-image';
import { Logo } from './ui';
import { FooterSocial } from './footer-social';

import { siteIdentity } from '../../data/site';

import { LANGUAGE_STORAGE_KEY, LocalizedTitle as Title, useI18n, type Locale } from '../providers/i18n';
import { resolveOriginHref } from '../routing/content-href';
import { useTheme } from '../providers/theme-provider';
import { COOKIE_SETTINGS_EVENT } from './cookie-consent';

import { useVisibleNavigationGroups } from '../providers/content-context';

type FooterColumn = {
  id: string;
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
};

const FOOTER_COLUMN_STACK_IDS = [['research'], ['activities', 'news'], ['products', 'services'], ['company']] as const;

const FooterWordmark = () => (
  <svg className="footer-wordmark" viewBox="0 0 1000 218" aria-hidden="true">
    {/* The outline meets the viewBox edges without font side bearings. */}
    <path
      d="M0 215V10H137V45H37V90H130V125H37V181H141V215Z
         M173 215V12H211V181H303V215Z
         M330 215V10H467V45H367V90H460V125H367V181H471V215Z
         M484 215L547 108 489 10H533L570 76 607 10H650L592 110 655 215H610L569 144 528 215Z
         M722 215L656 10H696L743 162 788 10H828L762 215Z
         M828 215L891 108 834 10H878L915 76 951 10H994L937 110 1000 215H955L914 144 873 215Z"
    />
  </svg>
);

function FooterColumns({
  columnStacks,
  expandedGroups,
  onToggleGroup,
  resolveHref,
  locale,
  t,
}: {
  columnStacks: FooterColumn[][];
  expandedGroups: string[];
  onToggleGroup: (columnId: string) => void;
  resolveHref: (value: string) => string;
  locale: Locale;
  t: (text: string) => string;
}) {
  return (
    <nav className="footer-columns" aria-label={locale === 'en' ? 'Footer navigation' : '页脚导航'}>
      {columnStacks.map((columns, index) => (
        <div className="footer-column-stack" key={index}>
          {columns.map((column) => {
            const expanded = expandedGroups.includes(column.id);
            return (
              <div className={`footer-column${expanded ? ' is-expanded' : ''}`} key={column.id}>
                <h3>
                  <span className="footer-desktop-heading">
                    <Title text={column.title} />
                  </span>
                  <button
                    className="footer-group-toggle"
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`footer-links-${column.id}`}
                    onClick={() => onToggleGroup(column.id)}
                  >
                    <Title text={column.title} />
                    <PlusOutlined aria-hidden="true" />
                  </button>
                </h3>
                <div className="footer-column-links" id={`footer-links-${column.id}`}>
                  {column.links.map((link) => (
                    <a href={resolveHref(link.href)} key={link.href}>
                      {t(link.label)}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function FooterRegistrations({
  registrations,
  t,
}: {
  registrations: Array<[string, { number: string; url: string }]>;
  t: (text: string) => string;
}) {
  if (registrations.length === 0) return null;

  return (
    <div className="footer-registrations" aria-label={t('网站备案信息')}>
      {registrations.map(([kind, entry]) => {
        const contents = (
          <>
            {kind === 'publicSecurity' && (
              <SiteImage
                className="footer-registration-icon"
                src="/images/public-security-registration-icon.png"
                alt=""
                width={20}
                height={20}
              />
            )}
            {t(entry.number)}
          </>
        );

        return /^https:\/\//.test(entry.url.trim()) ? (
          <a
            className="footer-registration"
            key={kind}
            href={entry.url.trim()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contents}
          </a>
        ) : (
          <span className="footer-registration" key={kind}>
            {contents}
          </span>
        );
      })}
    </div>
  );
}

function FooterThemeToggle({ locale }: { locale: Locale }) {
  const { theme, mode, toggleTheme } = useTheme();
  const isEnglish = locale === 'en';
  const isDark = theme === 'dark';
  const isAuto = mode === 'auto';

  const ariaLabel = isEnglish
    ? `${isAuto ? 'Automatic' : 'Manual'} ${theme} mode`
    : `${isAuto ? '自动' : '手动'}${isDark ? '深色' : '浅色'}模式`;

  const title = isEnglish
    ? isAuto
      ? 'Theme follows local sunrise and sunset. Click to set a manual mode.'
      : `Manual theme. Click to switch to ${isDark ? 'light' : 'dark'} mode.`
    : isAuto
      ? '主题随本地日出日落自动切换，点击可手动设置。'
      : `手动模式，点击切换到${isDark ? '浅色' : '深色'}模式。`;

  const label = isEnglish ? (isDark ? 'Dark mode' : 'Light mode') : isDark ? '深色模式' : '浅色模式';

  return (
    <Switch.Root
      className="footer-cookie-settings"
      type="button"
      aria-label={ariaLabel}
      checked={isDark}
      title={title}
      onCheckedChange={toggleTheme}
    >
      <span>{label}</span>
    </Switch.Root>
  );
}

function FooterLanguageSwitcher({
  locale,
  switchHref,
  resolvedSwitchHref,
}: {
  locale: Locale;
  switchHref: string;
  resolvedSwitchHref: string;
}) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageOptions =
    locale === 'en'
      ? [
          { code: 'zh-CN', label: '简体中文', href: switchHref },
          { code: 'en', label: 'English', current: true },
        ]
      : [
          { code: 'zh-CN', label: '简体中文', current: true },
          { code: 'en', label: 'English', href: switchHref },
        ];

  return (
    <div
      className={`footer-language-switcher${languageMenuOpen ? ' is-open' : ''}`}
      onMouseEnter={() => setLanguageMenuOpen(true)}
      onMouseLeave={() => setLanguageMenuOpen(false)}
      onFocus={() => setLanguageMenuOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setLanguageMenuOpen(false);
      }}
    >
      <button
        className="footer-language-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={languageMenuOpen}
        aria-controls="footer-language-menu"
        onClick={() => setLanguageMenuOpen(true)}
      >
        {locale === 'en' ? 'English' : '简体中文'}
      </button>
      <div
        className="footer-language-menu"
        id="footer-language-menu"
        role="menu"
        aria-label={locale === 'en' ? 'Language' : '语言'}
      >
        {languageOptions.map((option) =>
          option.current ? (
            <span
              className="footer-language-option footer-language-option-current"
              key={option.code}
              role="menuitem"
              aria-current="page"
            >
              {option.label}
            </span>
          ) : (
            <a
              className="footer-language-option"
              key={option.code}
              href={option.href}
              hrefLang={option.code}
              role="menuitem"
              onClick={(event) => {
                event.currentTarget.href = `${resolvedSwitchHref}${window.location.search}${window.location.hash}`;
                try {
                  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, option.code);
                } catch {
                  // Language switching should continue when storage is unavailable.
                }
                setLanguageMenuOpen(false);
              }}
            >
              {option.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}

export const Footer = ({ linkOrigin }: { linkOrigin?: string }) => {
  const { locale, t, href, switchHref, hasProvider } = useI18n();
  const { theme } = useTheme();
  const visibleNavigationGroups = useVisibleNavigationGroups();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const resolveHref = (value: string) => resolveOriginHref(href(value), linkOrigin);
  const resolvedSwitchHref = resolveOriginHref(switchHref, linkOrigin);

  const registrations = Object.entries(siteIdentity.registrations ?? {}).filter(([, entry]) => entry.number.trim());
  const visibleFooterColumns: FooterColumn[] = visibleNavigationGroups.map((group) => ({
    id: group.id,
    title: group.label,
    links: group.columns.flatMap((column) => column.links),
  }));
  // Reuse the shared destinations, arranged as four balanced desktop columns.
  const columnStacks = FOOTER_COLUMN_STACK_IDS.map((ids) =>
    visibleFooterColumns.filter((column) => (ids as readonly string[]).includes(column.id))
  ).filter((columns) => columns.length > 0);

  const toggleGroup = (columnId: string) => {
    setExpandedGroups((groups) =>
      groups.includes(columnId) ? groups.filter((id) => id !== columnId) : [...groups, columnId]
    );
  };

  return (
    <footer className="site-footer footer-landscape" id="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-intro">
            <a className="footer-brand" href={resolveHref('/')} aria-label="Elexvx">
              <Logo inverse={theme === 'dark'} />
            </a>
            <p className="footer-description">{t(siteIdentity.description)}</p>
            <FooterSocial />
          </div>
          <FooterColumns
            columnStacks={columnStacks}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            resolveHref={resolveHref}
            locale={locale}
            t={t}
          />
        </div>
        <FooterWordmark />
      </div>
      <div className="footer-inner footer-bottom">
        <div className="footer-legal">
          <div className="footer-identity">
            <span>{t('© 2026 由宏翔商道 / Elexvx® 设计，并保留所有权利。')}</span>
            <FooterRegistrations registrations={registrations} t={t} />
          </div>
          <div className="footer-legal-meta">
            <a className="footer-sitemap-link" href={resolveHref('/sitemap.xml')}>
              {t('站点地图')}
            </a>
            <FooterThemeToggle locale={locale} />
            <button
              className="footer-cookie-settings"
              type="button"
              onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
            >
              {locale === 'en' ? 'Cookie settings' : 'Cookie 设置'}
            </button>
            {hasProvider && (
              <FooterLanguageSwitcher locale={locale} switchHref={switchHref} resolvedSwitchHref={resolvedSwitchHref} />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
