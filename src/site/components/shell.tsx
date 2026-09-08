'use client';

import { Suspense, type ReactNode } from 'react';

import { CookieConsent } from './cookie-consent';

import { classNames } from './ui';
import { GlobalNav } from './navigation';
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
      <Suspense fallback={null}>
        <GlobalNav activePath={activePath} tone={navTone} />
      </Suspense>
      <main>{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
    </div>
  );
};
