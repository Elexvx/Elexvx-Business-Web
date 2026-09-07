import contentEnglish from '../../content/i18n/en.json';
import { existingEnglish, translateWithDictionary } from './translation-base';

export const english: Record<string, string> = { ...existingEnglish, ...contentEnglish };
export const translateEnglish = (value: string): string => translateWithDictionary(value, english);
