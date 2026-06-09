/**
 * Firestore data functions for the tasks domain.
 *
 * Each function checks Playwright seams before any Firestore call.
 * The catch-all `inPlaywright()` guard ensures any Playwright test
 * gets consistent mock data without touching real Firebase.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import type { Task, WeddingEvent, TasksPayload, TaskPayment, TaskDecision, TaskReminder, EventType } from '../../types';
import type { TaskDoc, TaskPaymentDoc, TaskDecisionDoc, TaskReminderDoc, TaskVendorConfigDoc } from './types';
import { docToTask, docToTaskPayment, docToTaskDecision, docToTaskReminder, fromDisplay } from './converters';
import { getEvents } from './events';

// ─── Playwright seam declarations ─────────────────────────────────────────────

declare global {
  interface Window {
    __PLAYWRIGHT_TASKS_LOADING__?: boolean;
    __PLAYWRIGHT_TASKS_EMPTY__?: boolean;
    __PLAYWRIGHT_PAYMENT_FAIL__?: boolean;
    __PLAYWRIGHT_TASK_PAYMENT_STATE__?: 'unpaid' | 'advance_paid' | 'fully_paid';
  }
}

function inPlaywright(): boolean {
  return typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window;
}

// ─── Seam data (mirrors tasksMock.ts constants) ───────────────────────────────

const SEAM_TASK_EVENTS: WeddingEvent[] = [
  { id: 'evt-wedding', type: 'wedding' as EventType, label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום' },
  { id: 'evt-henna', type: 'henna' as EventType, label: 'חינה', date: '07/11/2026', venue: 'בית הכלה' },
];

const BASE_TASKS: Task[] = [
  { id: 'task-1', name: "בחירת דיג'יי", type: 'vendor', category: 'ספקים', priority: 'essential', status: 'inProgress', responsible: 'partner1', dueDate: '01/06/2026', isOverdue: true, eventId: 'evt-wedding', notes: "לבדוק עם DJ Alexander ו-DJ מיכל" },
  { id: 'task-2', name: 'תשלום מקדמה לאולם', type: 'payment', category: 'תשלומים', priority: 'essential', status: 'notStarted', responsible: 'partner2', dueDate: '15/09/2026', isOverdue: false, eventId: 'evt-wedding', notes: '' },
  { id: 'task-3', name: 'בחירת שמלת כלה', type: 'decision', category: 'ביגוד', priority: 'aesthetic', status: 'notStarted', responsible: 'partner1', dueDate: '01/08/2026', isOverdue: false, eventId: 'evt-wedding', notes: '' },
  { id: 'task-4', name: 'תזכורת לרב', type: 'reminder', category: 'לוגיסטיקה', priority: 'logistic', status: 'notStarted', responsible: 'partner2', dueDate: '01/10/2026', isOverdue: false, eventId: 'evt-wedding', notes: '' },
  { id: 'task-5', name: 'השכרת חליפת חתן', type: 'vendor', category: 'ביגוד', priority: 'logistic', status: 'closed', responsible: 'partner2', dueDate: '01/07/2026', isOverdue: false, eventId: 'evt-wedding', notes: 'בחרנו את חנות שלמה' },
  { id: 'task-6', name: 'מאפר ותסרוקת כלה', type: 'vendor', category: 'טיפוח', priority: 'essential', status: 'notStarted', responsible: 'partner1', dueDate: '01/08/2026', isOverdue: false, eventId: 'evt-wedding', notes: '' },
];

const BASE_PAYMENT: TaskPayment = {
  taskId: 'task-2',
  estimatedCost: 35_000,
  billingUnit: 'per_guest',
  advancePaid: false,
  advanceAmount: 10_000,
  balancePaid: false,
  balanceAmount: 25_000,
  deadline: '15/09/2026',
  paymentStatus: 'unpaid',
};

const BASE_DECISION: TaskDecision = {
  taskId: 'task-3',
  options: [
    { id: 'opt-1', label: 'שמלה A — מעצב מיכל', pros: ['נפוחה ועדינה', 'מחיר סביר'], cons: ['צריך שינויים'] },
    { id: 'opt-2', label: 'שמלה B — בוטיק שרה', pros: ['מושלמת כמות שהיא', 'קנייה מיידית'], cons: ['יקרה יותר'] },
  ],
};

const BASE_REMINDER: TaskReminder = {
  taskId: 'task-4',
  reminderDate: '25/09/2026',
  reminderTime: '10:00',
  notifyEnabled: true,
  linkedTaskId: 'task-2',
  linkedTaskName: 'תשלום מקדמה לאולם',
  linkedEventName: 'חתונה',
};

// Mutable seam state — reset on each page load (module scope)
let mutableTasks: Task[] = [...BASE_TASKS];
let mutablePayment: TaskPayment = { ...BASE_PAYMENT };
let mutableDecision: TaskDecision = { ...BASE_DECISION, options: [...BASE_DECISION.options] };
let mutableReminder: TaskReminder = { ...BASE_REMINDER };

// ─── Tasks ─────────────────────────────────────────────────────────────────────

export async function fetchTasks(coupleId: string): Promise<TasksPayload> {
  if (typeof window !== 'undefined') {
    if (window.__PLAYWRIGHT_TASKS_LOADING__) return new Promise(() => {});
    if (window.__PLAYWRIGHT_TASKS_EMPTY__) {
      return { tasks: [], events: SEAM_TASK_EVENTS, coupleNames: 'יובל ושיר' };
    }
    if (inPlaywright()) {
      return { tasks: mutableTasks, events: SEAM_TASK_EVENTS, coupleNames: 'יובל ושיר' };
    }
  }

  const [tasksSnap, events] = await Promise.all([
    getDocs(query(collection(db, 'tasks'), where('coupleId', '==', coupleId))),
    getEvents(coupleId),
  ]);

  const tasks = tasksSnap.docs.map((d) => docToTask(d.id, d.data() as unknown as TaskDoc));

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

  return { tasks, events, coupleNames };
}

export async function fetchTaskById(taskId: string): Promise<Task | null> {
  if (inPlaywright()) {
    return mutableTasks.find((t) => t.id === taskId) ?? null;
  }

  const snap = await getDoc(doc(db, 'tasks', taskId));
  if (!snap.exists()) return null;
  return docToTask(snap.id, snap.data() as unknown as TaskDoc);
}

export async function addTask(
  coupleId: string,
  data: {
    name: string;
    type: Task['type'];
    category: string;
    priority: Task['priority'];
    eventId: string;
    dueDate?: string;
    responsible?: string;
    notes?: string;
  },
): Promise<Task> {
  if (inPlaywright()) {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: data.name,
      type: data.type,
      category: data.category,
      priority: data.priority,
      status: 'notStarted',
      responsible: data.responsible,
      dueDate: data.dueDate,
      isOverdue: false,
      eventId: data.eventId,
      notes: data.notes,
    };
    mutableTasks = [...mutableTasks, newTask];
    return newTask;
  }

  const taskData: Omit<TaskDoc, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>; updatedAt: ReturnType<typeof serverTimestamp> } = {
    coupleId,
    eventId: data.eventId,
    name: data.name,
    type: data.type,
    category: data.category,
    priority: data.priority,
    status: 'notStarted',
    responsible: data.responsible,
    closingDate: data.dueDate ? fromDisplay(data.dueDate) : undefined,
    notes: data.notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'tasks'), taskData);
  await _createTaskDetailDoc(coupleId, ref.id, data.type);

  return {
    id: ref.id,
    name: data.name,
    type: data.type,
    category: data.category,
    priority: data.priority,
    status: 'notStarted',
    responsible: data.responsible,
    dueDate: data.dueDate,
    isOverdue: false,
    eventId: data.eventId,
    notes: data.notes,
  };
}

async function _createTaskDetailDoc(coupleId: string, taskId: string, type: Task['type']): Promise<void> {
  switch (type) {
    case 'payment': {
      const paymentData: TaskPaymentDoc = { coupleId, estimatedCost: 0, billingUnit: 'per_item', advancePaid: false, balancePaid: false, paymentStatus: 'unpaid' };
      await setDoc(doc(db, 'taskPayments', taskId), paymentData);
      break;
    }
    case 'vendor': {
      const vendorConfigData: TaskVendorConfigDoc = { coupleId, vendorOptions: [] };
      await setDoc(doc(db, 'taskVendorConfigs', taskId), vendorConfigData);
      break;
    }
    case 'decision': {
      const decisionData: TaskDecisionDoc = { coupleId, options: [] };
      await setDoc(doc(db, 'taskDecisions', taskId), decisionData);
      break;
    }
    case 'reminder': {
      const reminderData: TaskReminderDoc = { coupleId, notifyEnabled: false };
      await setDoc(doc(db, 'taskReminders', taskId), reminderData);
      break;
    }
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'status' | 'notes' | 'selectedVendorId'>>,
): Promise<Task> {
  if (inPlaywright()) {
    mutableTasks = mutableTasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t,
    );
    const task = mutableTasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    return task;
  }

  const firestoreUpdates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.status !== undefined) firestoreUpdates.status = updates.status;
  if (updates.notes !== undefined) firestoreUpdates.notes = updates.notes;
  if (updates.selectedVendorId !== undefined) firestoreUpdates.selectedVendorId = updates.selectedVendorId;

  await updateDoc(doc(db, 'tasks', taskId), firestoreUpdates);
  const snap = await getDoc(doc(db, 'tasks', taskId));
  return docToTask(snap.id, snap.data() as unknown as TaskDoc);
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export async function fetchTaskPayment(taskId: string): Promise<TaskPayment> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_TASK_PAYMENT_STATE__) {
    const state = window.__PLAYWRIGHT_TASK_PAYMENT_STATE__;
    if (state === 'advance_paid') {
      return { ...BASE_PAYMENT, taskId, advancePaid: true, paymentStatus: 'advance_paid' };
    }
    if (state === 'fully_paid') {
      return { ...BASE_PAYMENT, taskId, advancePaid: true, balancePaid: true, paymentStatus: 'fully_paid' };
    }
  }
  if (inPlaywright()) {
    return taskId === mutablePayment.taskId
      ? { ...mutablePayment }
      : { taskId, estimatedCost: 0, billingUnit: 'per_item', advancePaid: false, balancePaid: false, paymentStatus: 'unpaid' };
  }

  const snap = await getDoc(doc(db, 'taskPayments', taskId));
  if (!snap.exists()) {
    return { taskId, estimatedCost: 0, billingUnit: 'per_item', advancePaid: false, balancePaid: false, paymentStatus: 'unpaid' };
  }
  return docToTaskPayment(taskId, snap.data() as unknown as TaskPaymentDoc);
}

export async function updateTaskPayment(
  coupleId: string,
  taskId: string,
  updates: Partial<Pick<TaskPayment, 'advancePaid' | 'advanceAmount' | 'balancePaid' | 'balanceAmount'>>,
): Promise<{ payment: TaskPayment; task: Task }> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_PAYMENT_FAIL__) {
    await new Promise<void>((r) => setTimeout(r, 200));
    throw new Error('Payment update failed');
  }

  if (inPlaywright()) {
    if (taskId === mutablePayment.taskId) {
      mutablePayment = {
        ...mutablePayment,
        ...updates,
        paymentStatus: updates.balancePaid
          ? 'fully_paid'
          : updates.advancePaid
          ? 'advance_paid'
          : 'unpaid',
      };
    }
    const task = mutableTasks.find((t) => t.id === taskId) ?? BASE_TASKS[1];
    return { payment: { ...mutablePayment }, task };
  }

  const updateFn = httpsCallable<
    { coupleId: string; taskId: string; updates: typeof updates },
    { payment: TaskPayment; task: Task }
  >(functions, 'updatePayment');
  const result = await updateFn({ coupleId, taskId, updates });
  return result.data;
}

// ─── Decision ─────────────────────────────────────────────────────────────────

export async function fetchTaskDecision(taskId: string): Promise<TaskDecision> {
  if (inPlaywright()) {
    return taskId === mutableDecision.taskId
      ? { ...mutableDecision, options: [...mutableDecision.options] }
      : { taskId, options: [] };
  }

  const snap = await getDoc(doc(db, 'taskDecisions', taskId));
  if (!snap.exists()) return { taskId, options: [] };
  return docToTaskDecision(taskId, snap.data() as unknown as TaskDecisionDoc);
}

export async function updateTaskDecision(
  taskId: string,
  updates: Partial<TaskDecision>,
): Promise<TaskDecision> {
  if (inPlaywright()) {
    if (taskId === mutableDecision.taskId) {
      mutableDecision = { ...mutableDecision, ...updates };
    }
    return taskId === mutableDecision.taskId
      ? { ...mutableDecision }
      : { taskId, options: [] };
  }

  await updateDoc(doc(db, 'taskDecisions', taskId), updates as Record<string, unknown>);
  const snap = await getDoc(doc(db, 'taskDecisions', taskId));
  return docToTaskDecision(taskId, snap.data() as unknown as TaskDecisionDoc);
}

// ─── Reminder ─────────────────────────────────────────────────────────────────

export async function fetchTaskReminder(taskId: string): Promise<TaskReminder> {
  if (inPlaywright()) {
    return taskId === mutableReminder.taskId
      ? { ...mutableReminder }
      : { taskId, notifyEnabled: false };
  }

  const snap = await getDoc(doc(db, 'taskReminders', taskId));
  if (!snap.exists()) return { taskId, notifyEnabled: false };
  return docToTaskReminder(taskId, snap.data() as unknown as TaskReminderDoc);
}

export async function updateTaskReminder(
  taskId: string,
  updates: Partial<TaskReminder>,
): Promise<TaskReminder> {
  if (inPlaywright()) {
    if (taskId === mutableReminder.taskId) {
      mutableReminder = { ...mutableReminder, ...updates };
    }
    return taskId === mutableReminder.taskId
      ? { ...mutableReminder }
      : { taskId, notifyEnabled: false };
  }

  const firestoreUpdates: Record<string, unknown> = { ...updates };
  if (updates.reminderDate) firestoreUpdates.reminderDate = fromDisplay(updates.reminderDate);
  await updateDoc(doc(db, 'taskReminders', taskId), firestoreUpdates);
  const snap = await getDoc(doc(db, 'taskReminders', taskId));
  return docToTaskReminder(taskId, snap.data() as unknown as TaskReminderDoc);
}

// ─── Seam data exports ────────────────────────────────────────────────────────

export {
  BASE_TASKS as SEAM_BASE_TASKS,
  SEAM_TASK_EVENTS,
  BASE_PAYMENT as SEAM_PAYMENT_TASK_2,
  BASE_DECISION as SEAM_DECISION_TASK_3,
  BASE_REMINDER as SEAM_REMINDER_TASK_4,
};
