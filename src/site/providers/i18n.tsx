'use client';

import type { ReactNode } from 'react';

import { existingEnglish } from '../translation-base';
import { LocaleProvider, type Locale } from './i18n-context';

export {
  LANGUAGE_STORAGE_KEY,
  LocalizedText,
  LocalizedTitle,
  LocaleProvider,
  Translated,
  useI18n,
  type Locale,
} from './i18n-context';

export const LanguageProvider = (props: {
  locale: Locale;
  path: string;
  children: ReactNode;
  autoRedirect?: boolean;
  translations?: Record<string, string>;
}) => <LocaleProvider {...props} fallbackTranslations={existingEnglish} />;
