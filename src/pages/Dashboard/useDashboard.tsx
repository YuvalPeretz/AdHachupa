/**
 * useDashboard — assembles the dashboard payload from five parallel Firestore reads.
 *
 * Five parallel React Query reads are issued (Q1–Q5 per the sequence diagram) and
 * merged into DashboardPayload on the client. Delta refresh kicks in after staleTime.
 */

import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import type { DashboardPayload, WeddingEvent, Task, Vendor, Budget } from '../../types';
import type { TaskDoc, VendorDoc, BudgetDoc, EventDoc } from '../../lib/firestore/types';
import { docToTask, docToVendor, docToEvent, daysUntil, parseDisplayDate } from '../../lib/firestore/converters';
import { db } from '../../lib/firebase';
import { useAppSelector } from '../../store';
import { selectCoupleId } from '../../features/auth/authSlice';

declare global {
  interface Window {
    __PLAYWRIGHT_DASHBOARD_BREAKEVEN_NEGATIVE__?: boolean;
    __PLAYWRIGHT_DASHBOARD_LOADING__?: boolean;
    __PLAYWRIGHT_DASHBOARD_STALE_MS__?: number;
  }
}

// Seam data matching dashboardMock.ts constants
const SEAM_PAYLOAD_POSITIVE: DashboardPayload = {
  coupleNames: 'יובל ושיר',
  upcomingEvent: { id: 'evt-wedding', type: 'wedding', label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום, תל אביב', daysLeft: 161 },
  taskProgress: { completed: 12, inProgress: 8, notStarted: 28, total: 48 },
  upcomingTasks: [
    { id: 't1', name: 'בחירת אולם', type: 'vendor', category: 'אולם ותפעול', priority: 'essential', status: 'inProgress', eventId: 'evt-wedding', isOverdue: false, dueDate: '01/09/2026' },
    { id: 't2', name: 'צלם סטילס', type: 'vendor', category: 'ספקים', priority: 'essential', status: 'notStarted', eventId: 'evt-wedding', isOverdue: false, dueDate: '01/10/2026' },
    { id: 't3', name: 'שמלת כלה', type: 'vendor', category: 'ביגוד', priority: 'essential', status: 'notStarted', eventId: 'evt-wedding', isOverdue: true, dueDate: '01/07/2026' },
  ],
  budget: { totalBudget: 100_000, totalSpent: 48_500, giftIncome: 22_000, breakeven: 26_500, categories: [{ name: 'אולם ותפעול', allocated: 40_000, spent: 22_000 }, { name: 'ספקים', allocated: 30_000, spent: 15_500 }, { name: 'ביגוד', allocated: 15_000, spent: 8_000 }, { name: 'אחר', allocated: 15_000, spent: 3_000 }] },
  vendors: [
    { id: 'v1', name: 'DJ Alexander', status: 'selected', priceMin: 4_000, priceMax: 5_000 },
    { id: 'v2', name: 'סטודיו לימור', status: 'selected', priceMin: 6_000, priceMax: 8_000 },
    { id: 'v3', name: 'פרחים מאת רות', status: 'selected', priceMin: 3_000, priceMax: 4_000 },
    { id: 'v4', name: 'הקייטרינג של דוד', status: 'selected', priceMin: 25_000, priceMax: 30_000 },
    { id: 'v5', name: 'מאפה חנה', status: 'selected', priceMin: 2_000, priceMax: 2_500 },
    { id: 'v6', name: 'להקת גן עדן', status: 'selected', priceMin: 7_000, priceMax: 9_000 },
  ],
  otherEvents: [
    { id: 'evt-henna', type: 'henna', label: 'חינה', date: '07/11/2026', venue: 'בית הכלה', daysLeft: 154 },
    { id: 'evt-shabbat', type: 'shabbat', label: 'שבת חתן', date: '08/11/2026', venue: 'בית הכנסת', daysLeft: 155 },
  ],
};

const SEAM_PAYLOAD_NEGATIVE: DashboardPayload = {
  ...SEAM_PAYLOAD_POSITIVE,
  budget: { ...SEAM_PAYLOAD_POSITIVE.budget, totalSpent: 85_000, giftIncome: 22_000, breakeven: -7_500 },
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function getStaleTime(): number {
  if (typeof window !== 'undefined' && typeof window.__PLAYWRIGHT_DASHBOARD_STALE_MS__ === 'number') {
    return window.__PLAYWRIGHT_DASHBOARD_STALE_MS__;
  }
  return FIVE_MINUTES_MS;
}

function inPlaywright(): boolean {
  return typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window;
}

async function fetchDashboard(coupleId: string): Promise<DashboardPayload> {
  if (typeof window !== 'undefined') {
    if (window.__PLAYWRIGHT_DASHBOARD_LOADING__) return new Promise(() => {});
    if (window.__PLAYWRIGHT_DASHBOARD_BREAKEVEN_NEGATIVE__) return SEAM_PAYLOAD_NEGATIVE;
    if (inPlaywright()) return SEAM_PAYLOAD_POSITIVE;
  }

  // Q1+Q5 — All events ordered by date
  const eventsSnap = await getDocs(
    query(collection(db, 'events'), where('coupleId', '==', coupleId), orderBy('date')),
  );
  const allEvents: WeddingEvent[] = eventsSnap.docs.map((d) =>
    docToEvent(d.id, d.data() as unknown as EventDoc),
  );

  const nextEvent = allEvents[0] ?? null;
  const otherEvents = allEvents.slice(1);

  function toEventWithDays(ev: WeddingEvent): WeddingEvent & { daysLeft: number } {
    const parsed = ev.date ? parseDisplayDate(ev.date) : null;
    return { ...ev, daysLeft: parsed ? daysUntil(parsed) : 0 };
  }

  // Q2 — Task progress (requires nextEvent id)
  const tasksQuery = nextEvent
    ? query(collection(db, 'tasks'), where('coupleId', '==', coupleId), where('eventId', '==', nextEvent.id))
    : null;

  // Q3 — Budget, Q4 — Selected vendors
  const [tasksSnap, budgetSnap, vendorsSnap] = await Promise.all([
    tasksQuery ? getDocs(tasksQuery) : Promise.resolve(null),
    getDoc(doc(db, 'budget', coupleId)),
    getDocs(
      query(
        collection(db, 'vendors'),
        where('coupleId', '==', coupleId),
        where('status', '==', 'selected'),
        orderBy('updatedAt', 'desc'),
        limit(6),
      ),
    ),
  ]);

  // Task progress
  const tasks: Task[] = tasksSnap?.docs.map((d) => docToTask(d.id, d.data() as unknown as TaskDoc)) ?? [];
  const completed = tasks.filter((t) => t.status === 'closed').length;
  const inProgress = tasks.filter((t) => t.status === 'inProgress').length;
  const notStarted = tasks.filter((t) => t.status === 'notStarted').length;

  // Upcoming tasks: in-progress first, then not-started; cap at 5
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'closed')
    .sort((a, b) => {
      if (a.status === 'inProgress' && b.status !== 'inProgress') return -1;
      if (b.status === 'inProgress' && a.status !== 'inProgress') return 1;
      if (a.isOverdue && !b.isOverdue) return -1;
      if (b.isOverdue && !a.isOverdue) return 1;
      return 0;
    })
    .slice(0, 5);

  // Budget
  let budget: Budget = { totalBudget: 0, totalSpent: 0, giftIncome: 0, breakeven: 0, categories: [] };
  if (budgetSnap.exists()) {
    const bd = budgetSnap.data() as BudgetDoc;
    budget = { totalBudget: bd.totalBudget, totalSpent: bd.totalSpent, giftIncome: bd.giftIncome, breakeven: bd.breakeven, categories: bd.categories ?? [] };
  }

  // Vendors
  const vendors: Vendor[] = vendorsSnap.docs.map((d) => docToVendor(d.id, d.data() as unknown as VendorDoc));

  // Couple names
  let coupleNames = '';
  try {
    const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
    if (coupleSnap.exists()) {
      const data = coupleSnap.data() as { name1?: string; name2?: string };
      coupleNames = [data.name1, data.name2].filter(Boolean).join(' ו');
    }
  } catch { coupleNames = ''; }

  return {
    coupleNames,
    upcomingEvent: nextEvent ? toEventWithDays(nextEvent) : null,
    taskProgress: { completed, inProgress, notStarted, total: tasks.length },
    upcomingTasks,
    budget,
    vendors,
    otherEvents: otherEvents.map(toEventWithDays),
  };
}

export interface UseDashboardResult {
  data: DashboardPayload | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  dataUpdatedAt: number;
}

export function useDashboard(): UseDashboardResult {
  const staleTime = getStaleTime();
  const coupleId = useAppSelector(selectCoupleId) ?? '';

  const { data, isLoading, isFetching, isError, dataUpdatedAt } = useQuery<DashboardPayload>({
    queryKey: ['dashboard', coupleId],
    queryFn: () => fetchDashboard(coupleId),
    staleTime,
    refetchOnWindowFocus: true,
    enabled: Boolean(coupleId),
  });

  return { data, isLoading, isFetching, isError, dataUpdatedAt };
}
