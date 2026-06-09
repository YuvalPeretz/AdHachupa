export type RsvpStatus = 'confirmed' | 'pending' | 'cancelled';
export type TaskStatus = 'notStarted' | 'inProgress' | 'closed';
export type VendorStatus = 'selected' | 'considering' | 'rejected';
export type TaskPriority = 'essential' | 'logistic' | 'aesthetic' | 'personal';
export type BillingUnit = 'per_item' | 'per_guest' | 'per_hour';
export type EventType = 'wedding' | 'henna' | 'party' | 'shabbat' | 'mikveh' | 'kabbalat_panim';

export interface WeddingEvent {
  id: string;
  type: EventType;
  label: string;
  date?: string;
  venue?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  rsvpStatus: RsvpStatus;
  invitedBy: string;
  plusOnes: number;
  tableNo?: string;
  eventIds: string[];
}

export interface Vendor {
  id: string;
  name: string;
  status: VendorStatus;
  taskId?: string;
  priceMin?: number;
  priceMax?: number;
  email?: string;
  phone?: string;
  rating?: number;
  advancePaid?: number;
  balanceDue?: number;
  lastPaymentDate?: string;
  notes?: string;
}

export interface Task {
  id: string;
  name: string;
  type: 'vendor' | 'payment' | 'decision' | 'reminder';
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  responsible?: string;
  dueDate?: string;
  isOverdue?: boolean;
  eventId: string;
  notes?: string;
  selectedVendorId?: string;
}

export interface TaskPayment {
  taskId: string;
  estimatedCost: number;
  actualCost?: number;
  billingUnit: BillingUnit;
  advancePaid: boolean;
  advanceAmount?: number;
  balancePaid: boolean;
  balanceAmount?: number;
  deadline?: string;
  paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid';
  linkedVendorId?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  pros: string[];
  cons: string[];
}

export interface TaskDecision {
  taskId: string;
  options: DecisionOption[];
  finalDecision?: string;
}

export interface TaskReminder {
  taskId: string;
  reminderDate?: string;
  reminderTime?: string;
  notifyEnabled: boolean;
  linkedTaskId?: string;
  linkedTaskName?: string;
  linkedEventName?: string;
  dependencyTaskId?: string;
  dependencyTaskName?: string;
}

export interface TasksPayload {
  tasks: Task[];
  events: WeddingEvent[];
  coupleNames: string;
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

export interface Budget {
  totalBudget: number;
  totalSpent: number;
  giftIncome: number;
  breakeven: number;
  categories: BudgetCategory[];
}

export interface TaskProgress {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface DashboardPayload {
  upcomingEvent: (WeddingEvent & { daysLeft: number }) | null;
  taskProgress: TaskProgress;
  upcomingTasks: Task[];
  budget: Budget;
  vendors: Vendor[];
  otherEvents: (WeddingEvent & { daysLeft: number })[];
  coupleNames: string;
}
