'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { defaultCookiePreferences, type CookiePreferences } from './cookie-consent-dialog';

const COOKIE_PREFERENCE_KEY = 'elexvx-cookie-preferences-v1';
export const COOKIE_SETTINGS_EVENT = 'elexvx:open-cookie-settings';
const COOKIE_BANNER_IDLE_MS = 8000;

const CookieConsentDialog = dynamic(
  () => import('./cookie-consent-dialog').then((module) => module.CookieConsentDialog),
  { ssr: false }
);

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultCookiePreferences);

  useEffect(() => {
    let revealTimer = 0;
    const interactionEvents = ['pointerdown', 'keydown', 'scroll'] as const;

    const cleanupPendingReveal = () => {
      if (revealTimer) {
        window.clearTimeout(revealTimer);
        revealTimer = 0;
      }
      for (const eventName of interactionEvents) {
        window.removeEventListener(eventName, showOnFirstInteraction);
      }
    };

    const showOnFirstInteraction = () => {
      cleanupPendingReveal();
      setVisible(true);
    };

    const scheduleBannerReveal = () => {
      // Defer the first-visit banner until initial engagement or idle so it never blocks first paint / Speed Index.
      for (const eventName of interactionEvents) {
        window.addEventListener(eventName, showOnFirstInteraction, { once: true, passive: true });
      }
      revealTimer = window.setTimeout(showOnFirstInteraction, COOKIE_BANNER_IDLE_MS);
    };

    try {
      const stored = window.localStorage.getItem(COOKIE_PREFERENCE_KEY);
      if (!stored) {
        scheduleBannerReveal();
      } else {
        const parsed = JSON.parse(stored) as Partial<CookiePreferences>;
        setPreferences({
          necessary: true,
          analytics: parsed.analytics === true,
          marketing: parsed.marketing === true,
        });
      }
    } catch {
      scheduleBannerReveal();
    }

    const openSettings = () => {
      cleanupPendingReveal();
      setManaging(true);
      setVisible(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => {
      cleanupPendingReveal();
      window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const savePreferences = (nextPreferences: CookiePreferences) => {
    const normalized = { ...nextPreferences, necessary: true as const };
    setPreferences(normalized);
    try {
      window.localStorage.setItem(COOKIE_PREFERENCE_KEY, JSON.stringify(normalized));
    } catch {
      // The visible choice still applies for this page when storage is unavailable.
    }
    setManaging(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <CookieConsentDialog
      visible={visible}
      managing={managing}
      preferences={preferences}
      onOpenChange={setVisible}
      onManagingChange={setManaging}
      onPreferencesChange={setPreferences}
      onSave={savePreferences}
    />
  );
};
