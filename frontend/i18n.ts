import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal i18n config for demo. Extend as needed.
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        'theme.toggle': 'Toggle dark and light mode',
        'welcome.title': 'Grocodex',
        'welcome.subtitle': 'Welcome to your privacy-first grocery inventory app.'
      },
    },
    de: {
      translation: {
        'theme.toggle': 'Dunkel-/Hellmodus umschalten',
        'welcome.title': 'Grocodex',
        'welcome.subtitle': 'Willkommen bei deiner datenschutzfreundlichen Vorrats-App.'
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
