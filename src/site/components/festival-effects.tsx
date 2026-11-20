'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { resolveFestivalEffect, type FestivalEffect } from '../festival';

const FestivalAnimation = dynamic(() => import('./festival-animation').then((module) => module.FestivalAnimation), {
  ssr: false,
});

const FESTIVAL_REFRESH_EVENT = 'elexvx:festival-refresh';
const FESTIVAL_SYNC_INTERVAL_MS = 60_000;

const applyFestivalDataset = (effect: FestivalEffect) => {
  if (effect === 'none') delete document.documentElement.dataset.festival;
  else document.documentElement.dataset.festival = effect;
};

export const FestivalEffects = () => {
  const [effect, setEffect] = useState<FestivalEffect>('none');
  useEffect(() => {
    const syncFestival = () => {
      const nextEffect = resolveFestivalEffect(new Date(), window.location.search);
      applyFestivalDataset(nextEffect);
      setEffect((current) => (current === nextEffect ? current : nextEffect));
    };

    syncFestival();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncFestival();
    };

    const timer = window.setInterval(syncFestival, FESTIVAL_SYNC_INTERVAL_MS);
    window.addEventListener('focus', syncFestival);
    window.addEventListener('popstate', syncFestival);
    window.addEventListener(FESTIVAL_REFRESH_EVENT, syncFestival);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', syncFestival);
      window.removeEventListener('popstate', syncFestival);
      window.removeEventListener(FESTIVAL_REFRESH_EVENT, syncFestival);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return effect === 'snow' || effect === 'ribbon' ? <FestivalAnimation effect={effect} /> : null;
};
