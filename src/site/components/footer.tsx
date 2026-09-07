'use client';
import { Switch } from 'radix-ui';
import { useState } from 'react';

import { siteIdentity } from '../../data/site';
import { navigationGroups, withNewsCategories } from '../../data/research-navigation';

import { LANGUAGE_STORAGE_KEY, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { useTheme } from '../providers/theme-provider';
import { COOKIE_SETTINGS_EVENT } from './cookie-consent';

import { useAvailableLink, usePublishedNews } from '../providers/content-context';

export const Footer = () => {
  const { locale, t, href, switchHref } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const isAvailableLink = useAvailableLink();
  const newsCategories = usePublishedNews().map((item) => item.category);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const registrations = Object.entries(siteIdentity.registrations ?? {}).filter(([, entry]) => entry.number.trim());
  const visibleFooterColumns = withNewsCategories(navigationGroups, newsCategories)
    .filter((group) => isAvailableLink(group.href))
    .map((group) => ({
      title: group.label,
      links: group.columns.flatMap((column) => column.links).filter((link) => isAvailableLink(link.href)),
    }))
    .filter((column) => column.links.length > 0);
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
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-columns">
          {visibleFooterColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h2>
                <Title text={column.title} />
              </h2>
              {column.links.map((link) => (
                <a href={href(link.href)} key={link.href}>
                  {t(link.label)}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-legal">
          <div className="footer-identity">
            <span>{t('© 2026 由宏翔商道 / Elexvx 设计，并保留所有权利。')}</span>
            {registrations.length > 0 && (
              <div className="footer-registrations" aria-label={t('网站备案信息')}>
                {registrations.map(([kind, entry]) =>
                  /^https:\/\//.test(entry.url.trim()) ? (
                    <a key={kind} href={entry.url.trim()} target="_blank" rel="noopener noreferrer">
                      {t(entry.number)}
                    </a>
                  ) : (
                    <span key={kind}>{t(entry.number)}</span>
                  )
                )}
              </div>
            )}
          </div>
          <div className="footer-legal-meta">
            <Switch.Root
              className="footer-cookie-settings"
              type="button"
              aria-label={
                locale === 'en'
                  ? theme === 'dark'
                    ? 'Dark mode'
                    : 'Light mode'
                  : theme === 'dark'
                    ? '深色模式'
                    : '浅色模式'
              }
              checked={theme === 'dark'}
              title={
                locale === 'en'
                  ? theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                  : theme === 'dark'
                    ? '切换到浅色模式'
                    : '切换到深色模式'
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
                        event.currentTarget.href = `${option.href}${window.location.search}${window.location.hash}`;
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
