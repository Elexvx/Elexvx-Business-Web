'use client';
import { Switch } from 'radix-ui';

import { useEffect, useState } from 'react';
import { useI18n } from '../providers/i18n';

const COOKIE_PREFERENCE_KEY = 'elexvx-cookie-preferences-v1';
export const COOKIE_SETTINGS_EVENT = 'elexvx:open-cookie-settings';

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const CookieConsent = () => {
  const { locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const english = locale === 'en';

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COOKIE_PREFERENCE_KEY);
      if (!stored) {
        setVisible(true);
      } else {
        const parsed = JSON.parse(stored) as Partial<CookiePreferences>;
        setPreferences({
          necessary: true,
          analytics: parsed.analytics === true,
          marketing: parsed.marketing === true,
        });
      }
    } catch {
      setVisible(true);
    }

    const openSettings = () => {
      setManaging(true);
      setVisible(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
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
    <section className="cookie-consent" role="dialog" aria-label={english ? 'Cookie preferences' : 'Cookie 偏好设置'}>
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <h2>{english ? 'We use cookies' : '我们使用 Cookie'}</h2>
          <p>
            {english
              ? 'We use necessary cookies to keep the site working. Optional analytics and marketing preferences can be changed at any time from the footer.'
              : '我们使用必要 Cookie 确保网站正常运行。分析与营销属于可选项，你可以随时通过页脚中的 Cookie 设置调整偏好。'}
          </p>
        </div>

        {managing ? (
          <div className="cookie-preferences">
            <div className="cookie-preference-row">
              <div>
                <strong>{english ? 'Necessary' : '必要 Cookie'}</strong>
                <span>{english ? 'Required for core site functions.' : '用于网站核心功能。'}</span>
              </div>
              <span className="cookie-required-label">{english ? 'Always on' : '始终启用'}</span>
            </div>
            <label className="cookie-preference-row">
              <div>
                <strong>{english ? 'Analytics' : '分析 Cookie'}</strong>
                <span>{english ? 'Helps us understand site usage.' : '用于了解网站使用情况。'}</span>
              </div>
              <Switch.Root
                className="ui-switch"
                aria-label="分析 Cookie"
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences((current) => ({ ...current, analytics: checked }))}
              >
                <Switch.Thumb className="ui-switch-thumb" />
              </Switch.Root>
            </label>
            <label className="cookie-preference-row">
              <div>
                <strong>{english ? 'Marketing' : '营销 Cookie'}</strong>
                <span>{english ? 'Supports relevant campaign measurement.' : '用于相关推广效果衡量。'}</span>
              </div>
              <Switch.Root
                className="ui-switch"
                aria-label="营销 Cookie"
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences((current) => ({ ...current, marketing: checked }))}
              >
                <Switch.Thumb className="ui-switch-thumb" />
              </Switch.Root>
            </label>
            <div className="cookie-consent-actions">
              <button className="cookie-button" type="button" onClick={() => setManaging(false)}>
                {english ? 'Back' : '返回'}
              </button>
              <button
                className="cookie-button cookie-button-primary"
                type="button"
                onClick={() => savePreferences(preferences)}
              >
                {english ? 'Save preferences' : '保存设置'}
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-consent-actions">
            <button className="cookie-button" type="button" onClick={() => setManaging(true)}>
              {english ? 'Manage cookies' : '管理 Cookie'}
            </button>
            <button className="cookie-button" type="button" onClick={() => savePreferences(defaultPreferences)}>
              {english ? 'Reject optional' : '拒绝非必要'}
            </button>
            <button
              className="cookie-button cookie-button-primary"
              type="button"
              onClick={() => savePreferences({ necessary: true, analytics: true, marketing: true })}
            >
              {english ? 'Accept all' : '全部接受'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
