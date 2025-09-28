import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '@/i18n/en.json';
import frTranslations from '@/i18n/fr.json';

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Avoid suspense in this setup
    }
  });

export default i18n;