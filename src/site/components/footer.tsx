'use client';
import { Switch } from 'radix-ui';

import { siteIdentity } from '../../data/site';
import { navigationGroups } from '../../data/research-navigation';

import { LANGUAGE_STORAGE_KEY, LocalizedTitle as Title, useI18n } from '../providers/i18n';
import { useTheme } from '../providers/theme-provider';
import { COOKIE_SETTINGS_EVENT } from './cookie-consent';

import { useAvailableLink } from '../providers/content-context';

export const Footer = () => {
  const { locale, t, href, switchHref } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const isAvailableLink = useAvailableLink();
  const visibleFooterColumns = navigationGroups
    .filter((group) => isAvailableLink(group.href))
    .map((group) => ({
      title: group.label,
      links: group.columns.flatMap((column) => column.links).filter((link) => isAvailableLink(link.href)),
    }))
    .filter((column) => column.links.length > 0);
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
            <span>© 2026 {t(siteIdentity.companyName)}</span>
          </div>
          <div className="footer-legal-meta">
            <Switch.Root
              className="theme-toggle footer-theme-toggle"
              type="button"
              aria-label={(locale === 'en' ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : (theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'))}
              checked={theme === 'dark'}
              title={(locale === 'en' ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : (theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'))}
              onCheckedChange={toggleTheme}
            >
              <span>{locale === 'en' ? (theme === 'dark' ? 'Dark mode' : 'Light mode') : (theme === 'dark' ? '深色模式' : '浅色模式')}</span>
            </Switch.Root>
            <button
              className="footer-cookie-settings"
              type="button"
              onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
            >
              {locale === 'en' ? 'Cookie settings' : 'Cookie 设置'}
            </button>
            <a
              className="footer-language-link"
              href={switchHref}
              hrefLang={locale === 'en' ? 'zh-CN' : 'en'}
              onClick={() => {
                try {
                  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale === 'en' ? 'zh-CN' : 'en');
                } catch {
                  // Language switching should continue when storage is unavailable.
                }
              }}
            >
              {locale === 'en' ? '中文 · 中国' : 'EN · Global'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
