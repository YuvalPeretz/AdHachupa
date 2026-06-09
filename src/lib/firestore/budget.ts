/**
 * Firestore data functions for the budget domain.
 *
 * Budget document lives at budget/{coupleId} (doc id == coupleId).
 * Expenses live in budgetExpenses/{expenseId}.
 * The recalculateBreakeven Cloud Function is triggered on budgetExpenses writes.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Budget, WeddingEvent, EventType } from '../../types';
import type { BudgetDoc, BudgetPagePayload, AddExpenseInput } from './types';
import { getEvents } from './events';

// ─── Playwright seam declarations ─────────────────────────────────────────────

declare global {
  interface Window {
    __PLAYWRIGHT_BUDGET_LOADING__?: boolean;
    __PLAYWRIGHT_BUDGET_BREAKEVEN_NEGATIVE__?: boolean;
  }
}

function inPlaywright(): boolean {
  return typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window;
}

// ─── Seam data (mirrors budgetMock.ts constants) ──────────────────────────────

const SEAM_BUDGET_EVENTS: WeddingEvent[] = [
  { id: 'evt-wedding', type: 'wedding' as EventType, label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום' },
  { id: 'evt-henna', type: 'henna' as EventType, label: 'חינה', date: '07/11/2026', venue: 'בית הכלה' },
];

const BASE_BUDGET: Budget = {
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

const SEAM_BUDGET_NEGATIVE: Budget = {
  ...BASE_BUDGET,
  totalSpent: 85_000,
  giftIncome: 22_000,
  breakeven: -7_500,
};

const SEAM_CONFIRMED_GUEST_COUNT = 103;

// Mutable seam state — reset on each page load (module scope)
let mutableBudget: Budget = { ...BASE_BUDGET, categories: BASE_BUDGET.categories.map((c) => ({ ...c })) };

// ─── Firestore functions ──────────────────────────────────────────────────────

export async function fetchBudget(coupleId: string): Promise<BudgetPagePayload> {
  if (typeof window !== 'undefined') {
    if (window.__PLAYWRIGHT_BUDGET_LOADING__) return new Promise(() => {});
    if (window.__PLAYWRIGHT_BUDGET_BREAKEVEN_NEGATIVE__) {
      return {
        budget: SEAM_BUDGET_NEGATIVE,
        rsvpBreakeven: -30_300,
        confirmedGuestCount: SEAM_CONFIRMED_GUEST_COUNT,
        events: SEAM_BUDGET_EVENTS,
        coupleNames: 'יובל ושיר',
      };
    }
    if (inPlaywright()) {
      return {
        budget: { ...mutableBudget, categories: mutableBudget.categories.map((c) => ({ ...c })) },
        rsvpBreakeven: 14_200,
        confirmedGuestCount: SEAM_CONFIRMED_GUEST_COUNT,
        events: SEAM_BUDGET_EVENTS,
        coupleNames: 'יובל ושיר',
      };
    }
  }

  const [budgetSnap, events, guestsSnap] = await Promise.all([
    getDoc(doc(db, 'budget', coupleId)),
    getEvents(coupleId),
    getDocs(query(collection(db, 'guests'), where('coupleId', '==', coupleId), where('rsvpStatus', '==', 'confirmed'))),
  ]);

  let budget: Budget = { totalBudget: 0, totalSpent: 0, giftIncome: 0, breakeven: 0, categories: [] };
  let rsvpBreakeven = 0;

  if (budgetSnap.exists()) {
    const data = budgetSnap.data() as BudgetDoc;
    budget = {
      totalBudget: data.totalBudget,
      totalSpent: data.totalSpent,
      giftIncome: data.giftIncome,
      breakeven: data.breakeven,
      categories: data.categories ?? [],
    };
    rsvpBreakeven = data.rsvpBreakeven ?? 0;
  }

  let coupleNames = '';
  try {
    const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
    if (coupleSnap.exists()) {
      const data = coupleSnap.data() as { name1?: string; name2?: string };
      coupleNames = [data.name1, data.name2].filter(Boolean).join(' ו');
    }
  } catch {
    coupleNames = '';
  }

  return {
    budget,
    rsvpBreakeven,
    confirmedGuestCount: guestsSnap.size,
    events,
    coupleNames,
  };
}

export async function updateTotalBudget(coupleId: string, totalBudget: number): Promise<void> {
  if (inPlaywright()) {
    mutableBudget = { ...mutableBudget, totalBudget, breakeven: totalBudget - mutableBudget.totalSpent };
    return;
  }
  await setDoc(doc(db, 'budget', coupleId), { totalBudget, updatedAt: serverTimestamp() }, { merge: true });
}

export async function addExpense(
  coupleId: string,
  data: AddExpenseInput,
): Promise<{ id: string }> {
  if (inPlaywright()) {
    // Compute the actual cost based on billing unit so E2E assertions on percent are accurate
    const cost =
      data.billingUnit === 'per_guest'
        ? (data.unitPrice ?? 0) * SEAM_CONFIRMED_GUEST_COUNT
        : (data.actualCost ?? data.estimatedCost ?? 0);

    const newTotalSpent = mutableBudget.totalSpent + cost;

    // Update category spent amount
    const updatedCategories = mutableBudget.categories.map((cat) =>
      cat.name === data.category
        ? { ...cat, spent: cat.spent + cost }
        : { ...cat },
    );

    mutableBudget = {
      ...mutableBudget,
      totalSpent: newTotalSpent,
      // Simple breakeven: budget - spent (enough for test assertions on sign)
      breakeven: mutableBudget.totalBudget - newTotalSpent,
      categories: updatedCategories,
    };

    return { id: `expense-${Date.now()}` };
  }

  const expenseData = {
    coupleId,
    name: data.name,
    category: data.category,
    estimatedCost: data.estimatedCost,
    actualCost: data.actualCost,
    billingUnit: data.billingUnit,
    unitPrice: data.unitPrice,
    guestCount: data.guestCount,
    priority: data.priority,
    eventId: data.eventId,
    linkedVendorId: data.linkedVendorId,
    responsible: data.responsible,
    notes: data.notes,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'budgetExpenses'), expenseData);
  return { id: ref.id };
}
