'use client';

import { type ReactNode } from 'react';

import { CookieConsent } from './cookie-consent';

import { classNames } from './ui';
import { GlobalNav } from './navigation';
import { Footer } from './footer';

export const SiteShell = ({
  children,
  activePath = '/',
  navTone = 'dark',
  className,
  linkOrigin,
}: {
  children: ReactNode;
  activePath?: string;
  navTone?: 'light' | 'dark';
  className?: string;
  /** Prefix internal navigation with the canonical site when rendered on a service host. */
  linkOrigin?: string;
}) => {
  return (
    <div className={classNames('site-shell', 'site-shell-openai', className)}>
      <GlobalNav activePath={activePath} tone={navTone} linkOrigin={linkOrigin} />
      <main>{children}</main>
      <Footer linkOrigin={linkOrigin} />
      <CookieConsent />
    </div>
  );
};
