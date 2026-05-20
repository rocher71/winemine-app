/**
 * i18next 초기화.
 * profiles.language (ko/en)와 동기화되며, 부팅 시 _layout.tsx에서 useProfile()로 language 적용.
 *
 * 키 누락 시: returnNull=false → 빈 문자열보다 키 자체 노출 (디버깅 용이).
 * 한쪽 locale 누락은 §4-4 위반 — qa-inspector lint로 점검.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from './ko.json';
import en from './en.json';

export type AppLocale = 'ko' | 'en';

let initialized = false;

export function initI18n(initialLocale: AppLocale = 'ko') {
  if (initialized) return i18n;
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        ko: { translation: ko },
        en: { translation: en },
      },
      lng: initialLocale,
      fallbackLng: 'ko',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
      returnNull: false,
    });
  initialized = true;
  return i18n;
}

export function changeLanguage(locale: AppLocale) {
  return i18n.changeLanguage(locale);
}

export function currentLocale(): AppLocale {
  return (i18n.language as AppLocale) || 'ko';
}

export default i18n;
