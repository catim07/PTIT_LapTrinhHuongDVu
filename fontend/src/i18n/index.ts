import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // Priority: localStorage > navigator default
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lotte_language',
      caches: ['localStorage'],
    },
  });

/**
 * Set default language from admin settings.
 * Called once on app boot with the value from admin_settings.default_language.
 */
export const setDefaultLanguageFromSettings = (lang?: string) => {
  // Only set if user hasn't picked a language yet
  const saved = localStorage.getItem('lotte_language');
  if (!saved && lang && (lang === 'vi' || lang === 'en')) {
    i18n.changeLanguage(lang);
  }
};

export default i18n;
