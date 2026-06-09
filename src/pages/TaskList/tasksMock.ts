/**
 * Mock data for the Task management pages.
 *
 * Provides fake async resolvers used by useTaskList, useTaskDetail,
 * and AddTaskSheet while no live Firebase backend is wired up.
 *
 * Playwright seams (window.__PLAYWRIGHT_TASKS_*__) allow tests to
 * control: loading state, empty state, task mutation results, and
 * payment/vendor state transitions.
 */
import type {
  Task,
  WeddingEvent,
  TasksPayload,
  TaskPayment,
  TaskDecision,
  TaskReminder,
  Vendor,
} from '../../types';

// ─── Global Playwright seam declarations ────────────────────────────────────

declare global {
  interface Window {
    /** When true, task list query never resolves (loading skeleton test). */
    __PLAYWRIGHT_TASKS_LOADING__?: boolean;
    /** When true, task list has no tasks (empty state test). */
    __PLAYWRIGHT_TASKS_EMPTY__?: boolean;
    /** When set, filters tasks by this category for filtered-view tests. */
    __PLAYWRIGHT_TASKS_CATEGORY__?: string;
    /** When true, payment advance mutation fails. */
    __PLAYWRIGHT_PAYMENT_FAIL__?: boolean;
    /** Overrides payment state for a specific task. */
    __PLAYWRIGHT_TASK_PAYMENT_STATE__?: 'unpaid' | 'advance_paid' | 'fully_paid';
  }
}

// ─── Shared mock events ──────────────────────────────────────────────────────

export const MOCK_TASK_EVENTS: WeddingEvent[] = [
  { id: 'evt-wedding', type: 'wedding', label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום' },
  { id: 'evt-henna', type: 'henna', label: 'חינה', date: '07/11/2026', venue: 'בית הכלה' },
];

// ─── Mock task data ──────────────────────────────────────────────────────────

const BASE_TASKS: Task[] = [
  {
    id: 'task-1',
    name: 'בחירת דיג\'יי',
    type: 'vendor',
    category: 'ספקים',
    priority: 'essential',
    status: 'inProgress',
    responsible: 'partner1',
    dueDate: '01/06/2026',
    isOverdue: true,
    eventId: 'evt-wedding',
    notes: 'לבדוק עם DJ Alexander ו-DJ מיכל',
    selectedVendorId: undefined,
  },
  {
    id: 'task-2',
    name: 'תשלום מקדמה לאולם',
    type: 'payment',
    category: 'תשלומים',
    priority: 'essential',
    status: 'notStarted',
    responsible: 'partner2',
    dueDate: '15/09/2026',
    isOverdue: false,
    eventId: 'evt-wedding',
    notes: '',
  },
  {
    id: 'task-3',
    name: 'בחירת שמלת כלה',
    type: 'decision',
    category: 'ביגוד',
    priority: 'aesthetic',
    status: 'notStarted',
    responsible: 'partner1',
    dueDate: '01/08/2026',
    isOverdue: false,
    eventId: 'evt-wedding',
    notes: '',
  },
  {
    id: 'task-4',
    name: 'תזכורת לרב',
    type: 'reminder',
    category: 'לוגיסטיקה',
    priority: 'logistic',
    status: 'notStarted',
    responsible: 'partner2',
    dueDate: '01/10/2026',
    isOverdue: false,
    eventId: 'evt-wedding',
    notes: '',
  },
  {
    id: 'task-5',
    name: 'השכרת חליפת חתן',
    type: 'vendor',
    category: 'ביגוד',
    priority: 'logistic',
    status: 'closed',
    responsible: 'partner2',
    dueDate: '01/07/2026',
    isOverdue: false,
    eventId: 'evt-wedding',
    notes: 'בחרנו את חנות שלמה',
  },
  {
    id: 'task-6',
    name: 'מאפר ותסרוקת כלה',
    type: 'vendor',
    category: 'טיפוח',
    priority: 'essential',
    status: 'notStarted',
    responsible: 'partner1',
    dueDate: '01/08/2026',
    isOverdue: false,
    eventId: 'evt-wedding',
    notes: '',
  },
];

// ─── Mock vendor data (for task-1) ───────────────────────────────────────────

const MOCK_VENDORS_TASK_1: Vendor[] = [
  {
    id: 'v1',
    name: 'DJ Alexander',
    status: 'considering',
    priceMin: 4_000,
    priceMax: 5_000,
    phone: '050-1234567',
    email: 'alex@dj.co.il',
    rating: 4,
    notes: 'מנוסה, ניגן בחתונות רבות',
  },
  {
    id: 'v2',
    name: 'DJ מיכל',
    status: 'considering',
    priceMin: 3_500,
    priceMax: 4_500,
    phone: '052-7654321',
    rating: 3,
    notes: 'תקציבי יותר',
  },
];

// ─── Mock payment data (for task-2) ─────────────────────────────────────────

const MOCK_PAYMENT_TASK_2: TaskPayment = {
  taskId: 'task-2',
  estimatedCost: 35_000,
  billingUnit: 'per_guest',
  advancePaid: false,
  advanceAmount: 10_000,
  balancePaid: false,
  balanceAmount: 25_000,
  deadline: '15/09/2026',
  paymentStatus: 'unpaid',
  linkedVendorId: undefined,
};

// ─── Mock decision data (for task-3) ─────────────────────────────────────────

const MOCK_DECISION_TASK_3: TaskDecision = {
  taskId: 'task-3',
  options: [
    {
      id: 'opt-1',
      label: 'שמלה A — מעצב מיכל',
      pros: ['נפוחה ועדינה', 'מחיר סביר'],
      cons: ['צריך שינויים'],
    },
    {
      id: 'opt-2',
      label: 'שמלה B — בוטיק שרה',
      pros: ['מושלמת כמות שהיא', 'קנייה מיידית'],
      cons: ['יקרה יותר'],
    },
  ],
  finalDecision: undefined,
};

// ─── Mock reminder data (for task-4) ────────────────────────────────────────

const MOCK_REMINDER_TASK_4: TaskReminder = {
  taskId: 'task-4',
  reminderDate: '25/09/2026',
  reminderTime: '10:00',
  notifyEnabled: true,
  linkedTaskId: 'task-2',
  linkedTaskName: 'תשלום מקדמה לאולם',
  linkedEventName: 'חתונה',
  dependencyTaskId: undefined,
  dependencyTaskName: undefined,
};

// ─── In-memory mutable state for mutations ────────────────────────────────────

let mutableVendors: Vendor[] = [...MOCK_VENDORS_TASK_1];
let mutablePayment: TaskPayment = { ...MOCK_PAYMENT_TASK_2 };
let mutableTasks: Task[] = [...BASE_TASKS];
let mutableDecision: TaskDecision = {
  ...MOCK_DECISION_TASK_3,
  options: MOCK_DECISION_TASK_3.options.map((o) => ({ ...o, pros: [...o.pros], cons: [...o.cons] })),
};
let mutableReminder: TaskReminder = { ...MOCK_REMINDER_TASK_4 };

// ─── Mock resolvers ───────────────────────────────────────────────────────────

export async function fetchTasksMock(): Promise<TasksPayload> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_TASKS_LOADING__) {
    return new Promise(() => { /* never resolves */ });
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 250));

  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_TASKS_EMPTY__) {
    return {
      tasks: [],
      events: MOCK_TASK_EVENTS,
      coupleNames: 'יובל ושיר',
    };
  }

  return {
    tasks: mutableTasks,
    events: MOCK_TASK_EVENTS,
    coupleNames: 'יובל ושיר',
  };
}

export async function fetchTaskByIdMock(taskId: string): Promise<Task | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  return mutableTasks.find((t) => t.id === taskId) ?? null;
}

export async function addTaskMock(data: {
  name: string;
  type: Task['type'];
  category: string;
  priority: Task['priority'];
  eventId: string;
  dueDate?: string;
  responsible?: string;
  notes?: string;
}): Promise<Task> {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));

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

export async function updateTaskMock(
  taskId: string,
  updates: Partial<Pick<Task, 'status' | 'notes' | 'selectedVendorId'>>,
): Promise<Task> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  const idx = mutableTasks.findIndex((t) => t.id === taskId);
  if (idx < 0) throw new Error('Task not found');
  mutableTasks = mutableTasks.map((t) =>
    t.id === taskId ? { ...t, ...updates } : t,
  );
  return mutableTasks[idx];
}

// ─── Vendor mock resolvers ────────────────────────────────────────────────────

export async function fetchVendorsMock(_taskId: string): Promise<Vendor[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  return [...mutableVendors];
}

export async function addVendorMock(
  _taskId: string,
  data: Omit<Vendor, 'id' | 'status'>,
): Promise<Vendor> {
  await new Promise<void>((resolve) => setTimeout(resolve, 250));
  const newVendor: Vendor = {
    id: `v-${Date.now()}`,
    status: 'considering',
    ...data,
  };
  mutableVendors = [...mutableVendors, newVendor];
  return newVendor;
}

export async function selectVendorMock(
  taskId: string,
  vendorId: string,
): Promise<{ task: Task; vendors: Vendor[] }> {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));

  // Mark selected vendor, reject all others
  mutableVendors = mutableVendors.map((v) => ({
    ...v,
    status: v.id === vendorId ? 'selected' : 'rejected',
  }));

  // Update task status to inProgress
  const idx = mutableTasks.findIndex((t) => t.id === taskId);
  if (idx >= 0) {
    mutableTasks = mutableTasks.map((t) =>
      t.id === taskId ? { ...t, status: 'inProgress', selectedVendorId: vendorId } : t,
    );
  }

  const task = mutableTasks.find((t) => t.id === taskId)!;
  return { task, vendors: [...mutableVendors] };
}

// ─── Payment mock resolvers ───────────────────────────────────────────────────

export async function fetchPaymentMock(_taskId: string): Promise<TaskPayment> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));

  // Playwright seam override
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_TASK_PAYMENT_STATE__) {
    const state = window.__PLAYWRIGHT_TASK_PAYMENT_STATE__;
    if (state === 'advance_paid') {
      return { ...mutablePayment, advancePaid: true, paymentStatus: 'advance_paid' };
    }
    if (state === 'fully_paid') {
      return { ...mutablePayment, advancePaid: true, balancePaid: true, paymentStatus: 'fully_paid' };
    }
  }

  return { ...mutablePayment };
}

export async function updatePaymentMock(
  taskId: string,
  updates: Partial<Pick<TaskPayment, 'advancePaid' | 'advanceAmount' | 'balancePaid' | 'balanceAmount'>>,
): Promise<{ payment: TaskPayment; task: Task }> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_PAYMENT_FAIL__) {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    throw new Error('Payment update failed');
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 250));

  mutablePayment = { ...mutablePayment, ...updates };

  // Determine payment status
  if (mutablePayment.advancePaid && mutablePayment.balancePaid) {
    mutablePayment.paymentStatus = 'fully_paid';
  } else if (mutablePayment.advancePaid) {
    mutablePayment.paymentStatus = 'advance_paid';
  } else {
    mutablePayment.paymentStatus = 'unpaid';
  }

  // Auto-close task on full payment
  let task = mutableTasks.find((t) => t.id === taskId)!;
  if (mutablePayment.paymentStatus === 'fully_paid') {
    mutableTasks = mutableTasks.map((t) =>
      t.id === taskId ? { ...t, status: 'closed' } : t,
    );
    task = { ...task, status: 'closed' };
  }

  return { payment: { ...mutablePayment }, task };
}

// ─── Decision mock resolvers ──────────────────────────────────────────────────

export async function fetchDecisionMock(_taskId: string): Promise<TaskDecision> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  return {
    ...mutableDecision,
    options: mutableDecision.options.map((o) => ({ ...o, pros: [...o.pros], cons: [...o.cons] })),
  };
}

export async function updateDecisionMock(
  _taskId: string,
  updates: Partial<TaskDecision>,
): Promise<TaskDecision> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  mutableDecision = { ...mutableDecision, ...updates };
  return { ...mutableDecision };
}

// ─── Reminder mock resolvers ──────────────────────────────────────────────────

export async function fetchReminderMock(_taskId: string): Promise<TaskReminder> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  return { ...mutableReminder };
}

export async function updateReminderMock(
  _taskId: string,
  updates: Partial<TaskReminder>,
): Promise<TaskReminder> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  mutableReminder = { ...mutableReminder, ...updates };
  return { ...mutableReminder };
}

/** Reset all mutable state — for use in Playwright beforeEach if needed */
export function resetTasksMockState() {
  mutableVendors = [...MOCK_VENDORS_TASK_1];
  mutablePayment = { ...MOCK_PAYMENT_TASK_2 };
  mutableTasks = [...BASE_TASKS];
  mutableDecision = {
    ...MOCK_DECISION_TASK_3,
    options: MOCK_DECISION_TASK_3.options.map((o) => ({ ...o, pros: [...o.pros], cons: [...o.cons] })),
  };
  mutableReminder = { ...MOCK_REMINDER_TASK_4 };
}
