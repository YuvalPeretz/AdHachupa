import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import common from '../locales/he/common.json';
import onboarding from '../locales/he/onboarding.json';
import dashboard from '../locales/he/dashboard.json';
import guests from '../locales/he/guests.json';
import tasks from '../locales/he/tasks.json';
import budget from '../locales/he/budget.json';
import settings from '../locales/he/settings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'he',
    defaultNS: 'common',
    resources: {
      he: { common, onboarding, dashboard, guests, tasks, budget, settings },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
