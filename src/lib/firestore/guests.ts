/**
 * Firestore data functions for the guests domain.
 *
 * Each function checks Playwright seams before any Firebase call.
 * The catch-all seam (`'__PLAYWRIGHT_AUTH_MOCK__' in window`) ensures
 * that any Playwright test gets mock data without touching real Firebase.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import type { Guest, RsvpStatus, EventType, WeddingEvent } from '../../types';
import type { GuestDoc, GuestsPayload, AddGuestInput, AddGuestPayload, DuplicatePair, DuplicatesPayload, ShareTokenPayload } from './types';
import { docToGuest } from './converters';
import { getEvents } from './events';

// ─── Playwright seam declarations ─────────────────────────────────────────────

declare global {
  interface Window {
    __PLAYWRIGHT_GUESTS_WITH_DUPLICATES__?: boolean;
    __PLAYWRIGHT_GUESTS_LOADING__?: boolean;
    __PLAYWRIGHT_RSVP_FAIL__?: boolean;
    __PLAYWRIGHT_ADD_GUEST_DUPLICATE_NAME__?: string;
    __PLAYWRIGHT_SHARE_TOKEN_INVALID__?: boolean;
    __PLAYWRIGHT_SHARE_SUBMIT_FAIL__?: boolean;
  }
}

// ─── Seam data (mirrors guestsMock.ts constants) ─────────────────────────────

const SEAM_EVENTS: WeddingEvent[] = [
  { id: 'evt-wedding', type: 'wedding' as EventType, label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום' },
  { id: 'evt-henna', type: 'henna' as EventType, label: 'חינה', date: '07/11/2026', venue: 'בית הכלה' },
  { id: 'evt-shabbat', type: 'shabbat' as EventType, label: 'שבת חתן', date: '08/11/2026', venue: 'בית הכנסת' },
];

const BASE_GUESTS: Guest[] = [
  { id: 'g1', name: 'דנה כהן', phone: '050-1111111', rsvpStatus: 'confirmed', invitedBy: 'הזוג', plusOnes: 1, tableNo: '3', eventIds: ['evt-wedding', 'evt-henna'] },
  { id: 'g2', name: 'אבי לוי', phone: '050-2222222', rsvpStatus: 'pending', invitedBy: 'הזוג', plusOnes: 0, eventIds: ['evt-wedding'] },
  { id: 'g3', name: 'רחל מזרחי', phone: '052-3333333', rsvpStatus: 'confirmed', invitedBy: 'הורי הכלה', plusOnes: 2, tableNo: '7', eventIds: ['evt-wedding'] },
  { id: 'g4', name: 'יעקב ברוך', phone: '054-4444444', rsvpStatus: 'cancelled', invitedBy: 'הורי הכלה', plusOnes: 0, eventIds: ['evt-wedding'] },
  { id: 'g5', name: 'שרה פרץ', phone: '058-5555555', rsvpStatus: 'confirmed', invitedBy: 'הורי החתן', plusOnes: 1, tableNo: '12', eventIds: ['evt-wedding', 'evt-shabbat'] },
  { id: 'g6', name: 'משה גולן', phone: '050-6666666', rsvpStatus: 'pending', invitedBy: 'הורי החתן', plusOnes: 3, eventIds: ['evt-wedding'] },
];

const DUPLICATE_GUESTS: Guest[] = [
  { id: 'g7', name: 'יעל לוי', phone: '050-7777777', rsvpStatus: 'pending', invitedBy: 'הזוג', plusOnes: 0, eventIds: ['evt-wedding'] },
  { id: 'g8', name: 'יעל לוי-כהן', phone: '050-7777777', rsvpStatus: 'pending', invitedBy: 'הורי הכלה', plusOnes: 0, eventIds: ['evt-wedding'] },
];

// Mutable seam state — reset on each page load (module scope)
let mutableGuests: Guest[] = [...BASE_GUESTS];

function inPlaywright(): boolean {
  return typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window;
}

/** True for any Playwright context, including unauthenticated pages like ParentShare. */
function inAnyPlaywright(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__PLAYWRIGHT_AUTH_MOCK__' in window ||
      (typeof navigator !== 'undefined' && navigator.webdriver))
  );
}

// Exported for useGuestDetail to use as the events list
export const GUESTS_SEAM_EVENTS: WeddingEvent[] = SEAM_EVENTS;

// ─── Firestore functions ──────────────────────────────────────────────────────

export async function fetchGuests(coupleId: string): Promise<GuestsPayload> {
  if (typeof window !== 'undefined') {
    if (window.__PLAYWRIGHT_GUESTS_LOADING__) return new Promise(() => {});
    if (window.__PLAYWRIGHT_GUESTS_WITH_DUPLICATES__) {
      return {
        guests: [...BASE_GUESTS, ...DUPLICATE_GUESTS],
        events: SEAM_EVENTS,
        coupleNames: 'יובל ושיר',
        duplicateCount: 1,
      };
    }
    if (inPlaywright()) {
      return {
        guests: mutableGuests,
        events: SEAM_EVENTS,
        coupleNames: 'יובל ושיר',
        duplicateCount: 0,
      };
    }
  }

  const [guestsSnap, events, dismissedSnap] = await Promise.all([
    getDocs(query(collection(db, 'guests'), where('coupleId', '==', coupleId))),
    getEvents(coupleId),
    getDocs(query(collection(db, 'dismissedDuplicates'), where('coupleId', '==', coupleId))),
  ]);

  const guests = guestsSnap.docs.map((d) => docToGuest(d.id, d.data() as unknown as GuestDoc));

  let duplicateCount = 0;
  try {
    const detectFn = httpsCallable<{ coupleId: string }, { count: number }>(functions, 'detectDuplicates');
    const result = await detectFn({ coupleId });
    duplicateCount = result.data.count;
  } catch {
    // Non-critical
  }

  void dismissedSnap;

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

  return { guests, events, coupleNames, duplicateCount };
}

export async function fetchGuestById(guestId: string): Promise<Guest | null> {
  if (inPlaywright()) {
    return [...BASE_GUESTS, ...DUPLICATE_GUESTS].find((g) => g.id === guestId) ?? null;
  }

  const snap = await getDoc(doc(db, 'guests', guestId));
  if (!snap.exists()) return null;
  return docToGuest(snap.id, snap.data() as unknown as GuestDoc);
}

export async function addGuest(coupleId: string, data: AddGuestInput): Promise<AddGuestPayload> {
  if (typeof window !== 'undefined') {
    const triggerName = window.__PLAYWRIGHT_ADD_GUEST_DUPLICATE_NAME__;
    if (triggerName && data.name.includes(triggerName)) {
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        rsvpStatus: 'pending',
        invitedBy: data.invitedBy,
        plusOnes: data.plusOnes,
        eventIds: data.eventIds,
      };
      if (inPlaywright()) mutableGuests = [...mutableGuests, newGuest];
      return {
        guest: newGuest,
        duplicates: [{ id: 'g1', name: 'דנה כהן', phone: '050-1111111', similarity: 0.88 }],
      };
    }
    if (inPlaywright()) {
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        rsvpStatus: 'pending',
        invitedBy: data.invitedBy,
        plusOnes: data.plusOnes,
        eventIds: data.eventIds,
      };
      mutableGuests = [...mutableGuests, newGuest];
      return { guest: newGuest, duplicates: [] };
    }
  }

  const guestData = {
    coupleId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    rsvpStatus: 'pending' as RsvpStatus,
    invitedBy: data.invitedBy,
    plusOnes: data.plusOnes,
    eventIds: data.eventIds,
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'guests'), guestData);
  const guest: Guest = {
    id: ref.id,
    name: data.name,
    phone: data.phone,
    rsvpStatus: 'pending',
    invitedBy: data.invitedBy,
    plusOnes: data.plusOnes,
    eventIds: data.eventIds,
  };

  let duplicates: AddGuestPayload['duplicates'] = [];
  try {
    const detectFn = httpsCallable<{ coupleId: string; guestId: string }, { duplicates: AddGuestPayload['duplicates'] }>(
      functions, 'detectDuplicates',
    );
    const result = await detectFn({ coupleId, guestId: ref.id });
    duplicates = result.data.duplicates ?? [];
  } catch {
    // Non-critical
  }

  return { guest, duplicates };
}

export async function updateGuest(
  guestId: string,
  updates: Partial<Omit<GuestDoc, 'coupleId' | 'updatedAt'>>,
): Promise<Guest> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_RSVP_FAIL__) {
    await new Promise<void>((r) => setTimeout(r, 200));
    throw new Error('Network error');
  }

  if (inPlaywright()) {
    mutableGuests = mutableGuests.map((g) =>
      g.id === guestId ? { ...g, ...(updates as Partial<Guest>) } : g,
    );
    const guest = mutableGuests.find((g) => g.id === guestId);
    if (!guest) throw new Error('Guest not found');
    return guest;
  }

  await updateDoc(doc(db, 'guests', guestId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  const snap = await getDoc(doc(db, 'guests', guestId));
  return docToGuest(snap.id, snap.data() as unknown as GuestDoc);
}

export async function deleteGuest(guestId: string): Promise<void> {
  if (inPlaywright()) {
    mutableGuests = mutableGuests.filter((g) => g.id !== guestId);
    return;
  }
  await deleteDoc(doc(db, 'guests', guestId));
}

// ─── Duplicate management ─────────────────────────────────────────────────────

export async function fetchDuplicates(coupleId: string): Promise<DuplicatesPayload> {
  if (inPlaywright()) {
    return {
      pairs: [
        {
          id: 'pair-1',
          guests: [DUPLICATE_GUESTS[0], DUPLICATE_GUESTS[1]] as [Guest, Guest],
          similarity: 1.0,
          reason: 'phone_match',
        } as DuplicatePair,
      ],
    };
  }

  const detectFn = httpsCallable<{ coupleId: string }, DuplicatesPayload>(
    functions, 'detectDuplicates',
  );
  const result = await detectFn({ coupleId });
  return result.data;
}

export async function mergeGuests(
  coupleId: string,
  primaryId: string,
  secondaryId: string,
): Promise<Guest> {
  if (inPlaywright()) {
    const primary = [...BASE_GUESTS, ...DUPLICATE_GUESTS].find((g) => g.id === primaryId);
    mutableGuests = mutableGuests.filter((g) => g.id !== secondaryId);
    return primary ?? DUPLICATE_GUESTS[0];
  }

  const mergeFn = httpsCallable<{ coupleId: string; primaryId: string; secondaryId: string }, { guest: Guest }>(
    functions, 'mergeGuests',
  );
  const result = await mergeFn({ coupleId, primaryId, secondaryId });
  return result.data.guest;
}

export async function dismissDuplicate(
  coupleId: string,
  guestId1: string,
  guestId2: string,
): Promise<void> {
  if (inPlaywright()) return;

  await addDoc(collection(db, 'dismissedDuplicates'), {
    coupleId,
    guestId1,
    guestId2,
    createdAt: serverTimestamp(),
  });
}

// ─── Parent Share ──────────────────────────────────────────────────────────────

export async function fetchShareToken(token: string): Promise<ShareTokenPayload> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_SHARE_TOKEN_INVALID__) {
    return { valid: false, coupleNames: '', label: '', eventIds: [] };
  }
  if (inAnyPlaywright()) {
    return { valid: true, coupleNames: 'יובל ושיר', label: 'הורי עדי', eventIds: ['evt-wedding'] };
  }

  const snap = await getDoc(doc(db, 'shareTokens', token));
  if (!snap.exists()) return { valid: false, coupleNames: '', label: '', eventIds: [] };

  const data = snap.data() as { expiresAt?: { toMillis?: () => number }; submitted?: boolean; coupleNames?: string; label?: string; eventIds?: string[] };

  const now = Date.now();
  const expiresAt = data.expiresAt?.toMillis?.() ?? 0;
  if (expiresAt < now || data.submitted) {
    return { valid: false, coupleNames: '', label: '', eventIds: [] };
  }

  return {
    valid: true,
    coupleNames: data.coupleNames ?? '',
    label: data.label ?? '',
    eventIds: data.eventIds ?? [],
  };
}

export async function addShareGuest(
  token: string,
  guestData: { name: string; phone?: string; plusOnes: number },
): Promise<Guest> {
  if (inAnyPlaywright()) {
    return {
      id: `share-g-${Date.now()}`,
      name: guestData.name,
      phone: guestData.phone,
      rsvpStatus: 'pending',
      invitedBy: 'הורי עדי',
      plusOnes: guestData.plusOnes,
      eventIds: ['evt-wedding'],
    };
  }

  const submitFn = httpsCallable<
    { token: string; name: string; phone?: string; plusOnes: number },
    { guest: Guest }
  >(functions, 'addShareGuest');
  const result = await submitFn({ token, ...guestData });
  return result.data.guest;
}

export async function submitShareList(token: string): Promise<void> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_SHARE_SUBMIT_FAIL__) {
    await new Promise<void>((r) => setTimeout(r, 200));
    throw new Error('Submit failed');
  }
  if (inAnyPlaywright()) return;

  const submitFn = httpsCallable<{ token: string }, void>(functions, 'submitShareList');
  await submitFn({ token });
}
