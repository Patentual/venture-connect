import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: [
    'en',
    'es',
    'fr',
    'de',
    'pt',
    'zh',
    'ja',
    'ko',
    'ar',
    'hi',
    'ru',
    'yue',
    'sv',
    'nb',
    'nl',
    'da',
    'pl',
  ],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
