/**
 * Type converters and mappers between Firestore document shapes and UI types.
 *
 * All date conversions:
 *   Firestore storage: ISO string YYYY-MM-DD
 *   UI display: DD/MM/YYYY (per CLAUDE.md Hebrew date format)
 */

import type { Guest, WeddingEvent, Task, Vendor, TaskPayment, TaskDecision, TaskReminder } from '../../types';
import type {
  GuestDoc,
  EventDoc,
  TaskDoc,
  TaskPaymentDoc,
  TaskDecisionDoc,
  TaskReminderDoc,
  VendorDoc,
} from './types';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Convert stored ISO (YYYY-MM-DD) to display format (DD/MM/YYYY). */
export function toDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Convert display format (DD/MM/YYYY) to stored ISO (YYYY-MM-DD). */
export function fromDisplay(display: string): string {
  const [d, m, y] = display.split('/');
  return `${y}-${m}-${d}`;
}

/** Parse a DD/MM/YYYY date string to a JS Date (midnight UTC). Returns null if invalid. */
export function parseDisplayDate(display: string): Date | null {
  const [d, m, y] = display.split('/');
  if (!d || !m || !y) return null;
  const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
  return isNaN(date.getTime()) ? null : date;
}

/** Days until target date (positive = future, negative = past). */
export function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

// ─── Document mappers ─────────────────────────────────────────────────────────

export function docToGuest(id: string, data: GuestDoc): Guest {
  return {
    id,
    name: data.name,
    phone: data.phone,
    rsvpStatus: data.rsvpStatus,
    invitedBy: data.invitedBy,
    plusOnes: data.plusOnes,
    tableNo: data.tableNo,
    eventIds: data.eventIds ?? [],
  };
}

export function docToEvent(id: string, data: EventDoc): WeddingEvent {
  return {
    id,
    type: data.type,
    label: data.label,
    date: data.date ? toDisplay(data.date) : undefined,
    venue: data.venue,
  };
}

export function docToTask(id: string, data: TaskDoc): Task {
  const closingDate = data.closingDate ? toDisplay(data.closingDate) : undefined;
  const isOverdue =
    closingDate != null &&
    data.status !== 'closed' &&
    (() => {
      const parsed = parseDisplayDate(closingDate);
      return parsed != null && daysUntil(parsed) < 0;
    })();

  return {
    id,
    name: data.name,
    type: data.type,
    category: data.category,
    priority: data.priority,
    status: data.status,
    responsible: data.responsible,
    dueDate: closingDate,
    isOverdue,
    eventId: data.eventId,
    notes: data.notes,
    selectedVendorId: data.selectedVendorId,
  };
}

export function docToTaskPayment(taskId: string, data: TaskPaymentDoc): TaskPayment {
  return {
    taskId,
    estimatedCost: data.estimatedCost,
    actualCost: data.actualCost,
    billingUnit: data.billingUnit,
    advancePaid: data.advancePaid,
    advanceAmount: data.advanceAmount,
    balancePaid: data.balancePaid,
    balanceAmount: data.balanceAmount,
    deadline: data.deadline ? toDisplay(data.deadline) : undefined,
    paymentStatus: data.paymentStatus,
    linkedVendorId: data.linkedVendorId,
  };
}

export function docToTaskDecision(taskId: string, data: TaskDecisionDoc): TaskDecision {
  return {
    taskId,
    options: data.options ?? [],
    finalDecision: data.finalDecision,
  };
}

export function docToTaskReminder(taskId: string, data: TaskReminderDoc): TaskReminder {
  return {
    taskId,
    reminderDate: data.reminderDate ? toDisplay(data.reminderDate) : undefined,
    reminderTime: data.reminderTime,
    notifyEnabled: data.notifyEnabled,
    linkedTaskId: data.linkedTaskId,
    linkedTaskName: data.linkedTaskName,
    linkedEventName: data.linkedEventName,
    dependencyTaskId: data.dependencyTaskId,
    dependencyTaskName: data.dependencyTaskName,
  };
}

export function docToVendor(id: string, data: VendorDoc): Vendor {
  return {
    id,
    name: data.name,
    status: data.status,
    priceMin: data.priceMin,
    priceMax: data.priceMax,
    email: data.email,
    phone: data.phone,
    rating: data.rating,
    notes: data.notes,
  };
}
