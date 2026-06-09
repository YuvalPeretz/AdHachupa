/**
 * Firestore document shapes — internal to the data layer.
 *
 * These interfaces describe what lives in Firestore. They are NOT exported
 * to the rest of the app; the domain functions in this directory map them
 * to the clean UI types defined in `src/types/index.ts`.
 *
 * Naming convention: <Collection>Doc
 *   - Always includes `coupleId: string` (for owner-scoped queries / rules)
 *   - Timestamps are `Timestamp` from firebase/firestore
 *   - Dates the UI shows as DD/MM/YYYY are stored as ISO strings (YYYY-MM-DD)
 */

import type { Timestamp } from 'firebase/firestore';
import type {
  RsvpStatus,
  TaskStatus,
  VendorStatus,
  TaskPriority,
  BillingUnit,
  EventType,
  BudgetCategory,
  DecisionOption,
} from '../../types';
import type { Gender } from '../../store/onboardingSlice';

// ─── Couple ───────────────────────────────────────────────────────────────────

export interface CoupleDoc {
  coupleId: string;
  name1: string;
  name2: string;
  gender1: Gender;
  gender2: Gender;
  region: string;
  isKosher: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Event ────────────────────────────────────────────────────────────────────

export interface EventDoc {
  coupleId: string;
  type: EventType;
  label: string;
  /** ISO date string: YYYY-MM-DD */
  date?: string;
  venue?: string;
  guestCountExpected: number;
  createdAt: Timestamp;
}

// ─── Guest ────────────────────────────────────────────────────────────────────

export interface GuestDoc {
  coupleId: string;
  name: string;
  phone?: string;
  email?: string;
  rsvpStatus: RsvpStatus;
  invitedBy: string;
  plusOnes: number;
  tableNo?: string;
  eventIds: string[];
  /** Set when the guest was added via a parent-share link */
  sourceToken?: string;
  updatedAt: Timestamp;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface TaskDoc {
  coupleId: string;
  eventId: string;
  name: string;
  type: 'vendor' | 'payment' | 'decision' | 'reminder';
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  responsible?: string;
  /** ISO date string: YYYY-MM-DD */
  closingDate?: string;
  selectedVendorId?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Task sub-type detail documents (doc id == taskId) ────────────────────────

export interface TaskPaymentDoc {
  coupleId: string;
  estimatedCost: number;
  actualCost?: number;
  billingUnit: BillingUnit;
  advancePaid: boolean;
  advanceAmount?: number;
  balancePaid: boolean;
  balanceAmount?: number;
  paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid';
  /** ISO date string: YYYY-MM-DD */
  deadline?: string;
  linkedVendorId?: string;
}

export interface TaskVendorConfigDoc {
  coupleId: string;
  vendorOptions: string[]; // vendorId refs — actual docs live in /vendors
}

export interface TaskDecisionDoc {
  coupleId: string;
  options: DecisionOption[];
  finalDecision?: string;
}

export interface TaskReminderDoc {
  coupleId: string;
  /** ISO date string: YYYY-MM-DD */
  reminderDate?: string;
  reminderTime?: string;
  notifyEnabled: boolean;
  linkedTaskId?: string;
  linkedTaskName?: string;
  linkedEventName?: string;
  dependencyTaskId?: string;
  dependencyTaskName?: string;
}

// ─── Vendor ───────────────────────────────────────────────────────────────────

export interface VendorDoc {
  coupleId: string;
  taskId: string;
  name: string;
  status: VendorStatus;
  priceMin?: number;
  priceMax?: number;
  email?: string;
  phone?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  updatedAt: Timestamp;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

/** doc id == coupleId */
export interface BudgetDoc {
  coupleId: string;
  totalBudget: number;
  totalSpent: number;
  giftIncome: number;
  breakeven: number;
  rsvpBreakeven: number;
  averageGiftPerGuest: number;
  categories: BudgetCategory[];
  updatedAt: Timestamp;
}

export interface BudgetExpenseDoc {
  coupleId: string;
  name: string;
  category: string;
  estimatedCost: number;
  actualCost?: number;
  billingUnit: BillingUnit;
  unitPrice?: number;
  guestCount?: number;
  priority: 'required' | 'optional';
  eventId: string;
  linkedVendorId?: string;
  responsible?: string;
  notes?: string;
  createdAt: Timestamp;
}

// ─── Share tokens ─────────────────────────────────────────────────────────────

export interface ShareTokenDoc {
  coupleId: string;
  coupleNames: string;
  label: string;
  eventIds: string[];
  expiresAt: Timestamp;
  submitted: boolean;
  submittedAt?: Timestamp;
}

// ─── Dismissed duplicates ─────────────────────────────────────────────────────

export interface DismissedDuplicateDoc {
  coupleId: string;
  guestId1: string;
  guestId2: string;
  createdAt: Timestamp;
}

// ─── Scheduled notifications ──────────────────────────────────────────────────

export interface ScheduledNotificationDoc {
  coupleId: string;
  taskId: string;
  /** ISO datetime string */
  fireAt: string;
  message: string;
  sent: boolean;
}

// ─── Re-exported payload types ────────────────────────────────────────────────
// These are the shapes that data functions return to hooks.
// Some live in *Mock.ts files today — declaring them here makes them
// importable from the real data layer without touching the mock files.

export interface GuestsPayload {
  guests: import('../../types').Guest[];
  events: import('../../types').WeddingEvent[];
  coupleNames: string;
  duplicateCount: number;
}

export interface AddGuestInput {
  name: string;
  phone?: string;
  email?: string;
  plusOnes: number;
  invitedBy: string;
  eventIds: string[];
}

export interface AddGuestPayload {
  guest: import('../../types').Guest;
  duplicates: Array<{ id: string; name: string; phone?: string; similarity: number }>;
}

export interface DuplicatePair {
  id: string;
  guests: [import('../../types').Guest, import('../../types').Guest];
  similarity: number;
  reason: 'phone_match' | 'name_match';
}

export interface DuplicatesPayload {
  pairs: DuplicatePair[];
}

export interface ShareTokenPayload {
  valid: boolean;
  coupleNames: string;
  label: string;
  eventIds: string[];
}

export interface BudgetPagePayload {
  budget: import('../../types').Budget;
  rsvpBreakeven: number;
  confirmedGuestCount: number;
  events: import('../../types').WeddingEvent[];
  coupleNames: string;
}

export interface AddExpenseInput {
  name: string;
  category: string;
  estimatedCost: number;
  actualCost?: number;
  billingUnit: BillingUnit;
  unitPrice?: number;
  guestCount?: number;
  priority: 'required' | 'optional';
  eventId: string;
  linkedVendorId?: string;
  responsible?: string;
  notes?: string;
}

export interface BudgetExpense extends AddExpenseInput {
  id: string;
}
