'use client';

import { useSyncExternalStore } from 'react';
import { SiteShell } from './shell';
import { LanguageProvider, useI18n } from '../providers/i18n';

const copy = {
  403: {
    label: 'ACCESS RESTRICTED',
    title: '此处暂不开放访问',
    enTitle: 'Access is restricted',
    description: '你暂时无法访问此页面。如需了解相关内容，请与我们联系。',
    enDescription: 'This page is not available to you. Contact us if you need access to this information.',
  },
  404: {
    label: 'PAGE NOT FOUND',
    title: '这一页，暂时找不到了',
    enTitle: 'This page could not be found',
    description: '页面可能已移动、下线，或链接地址有误。你可以返回首页，继续探索我们的研究与成果。',
    enDescription:
      'The page may have moved, been removed, or the address may be incorrect. Return home to explore our research and projects.',
  },
  500: {
    label: 'SOMETHING WENT WRONG',
    title: '页面暂时遇到了一点问题',
    enTitle: 'Something went wrong',
    description: '请稍后重试，或先返回首页。如果问题持续出现，欢迎联系我们。',
    enDescription: 'Please try again shortly or return home. If the problem persists, contact us.',
  },
};
const subscribe = () => () => {};

export function ErrorPage({ code = 404, retry }: { code?: 403 | 404 | 500; retry?: () => void }) {
  const { locale } = useI18n();
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => `/${code}`
  );
  const english = locale === 'en' || /^\/en(?:\/|$)/.test(pathname);
  const path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const content = copy[code];
  const href = (path: string) => (english ? `/en${path === '/' ? '/' : path}` : path);
  return (
    <LanguageProvider locale={english ? 'en' : 'zh-CN'} path={path} autoRedirect={false}>
      <SiteShell activePath={path}>
        <section className="status-page">
          <title>{english ? content.enTitle : content.title} · Elexvx Research</title>
          <meta name="robots" content="noindex,nofollow" />
          <div className="status-main">
            <div className="status-visual" aria-hidden="true">
              <span>{code}</span>
              <i />
            </div>
            <div className="status-copy">
              <p className="status-eyebrow">{content.label}</p>
              <h1>{english ? content.enTitle : content.title}</h1>
              <p className="status-description">{english ? content.enDescription : content.description}</p>
              <div className="status-actions">
                {code === 500 && (
                  <button type="button" onClick={retry ?? (() => window.location.reload())}>
                    {english ? 'Try again' : '重新尝试'} <span aria-hidden="true">↻</span>
                  </button>
                )}
                <a className={code === 500 ? 'status-secondary' : 'status-primary'} href={href('/')}>
                  {english ? 'Return home' : '返回首页'} <span aria-hidden="true">↗</span>
                </a>
                {code !== 500 && (
                  <a className="status-secondary" href={href(code === 403 ? '/contact' : '/research')}>
                    {english
                      ? code === 403
                        ? 'Contact us'
                        : 'Explore research'
                      : code === 403
                        ? '联系我们'
                        : '探索研究'}{' '}
                    <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </SiteShell>
    </LanguageProvider>
  );
}
