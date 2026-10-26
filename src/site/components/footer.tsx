'use client';
import { Switch } from 'radix-ui';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { SiteImage } from './site-image';
import { Logo } from './ui';

import { siteIdentity } from '../../data/site';
import { navigationGroups, withNewsCategories } from '../../data/research-navigation';

import { LANGUAGE_STORAGE_KEY, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { useTheme } from '../providers/theme-provider';
import { COOKIE_SETTINGS_EVENT } from './cookie-consent';

import { useAvailableLink, usePublishedNews } from '../providers/content-context';

export const Footer = ({ linkOrigin }: { linkOrigin?: string }) => {
  const { locale, t, href, switchHref } = useI18n();
  const resolveHref = (value: string) => {
    const localizedHref = href(value);
    return linkOrigin && localizedHref.startsWith('/') ? new URL(localizedHref, linkOrigin).href : localizedHref;
  };
  const resolvedSwitchHref = linkOrigin ? new URL(switchHref, linkOrigin).href : switchHref;
  const { theme, mode, toggleTheme } = useTheme();
  const isAvailableLink = useAvailableLink();
  const newsCategories = usePublishedNews().map((item) => item.category);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const registrations = Object.entries(siteIdentity.registrations ?? {}).filter(([, entry]) => entry.number.trim());
  const visibleFooterColumns = withNewsCategories(navigationGroups, newsCategories)
    .filter((group) => isAvailableLink(group.href))
    .map((group) => ({
      id: group.id,
      title: group.label,
      links: group.columns.flatMap((column) => column.links).filter((link) => isAvailableLink(link.href)),
    }))
    .filter((column) => column.links.length > 0);
  // Reuse the shared destinations, arranged as three balanced desktop stacks.
  const columnStacks = [
    ['research', 'activities'],
    ['products', 'services'],
    ['company', 'news'],
  ].map((ids) => visibleFooterColumns.filter((column) => ids.includes(column.id)));
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
    <footer className="site-footer footer-landscape" id="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-intro">
            <a className="footer-brand" href={resolveHref('/')} aria-label="Elexvx">
              <Logo inverse={theme === 'dark'} />
            </a>
            <p className="footer-description">{t(siteIdentity.description)}</p>
          </div>
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
                          onClick={() =>
                            setExpandedGroups((groups) =>
                              expanded ? groups.filter((id) => id !== column.id) : [...groups, column.id]
                            )
                          }
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
        </div>
      </div>
      <div className="footer-panorama" aria-hidden="true">
        <SiteImage
          src="/visuals/footer/footer-knowledge-landscape-riders.webp"
          alt=""
          width={2171}
          height={724}
          sizes="100vw"
        />
      </div>
      <div className="footer-inner footer-bottom">
        <div className="footer-legal">
          <div className="footer-identity">
            <span>{t('© 2026 由宏翔商道 / Elexvx® 设计，并保留所有权利。')}</span>
            {registrations.length > 0 && (
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
            )}
          </div>
          <div className="footer-legal-meta">
            <Switch.Root
              className="footer-cookie-settings"
              type="button"
              aria-label={
                locale === 'en'
                  ? `${mode === 'auto' ? 'Automatic' : 'Manual'} ${theme} mode`
                  : `${mode === 'auto' ? '自动' : '手动'}${theme === 'dark' ? '深色' : '浅色'}模式`
              }
              checked={theme === 'dark'}
              title={
                locale === 'en'
                  ? mode === 'auto'
                    ? 'Theme follows local sunrise and sunset. Click to set a manual mode.'
                    : `Manual theme. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`
                  : mode === 'auto'
                    ? '主题随本地日出日落自动切换，点击可手动设置。'
                    : `手动模式，点击切换到${theme === 'dark' ? '浅色' : '深色'}模式。`
              }
              onCheckedChange={toggleTheme}
            >
              <span>
                {locale === 'en'
                  ? theme === 'dark'
                    ? 'Dark mode'
                    : 'Light mode'
                  : theme === 'dark'
                    ? '深色模式'
                    : '浅色模式'}
              </span>
            </Switch.Root>
            <button
              className="footer-cookie-settings"
              type="button"
              onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
            >
              {locale === 'en' ? 'Cookie settings' : 'Cookie 设置'}
            </button>
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
          </div>
        </div>
      </div>
    </footer>
  );
};
