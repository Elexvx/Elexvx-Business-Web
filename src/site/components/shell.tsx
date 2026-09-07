'use client';

import { type ReactNode } from 'react';

import { CookieConsent } from './cookie-consent';

import { classNames } from './ui';
import { GlobalNav } from './navigation';
import { WechatShareInit } from './wechat-share-init';
import { Footer } from './footer';

export const SiteShell = ({
  children,
  activePath = '/',
  navTone = 'dark',
  className,
}: {
  children: ReactNode;
  activePath?: string;
  navTone?: 'light' | 'dark';
  className?: string;
}) => {
  return (
    <div className={classNames('site-shell', 'site-shell-openai', className)}>
      <GlobalNav activePath={activePath} tone={navTone} />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
      <WechatShareInit path={activePath} />
    </div>
  );
};
