'use client';

import type { ReactNode } from 'react';

import { english } from '../translation';
import { LanguageProvider } from './i18n';

/** Keep the large English dictionary in one shared client chunk, not in every RSC payload. */
export const EnglishLanguageProvider = ({ path, children }: { path: string; children: ReactNode }) => (
  <LanguageProvider locale="en" path={path} translations={english}>
    {children}
  </LanguageProvider>
);
