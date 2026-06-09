import 'i18next';
import type common from '../locales/he/common.json';
import type onboarding from '../locales/he/onboarding.json';
import type dashboard from '../locales/he/dashboard.json';
import type guests from '../locales/he/guests.json';
import type tasks from '../locales/he/tasks.json';
import type budget from '../locales/he/budget.json';
import type settings from '../locales/he/settings.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      onboarding: typeof onboarding;
      dashboard: typeof dashboard;
      guests: typeof guests;
      tasks: typeof tasks;
      budget: typeof budget;
      settings: typeof settings;
    };
  }
}
