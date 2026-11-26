'use client';

import { Dialog, Switch } from 'radix-ui';
import { useEffect, useRef } from 'react';
import { useI18n } from '../providers/i18n-context';
import { ModalContent } from './primitives/modal';

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const defaultCookiePreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function CookieConsentDialog({
  visible,
  managing,
  preferences,
  onOpenChange,
  onManagingChange,
  onPreferencesChange,
  onSave,
}: {
  visible: boolean;
  managing: boolean;
  preferences: CookiePreferences;
  onOpenChange: (open: boolean) => void;
  onManagingChange: (managing: boolean) => void;
  onPreferencesChange: (updater: (current: CookiePreferences) => CookiePreferences) => void;
  onSave: (nextPreferences: CookiePreferences) => void;
}) {
  const { locale } = useI18n();
  const consentRef = useRef<HTMLDivElement>(null);
  const isEnglish = locale === 'en';

  useEffect(() => {
    if (!visible) return;
    const frame = window.requestAnimationFrame(() => {
      consentRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visible, managing]);

  return (
    <Dialog.Root open={visible} onOpenChange={onOpenChange} modal={false}>
      <ModalContent
        ref={consentRef}
        className="cookie-consent"
        aria-label={isEnglish ? 'Cookie preferences' : 'Cookie 偏好设置'}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (!managing) return;
          event.preventDefault();
          onManagingChange(false);
        }}
      >
        <div className="cookie-consent-inner">
          <div className="cookie-consent-copy">
            <Dialog.Title asChild>
              <h2>{isEnglish ? 'We use cookies' : '我们使用 Cookie'}</h2>
            </Dialog.Title>
            <Dialog.Description asChild>
              <p>
                {isEnglish
                  ? 'We use necessary cookies to keep the site working. Optional analytics and marketing preferences can be changed at any time from the footer.'
                  : '我们使用必要 Cookie 确保网站正常运行。分析与营销属于可选项，你可以随时通过页脚中的 Cookie 设置调整偏好。'}
              </p>
            </Dialog.Description>
          </div>

          {managing ? (
            <div className="cookie-preferences">
              <div className="cookie-preference-row">
                <div>
                  <strong>{isEnglish ? 'Necessary' : '必要 Cookie'}</strong>
                  <span>{isEnglish ? 'Required for core site functions.' : '用于网站核心功能。'}</span>
                </div>
                <span className="cookie-required-label">{isEnglish ? 'Always on' : '始终启用'}</span>
              </div>
              <label className="cookie-preference-row">
                <div>
                  <strong>{isEnglish ? 'Analytics' : '分析 Cookie'}</strong>
                  <span>{isEnglish ? 'Helps us understand site usage.' : '用于了解网站使用情况。'}</span>
                </div>
                <Switch.Root
                  className="ui-switch"
                  aria-label={isEnglish ? 'Analytics cookies' : '分析 Cookie'}
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => onPreferencesChange((current) => ({ ...current, analytics: checked }))}
                >
                  <Switch.Thumb className="ui-switch-thumb" />
                </Switch.Root>
              </label>
              <label className="cookie-preference-row">
                <div>
                  <strong>{isEnglish ? 'Marketing' : '营销 Cookie'}</strong>
                  <span>{isEnglish ? 'Supports relevant campaign measurement.' : '用于相关推广效果衡量。'}</span>
                </div>
                <Switch.Root
                  className="ui-switch"
                  aria-label={isEnglish ? 'Marketing cookies' : '营销 Cookie'}
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => onPreferencesChange((current) => ({ ...current, marketing: checked }))}
                >
                  <Switch.Thumb className="ui-switch-thumb" />
                </Switch.Root>
              </label>
              <div className="cookie-consent-actions">
                <button className="cookie-button" type="button" onClick={() => onManagingChange(false)}>
                  {isEnglish ? 'Back' : '返回'}
                </button>
                <button
                  className="cookie-button cookie-button-primary"
                  type="button"
                  onClick={() => onSave(preferences)}
                >
                  {isEnglish ? 'Save preferences' : '保存设置'}
                </button>
              </div>
            </div>
          ) : (
            <div className="cookie-consent-actions">
              <button className="cookie-button" type="button" onClick={() => onManagingChange(true)}>
                {isEnglish ? 'Manage cookies' : '管理 Cookie'}
              </button>
              <button className="cookie-button" type="button" onClick={() => onSave(defaultCookiePreferences)}>
                {isEnglish ? 'Reject optional' : '拒绝非必要'}
              </button>
              <button
                className="cookie-button cookie-button-primary"
                type="button"
                onClick={() => onSave({ necessary: true, analytics: true, marketing: true })}
              >
                {isEnglish ? 'Accept all' : '全部接受'}
              </button>
            </div>
          )}
        </div>
      </ModalContent>
    </Dialog.Root>
  );
}
