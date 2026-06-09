/**
 * Mock data for the Budget page.
 *
 * Provides fake async resolvers used by useBudget and AddExpenseSheet
 * while no live Firebase backend is wired up.
 *
 * Playwright seams (window.__PLAYWRIGHT_BUDGET_*__) allow tests to
 * control: breakeven sign, loading state, and empty categories.
 *
 * Note: This module is intentionally independent from dashboardMock.ts.
 * The Dashboard uses its own budget snapshot; the Budget page owns its
 * fuller model (rsvpBreakeven, per-category rows). Keeping them separate
 * avoids coupling and prevents accidental Dashboard test regressions.
 */
import type { Budget, WeddingEvent } from '../../types';

// ─── Global Playwright seam declarations ────────────────────────────────────

declare global {
  interface Window {
    /** When true, budget query never resolves (loading skeleton test). */
    __PLAYWRIGHT_BUDGET_LOADING__?: boolean;
    /** When true, breakeven is negative (deficit). */
    __PLAYWRIGHT_BUDGET_BREAKEVEN_NEGATIVE__?: boolean;
  }
}

// ─── Extended budget payload (Budget page needs more than Dashboard) ─────────

export interface BudgetPagePayload {
  budget: Budget;
  /** Surplus/deficit if ALL confirmed guests attend and each brings avg gift */
  rsvpBreakeven: number;
  confirmedGuestCount: number;
  events: WeddingEvent[];
  coupleNames: string;
}

export interface BudgetExpense {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  actualCost?: number;
  billingUnit: import('../../types').BillingUnit;
  unitPrice?: number;
  guestCount?: number;
  priority: 'required' | 'optional';
  eventId: string;
  linkedVendorId?: string;
  responsible?: string;
  notes?: string;
}

// ─── Mock events (shared with guests/tasks mock data) ───────────────────────

export const MOCK_BUDGET_EVENTS: WeddingEvent[] = [
  { id: 'evt-wedding', type: 'wedding', label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום' },
  { id: 'evt-henna', type: 'henna', label: 'חינה', date: '07/11/2026', venue: 'בית הכלה' },
];

// ─── Mock budget data — positive breakeven ──────────────────────────────────

const MOCK_BUDGET_POSITIVE: Budget = {
  totalBudget: 100_000,
  totalSpent: 48_500,
  giftIncome: 22_000,
  breakeven: 26_500,
  categories: [
    { name: 'אולם ותפעול', allocated: 40_000, spent: 22_000 },
    { name: 'ספקים', allocated: 30_000, spent: 15_500 },
    { name: 'ביגוד', allocated: 15_000, spent: 8_000 },
    { name: 'הוצאות נוספות', allocated: 10_000, spent: 2_000 },
    { name: 'אחר', allocated: 5_000, spent: 1_000 },
  ],
};

/** Variant with negative breakeven — deficit scenario */
const MOCK_BUDGET_NEGATIVE: Budget = {
  ...MOCK_BUDGET_POSITIVE,
  totalSpent: 85_000,
  giftIncome: 22_000,
  breakeven: -7_500,
};

// ─── In-memory mutable state for mutations ────────────────────────────────────

let mutableBudget: Budget = { ...MOCK_BUDGET_POSITIVE };
let mutableExpenses: BudgetExpense[] = [
  {
    id: 'exp-1',
    name: 'אולם האירועים',
    category: 'אולם ותפעול',
    estimatedCost: 20_000,
    actualCost: 22_000,
    billingUnit: 'per_guest',
    unitPrice: 110,
    guestCount: 180,
    priority: 'required',
    eventId: 'evt-wedding',
  },
  {
    id: 'exp-2',
    name: 'DJ Alexander',
    category: 'ספקים',
    estimatedCost: 4_500,
    billingUnit: 'per_item',
    priority: 'required',
    eventId: 'evt-wedding',
  },
  {
    id: 'exp-3',
    name: 'שמלת כלה',
    category: 'ביגוד',
    estimatedCost: 8_000,
    billingUnit: 'per_item',
    priority: 'required',
    eventId: 'evt-wedding',
  },
];

// ─── Mock resolvers ───────────────────────────────────────────────────────────

export async function fetchBudgetMock(): Promise<BudgetPagePayload> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_BUDGET_LOADING__) {
    return new Promise(() => { /* never resolves */ });
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 250));

  const isNegative =
    typeof window !== 'undefined' && window.__PLAYWRIGHT_BUDGET_BREAKEVEN_NEGATIVE__;

  const budget = isNegative ? { ...MOCK_BUDGET_NEGATIVE } : { ...mutableBudget };

  return {
    budget,
    rsvpBreakeven: isNegative ? -30_300 : 14_200,
    confirmedGuestCount: 103,
    events: MOCK_BUDGET_EVENTS,
    coupleNames: 'יובל ושיר',
  };
}

export interface AddExpenseInput {
  name: string;
  category: string;
  estimatedCost: number;
  actualCost?: number;
  billingUnit: import('../../types').BillingUnit;
  unitPrice?: number;
  guestCount?: number;
  priority: 'required' | 'optional';
  eventId: string;
  linkedVendorId?: string;
  responsible?: string;
  notes?: string;
}

export async function addExpenseMock(data: AddExpenseInput): Promise<{
  expense: BudgetExpense;
  budget: Budget;
}> {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));

  const newExpense: BudgetExpense = {
    id: `exp-${Date.now()}`,
    ...data,
  };

  mutableExpenses = [...mutableExpenses, newExpense];

  // Update the matching category's spent amount
  const cost = data.actualCost ?? data.estimatedCost;
  const updatedCategories = mutableBudget.categories.map((cat) =>
    cat.name === data.category
      ? { ...cat, spent: cat.spent + cost, allocated: cat.allocated + data.estimatedCost }
      : cat,
  );

  // If category doesn't exist yet, add it
  const exists = mutableBudget.categories.some((c) => c.name === data.category);
  if (!exists) {
    updatedCategories.push({
      name: data.category,
      allocated: data.estimatedCost,
      spent: cost,
    });
  }

  const newTotalSpent = mutableBudget.totalSpent + cost;
  // breakeven = remaining_budget - giftIncome  (positive = surplus, negative = deficit)
  const newBreakeven = (mutableBudget.totalBudget - newTotalSpent) - mutableBudget.giftIncome;

  mutableBudget = {
    ...mutableBudget,
    totalSpent: newTotalSpent,
    breakeven: newBreakeven,
    categories: updatedCategories,
  };

  return { expense: newExpense, budget: { ...mutableBudget } };
}

/** Reset mutable state — for use in Playwright beforeEach */
export function resetBudgetMockState() {
  mutableBudget = {
    ...MOCK_BUDGET_POSITIVE,
    categories: MOCK_BUDGET_POSITIVE.categories.map((c) => ({ ...c })),
  };
  mutableExpenses = [
    {
      id: 'exp-1',
      name: 'אולם האירועים',
      category: 'אולם ותפעול',
      estimatedCost: 20_000,
      actualCost: 22_000,
      billingUnit: 'per_guest',
      unitPrice: 110,
      guestCount: 180,
      priority: 'required',
      eventId: 'evt-wedding',
    },
    {
      id: 'exp-2',
      name: 'DJ Alexander',
      category: 'ספקים',
      estimatedCost: 4_500,
      billingUnit: 'per_item',
      priority: 'required',
      eventId: 'evt-wedding',
    },
    {
      id: 'exp-3',
      name: 'שמלת כלה',
      category: 'ביגוד',
      estimatedCost: 8_000,
      billingUnit: 'per_item',
      priority: 'required',
      eventId: 'evt-wedding',
    },
  ];
}
