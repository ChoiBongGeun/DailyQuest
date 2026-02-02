import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';

export const defaultNS = 'translation';
export const resources = {
  ko: { translation: ko },
  en: { translation: en },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    lng: 'ko', // 기본 언어
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
