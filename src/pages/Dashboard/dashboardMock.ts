/**
 * Mock data for the Dashboard page.
 *
 * This module provides the fake async resolver used by useDashboard while
 * no live Firebase backend is wired up. It also exposes a Playwright seam
 * (`window.__PLAYWRIGHT_DASHBOARD_BREAKEVEN_NEGATIVE__`) so tests can
 * verify both positive and negative breakeven colour states without modifying
 * production data-loading logic.
 *
 * The seam is only ever set by Playwright's addInitScript — it is never set
 * in production code.
 */
import type { DashboardPayload } from '../../types';

declare global {
  interface Window {
    /** Set to `true` in Playwright tests to force a negative breakeven state. */
    __PLAYWRIGHT_DASHBOARD_BREAKEVEN_NEGATIVE__?: boolean;
    /** Set to `true` in Playwright tests to keep the loading state indefinitely. */
    __PLAYWRIGHT_DASHBOARD_LOADING__?: boolean;
  }
}

const MOCK_PAYLOAD_POSITIVE: DashboardPayload = {
  coupleNames: 'יובל ושיר',
  upcomingEvent: {
    id: 'evt-wedding',
    type: 'wedding',
    label: 'חתונה',
    date: '14/11/2026',
    venue: 'אולם הגן הקסום, תל אביב',
    daysLeft: 161,
  },
  taskProgress: {
    completed: 12,
    inProgress: 8,
    notStarted: 28,
    total: 48,
  },
  upcomingTasks: [],
  budget: {
    totalBudget: 100_000,
    totalSpent: 48_500,
    giftIncome: 22_000,
    breakeven: 26_500,
    categories: [
      { name: 'אולם ותפעול', allocated: 40_000, spent: 22_000 },
      { name: 'ספקים', allocated: 30_000, spent: 15_500 },
      { name: 'ביגוד', allocated: 15_000, spent: 8_000 },
      { name: 'אחר', allocated: 15_000, spent: 3_000 },
    ],
  },
  vendors: [
    { id: 'v1', name: 'DJ Alexander', status: 'selected', priceMin: 4_000, priceMax: 5_000 },
    { id: 'v2', name: 'סטודיו לימור', status: 'selected', priceMin: 6_000, priceMax: 8_000 },
    { id: 'v3', name: 'פרחים מאת רות', status: 'selected', priceMin: 3_000, priceMax: 4_000 },
    { id: 'v4', name: 'הקייטרינג של דוד', status: 'selected', priceMin: 25_000, priceMax: 30_000 },
    { id: 'v5', name: 'מאפה חנה', status: 'selected', priceMin: 2_000, priceMax: 2_500 },
    { id: 'v6', name: 'להקת גן עדן', status: 'selected', priceMin: 7_000, priceMax: 9_000 },
  ],
  otherEvents: [
    {
      id: 'evt-henna',
      type: 'henna',
      label: 'חינה',
      date: '07/11/2026',
      venue: 'בית הכלה',
      daysLeft: 154,
    },
    {
      id: 'evt-shabbat',
      type: 'shabbat',
      label: 'שבת חתן',
      date: '08/11/2026',
      venue: 'בית הכנסת',
      daysLeft: 155,
    },
  ],
};

/** Variant with negative breakeven (spent > budget − giftIncome) for test coverage */
const MOCK_PAYLOAD_NEGATIVE: DashboardPayload = {
  ...MOCK_PAYLOAD_POSITIVE,
  budget: {
    ...MOCK_PAYLOAD_POSITIVE.budget,
    totalSpent: 85_000,
    giftIncome: 22_000,
    breakeven: -7_500,
  },
};

/** Simulated async fetch — returns after a short delay so skeleton is observable. */
export async function fetchDashboardMock(): Promise<DashboardPayload> {
  // Allow Playwright to keep the loading state indefinitely for skeleton tests
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_DASHBOARD_LOADING__) {
    return new Promise(() => {
      // Never resolves — Playwright snapshot is taken while loading
    });
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 300));

  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_DASHBOARD_BREAKEVEN_NEGATIVE__) {
    return MOCK_PAYLOAD_NEGATIVE;
  }

  return MOCK_PAYLOAD_POSITIVE;
}
