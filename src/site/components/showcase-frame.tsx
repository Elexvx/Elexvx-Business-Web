'use client';

import { useEffect, useState } from 'react';
import { useNearViewport } from './use-near-viewport';

export function ShowcaseFrame({ src, title }: { src: string; title: string }) {
  const { ref, isNear } = useNearViewport<HTMLDivElement>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isNear) return;
    const loadFrame = () => setReady(true);
    if (document.readyState === 'complete') {
      loadFrame();
      return;
    }
    window.addEventListener('load', loadFrame, { once: true });
    return () => window.removeEventListener('load', loadFrame);
  }, [isNear]);

  return (
    <div className="home-mac-screen" ref={ref}>
      {ready && <iframe src={src} title={title} allow="fullscreen" allowFullScreen />}
      <noscript>
        <iframe src={src} title={title} loading="lazy" allow="fullscreen" allowFullScreen />
      </noscript>
    </div>
  );
}
