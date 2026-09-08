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
  mainHtml,
}: {
  children?: ReactNode;
  activePath?: string;
  navTone?: 'light' | 'dark';
  className?: string;
  /** Trusted, build-generated homepage markup; interactive pages use children. */
  mainHtml?: string;
}) => {
  return (
    <div className={classNames('site-shell', 'site-shell-openai', className)}>
      <GlobalNav activePath={activePath} tone={navTone} />
      {mainHtml === undefined ? <main>{children}</main> : <main dangerouslySetInnerHTML={{ __html: mainHtml }} />}
      <Footer />
      <CookieConsent />
    </div>
  );
};
