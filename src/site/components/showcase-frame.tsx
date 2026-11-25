'use client';

import { useState } from 'react';
import { useI18n } from '../providers/i18n';
import { SiteImage } from './site-image';

export function ShowcaseFrame({
  src,
  title,
  previewImage,
  eager = false,
}: {
  src: string;
  title: string;
  previewImage?: string;
  eager?: boolean;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);

  const launchButton = (
    <button type="button" className="action-button home-mac-facade-button" onClick={() => setActive(true)}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
        <path d="M8 5.14v14l11-7-11-7Z" />
      </svg>
      <span>{t('进入 3D 预览')}</span>
    </button>
  );

  return (
    <div className="home-mac-screen">
      {active ? (
        <iframe src={src} title={title} allow="fullscreen" allowFullScreen />
      ) : (
        <>
          <div className={previewImage ? 'home-mac-facade home-mac-facade--image' : 'home-mac-facade'}>
            {previewImage ? (
              <>
                <SiteImage
                  className="home-mac-facade-image"
                  src={previewImage}
                  alt={title}
                  sizes="(max-width: 720px) 100vw, min(1280px, 92vw)"
                  fetchPriority={eager ? 'high' : undefined}
                  loading={eager ? 'eager' : 'lazy'}
                />
                <div className="home-mac-facade-actions">{launchButton}</div>
              </>
            ) : (
              <>
                <p className="home-mac-facade-title">{title}</p>
                {launchButton}
              </>
            )}
          </div>
          <noscript>
            <iframe src={src} title={title} loading="lazy" allow="fullscreen" allowFullScreen />
          </noscript>
        </>
      )}
    </div>
  );
}
