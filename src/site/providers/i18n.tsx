'use client';

import { createContext, Fragment, useContext, useEffect, type ReactNode } from 'react';

import { translateEnglish } from '../translation';

export type Locale = 'zh-CN' | 'en';

export const LANGUAGE_STORAGE_KEY = 'elexvx-language';

type I18nContextValue = {
  locale: Locale;
  t: (value: string) => string;
  href: (value: string) => string;
  switchHref: string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh-CN',
  t: (value) => value,
  href: (value) => value,
  switchHref: '/en',
});

const isInternalHref = (value: string) => value.startsWith('/') && !value.startsWith('//');

export const LanguageProvider = ({
  locale,
  path,
  children,
  autoRedirect = false,
}: {
  locale: Locale;
  path: string;
  children: ReactNode;
  autoRedirect?: boolean;
}) => {
  useEffect(() => {
    if (!autoRedirect || locale === 'en' || path !== '/') return;
    let preferredLocale: Locale;

    try {
      const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      preferredLocale =
        storedLocale === 'zh-CN' || storedLocale === 'en'
          ? storedLocale
          : window.navigator.language.toLowerCase().startsWith('zh')
            ? 'zh-CN'
            : 'en';
    } catch {
      preferredLocale = window.navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
    }

    if (preferredLocale === locale) return;

    const targetPath = preferredLocale === 'en' ? (path === '/' ? '/en' : `/en${path}`) : path;
    window.location.replace(`${targetPath}${window.location.search}${window.location.hash}`);
  }, [locale, path, autoRedirect]);

  const href = (value: string) => {
    if (
      locale !== 'en' ||
      !isInternalHref(value) ||
      /^\/en(?:\/|$|[?#])/.test(value) ||
      /\.[a-z0-9]+(?:[?#]|$)/i.test(value)
    )
      return value;
    return value === '/' ? '/en' : `/en${value}`;
  };
  const switchHref = locale === 'en' ? path : path === '/' ? '/en' : `/en${path}`;
  const t = (value: string) => (locale === 'en' ? translateEnglish(value) : value);

  return (
    <I18nContext.Provider value={{ locale, t, href, switchHref }}>
      <div className="locale-root" lang={locale}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

export const LocalizedText = ({ children, text }: { children?: string; text?: string }) => {
  const { t } = useI18n();
  return <>{t(text ?? children ?? '')}</>;
};

export const LocalizedTitle = ({ children, text }: { children?: string; text?: string }) => {
  const { t, locale } = useI18n();
  if (locale === 'en') return <>{t(text ?? children ?? '')}</>;
  const segments = t(text ?? children ?? '')
    .split(/[，,]/u)
    .map((segment) => segment.replace(/[。！？；：.!?;:]/gu, '').trim())
    .filter(Boolean);

  return (
    <>
      {segments.map((segment, index) => (
        <Fragment key={`${segment}-${index}`}>
          {index > 0 && <br />}
          {segment}
        </Fragment>
      ))}
    </>
  );
};

export const translateText = (value: string, locale: Locale) => (locale === 'en' ? translateEnglish(value) : value);

/** Localize content values at their rendering boundary, including arrays of text. */
export const Translated = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const render = (node: ReactNode): ReactNode =>
    typeof node === 'string' ? t(node) : Array.isArray(node) ? node.map(render) : node;
  return <>{render(children)}</>;
};
