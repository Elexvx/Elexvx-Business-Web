'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { siteIdentity } from '../../data/site';
import { ENGLISH_BRAND_NAME } from '../../data/site-origins';
import { SiteShell } from './shell';
import { LocaleProvider, useI18n, type Locale } from '../providers/i18n-context';

const copy = {
  403: {
    title: '此处暂不开放访问',
    enTitle: 'Access is restricted',
  },
  404: {
    title: '这一页，暂时找不到了',
    enTitle: 'This page could not be found',
  },
  500: {
    title: '页面暂时遇到了一点问题',
    enTitle: 'Something went wrong',
  },
};
const subscribe = () => () => {};

export function ErrorPage({
  code = 404,
  locale: initialLocale,
  retry,
}: {
  code?: 403 | 404 | 500;
  locale?: Locale;
  retry?: () => void;
}) {
  const { locale: parentLocale, hasProvider } = useI18n();
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => `/${code}`
  );
  const english = (initialLocale ?? parentLocale) === 'en' || /^\/en(?:\/|$)/.test(pathname);
  const targetLocale: Locale = english ? 'en' : 'zh-CN';
  const path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const content = copy[code];
  const brand = english ? ENGLISH_BRAND_NAME : siteIdentity.seoName;
  const href = (target: string) => (english ? `/en${target === '/' ? '/' : target}` : target);
  const shell = (
    <SiteShell activePath={path}>
      <section className="status-page">
        <title>{`${brand} — ${english ? content.enTitle : content.title}`}</title>
        <meta name="robots" content="noindex,nofollow" />
        <div className="status-main">
          <div className="status-visual" aria-hidden="true">
            <span>{code}</span>
            <i />
          </div>
          <div className="status-copy">
            <h1>{english ? content.enTitle : content.title}</h1>
            <div className="status-actions">
              {code === 500 && (
                <button type="button" onClick={retry ?? (() => window.location.reload())}>
                  {english ? 'Try again' : '重新尝试'} <span aria-hidden="true">↻</span>
                </button>
              )}
              <a className={code === 500 ? 'status-secondary' : 'status-primary'} href={href('/')}>
                {english ? 'Return home' : '返回首页'}
              </a>
              {code !== 500 && (
                <a className="status-secondary" href={href(code === 403 ? '/contact' : '/research')}>
                  {english
                    ? code === 403
                      ? 'Contact us'
                      : 'Explore research'
                    : code === 403
                      ? '联系我们'
                      : '探索研究'}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );

  const needsLazyEnglish = english && !(hasProvider && parentLocale === targetLocale);
  const [englishDictionary, setEnglishDictionary] = useState<Record<string, string> | undefined>();

  useEffect(() => {
    if (!needsLazyEnglish) return;
    let cancelled = false;
    import('../translation-base').then((module) => {
      if (!cancelled) setEnglishDictionary(module.existingEnglish);
    });
    return () => {
      cancelled = true;
    };
  }, [needsLazyEnglish]);

  if (hasProvider && parentLocale === targetLocale) return shell;

  return (
    <LocaleProvider locale={targetLocale} path={path} autoRedirect={false} translations={englishDictionary}>
      {shell}
    </LocaleProvider>
  );
}
