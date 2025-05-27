import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations.json';

const resources = {
  en: { translation: Object.fromEntries(Object.entries(translations).map(([k, v]) => [k, v.en])) },
  ar: { translation: Object.fromEntries(Object.entries(translations).map(([k, v]) => [k, v.ar])) }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
