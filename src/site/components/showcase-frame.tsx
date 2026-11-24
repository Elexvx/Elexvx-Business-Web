'use client';

import { useState } from 'react';
import { useI18n } from '../providers/i18n';

export function ShowcaseFrame({ src, title }: { src: string; title: string }) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);

  return (
    <div className="home-mac-screen">
      {active ? (
        <iframe src={src} title={title} allow="fullscreen" allowFullScreen />
      ) : (
        <>
          <div className="home-mac-facade">
            <span className="home-mac-facade-mark" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
                <path d="M4.5 7.2 12 11.4l7.5-4.2" />
                <path d="M12 11.4V21" />
              </svg>
            </span>
            <span className="home-mac-facade-eyebrow">{t('交互式 3D 预览')}</span>
            <p className="home-mac-facade-title">{title}</p>
            <p className="home-mac-facade-description">
              {t('按需加载三维场景，保持首页轻快流畅；点击后即可进入自由视角漫游与交互体验。')}
            </p>
            <button type="button" className="action-button home-mac-facade-button" onClick={() => setActive(true)}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7Z" />
              </svg>
              <span>{t('进入 3D 预览')}</span>
            </button>
          </div>
          <noscript>
            <iframe src={src} title={title} loading="lazy" allow="fullscreen" allowFullScreen />
          </noscript>
        </>
      )}
    </div>
  );
}
