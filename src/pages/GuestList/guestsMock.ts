/**
 * Mock data for the Guest management pages.
 *
 * Provides fake async resolvers used by useGuestList, useGuestDetail,
 * and DuplicateReview while no live Firebase backend is wired up.
 *
 * Playwright seams (window.__PLAYWRIGHT_GUESTS_*__) allow tests to
 * control: duplicate presence, loading state, RSVP mutation failure,
 * and parent-share token validity. Seams are only ever set by
 * Playwright's addInitScript — never in production code.
 */
import type { Guest, WeddingEvent } from '../../types';

// ─── Global Playwright seam declarations ────────────────────────────────────

declare global {
  interface Window {
    /** When true, guest list response includes duplicate pairs. */
    __PLAYWRIGHT_GUESTS_WITH_DUPLICATES__?: boolean;
    /** When true, guest list query never resolves (loading skeleton test). */
    __PLAYWRIGHT_GUESTS_LOADING__?: boolean;
    /** When true, RSVP mutation rejects with a network error. */
    __PLAYWRIGHT_RSVP_FAIL__?: boolean;
    /** When set, AddGuestSheet save returns duplicates[] for this guest name. */
    __PLAYWRIGHT_ADD_GUEST_DUPLICATE_NAME__?: string;
    /** When true, parent-share token is invalid / expired. */
    __PLAYWRIGHT_SHARE_TOKEN_INVALID__?: boolean;
    /** When true, parent-share submit call fails. */
    __PLAYWRIGHT_SHARE_SUBMIT_FAIL__?: boolean;
  }
}

// ─── Shared mock events (referenced by mock guests) ─────────────────────────

export const MOCK_EVENTS: WeddingEvent[] = [
  { id: 'evt-wedding', type: 'wedding', label: 'חתונה', date: '14/11/2026', venue: 'אולם הגן הקסום' },
  { id: 'evt-henna', type: 'henna', label: 'חינה', date: '07/11/2026', venue: 'בית הכלה' },
  { id: 'evt-shabbat', type: 'shabbat', label: 'שבת חתן', date: '08/11/2026', venue: 'בית הכנסת' },
];

// ─── Mock guest data ─────────────────────────────────────────────────────────

const BASE_GUESTS: Guest[] = [
  // Couple's side
  {
    id: 'g1',
    name: 'דנה כהן',
    phone: '050-1111111',
    rsvpStatus: 'confirmed',
    invitedBy: 'הזוג',
    plusOnes: 1,
    tableNo: '3',
    eventIds: ['evt-wedding', 'evt-henna'],
  },
  {
    id: 'g2',
    name: 'אבי לוי',
    phone: '050-2222222',
    rsvpStatus: 'pending',
    invitedBy: 'הזוג',
    plusOnes: 0,
    eventIds: ['evt-wedding'],
  },
  // Bride parents' side
  {
    id: 'g3',
    name: 'רחל מזרחי',
    phone: '052-3333333',
    rsvpStatus: 'confirmed',
    invitedBy: 'הורי הכלה',
    plusOnes: 2,
    tableNo: '7',
    eventIds: ['evt-wedding'],
  },
  {
    id: 'g4',
    name: 'יעקב ברוך',
    phone: '054-4444444',
    rsvpStatus: 'cancelled',
    invitedBy: 'הורי הכלה',
    plusOnes: 0,
    eventIds: ['evt-wedding'],
  },
  // Groom parents' side
  {
    id: 'g5',
    name: 'שרה פרץ',
    phone: '058-5555555',
    rsvpStatus: 'confirmed',
    invitedBy: 'הורי החתן',
    plusOnes: 1,
    tableNo: '12',
    eventIds: ['evt-wedding', 'evt-shabbat'],
  },
  {
    id: 'g6',
    name: 'משה גולן',
    phone: '050-6666666',
    rsvpStatus: 'pending',
    invitedBy: 'הורי החתן',
    plusOnes: 3,
    eventIds: ['evt-wedding'],
  },
];

/** Duplicate pair added when seam is active */
const DUPLICATE_GUESTS: Guest[] = [
  {
    id: 'g7',
    name: 'יעל לוי',
    phone: '050-7777777',
    rsvpStatus: 'pending',
    invitedBy: 'הזוג',
    plusOnes: 0,
    eventIds: ['evt-wedding'],
  },
  {
    id: 'g8',
    name: 'יעל לוי-כהן',
    phone: '050-7777777', // same phone → duplicate
    rsvpStatus: 'pending',
    invitedBy: 'הורי הכלה',
    plusOnes: 0,
    eventIds: ['evt-wedding'],
  },
];

export interface GuestsPayload {
  guests: Guest[];
  events: WeddingEvent[];
  coupleNames: string;
  duplicateCount: number;
}

export interface DuplicatePair {
  id: string;
  guests: [Guest, Guest];
  similarity: number;
  reason: 'phone_match' | 'name_match';
}

export interface DuplicatesPayload {
  pairs: DuplicatePair[];
}

// ─── Mock resolvers ───────────────────────────────────────────────────────────

export async function fetchGuestsMock(): Promise<GuestsPayload> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_GUESTS_LOADING__) {
    return new Promise(() => { /* never resolves */ });
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 250));

  const withDuplicates =
    typeof window !== 'undefined' && window.__PLAYWRIGHT_GUESTS_WITH_DUPLICATES__;

  const guests = withDuplicates
    ? [...BASE_GUESTS, ...DUPLICATE_GUESTS]
    : BASE_GUESTS;

  return {
    guests,
    events: MOCK_EVENTS,
    coupleNames: 'יובל ושיר',
    duplicateCount: withDuplicates ? 1 : 0,
  };
}

export async function fetchGuestByIdMock(guestId: string): Promise<Guest | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  const all = [...BASE_GUESTS, ...DUPLICATE_GUESTS];
  return all.find((g) => g.id === guestId) ?? null;
}

export async function updateRsvpMock(
  guestId: string,
  rsvpStatus: import('../../types').RsvpStatus,
): Promise<Guest> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_RSVP_FAIL__) {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    throw new Error('Network error');
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  const guest = BASE_GUESTS.find((g) => g.id === guestId);
  if (!guest) throw new Error('Guest not found');
  return { ...guest, rsvpStatus };
}

export async function saveGuestDetailMock(
  guestId: string,
  updates: Partial<Guest>,
): Promise<Guest> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  const guest = BASE_GUESTS.find((g) => g.id === guestId);
  if (!guest) throw new Error('Guest not found');
  return { ...guest, ...updates };
}

export interface AddGuestPayload {
  guest: Guest;
  duplicates: Array<{ id: string; name: string; phone?: string; similarity: number }>;
}

export async function addGuestMock(data: {
  name: string;
  phone?: string;
  email?: string;
  plusOnes: number;
  invitedBy: string;
  eventIds: string[];
}): Promise<AddGuestPayload> {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));

  const newGuest: Guest = {
    id: `g-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    rsvpStatus: 'pending',
    invitedBy: data.invitedBy,
    plusOnes: data.plusOnes,
    eventIds: data.eventIds,
  };

  // Seam: force duplicate detection for specific name
  const duplicateTriggerName =
    typeof window !== 'undefined' ? window.__PLAYWRIGHT_ADD_GUEST_DUPLICATE_NAME__ : undefined;

  if (duplicateTriggerName && data.name.includes(duplicateTriggerName)) {
    return {
      guest: newGuest,
      duplicates: [
        { id: 'g1', name: 'דנה כהן', phone: '050-1111111', similarity: 0.88 },
      ],
    };
  }

  return { guest: newGuest, duplicates: [] };
}

export async function fetchDuplicatesMock(): Promise<DuplicatesPayload> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  return {
    pairs: [
      {
        id: 'pair-1',
        guests: [DUPLICATE_GUESTS[0], DUPLICATE_GUESTS[1]],
        similarity: 1.0,
        reason: 'phone_match',
      },
    ],
  };
}

export async function mergeGuestsMock(
  primaryId: string,
  _secondaryId: string,
): Promise<Guest> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  const primary = [...BASE_GUESTS, ...DUPLICATE_GUESTS].find((g) => g.id === primaryId);
  if (!primary) throw new Error('Primary guest not found');
  return primary;
}

export async function dismissDuplicateMock(
  _guestId1: string,
  _guestId2: string,
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
}

// ─── Parent Share mock ────────────────────────────────────────────────────────

export interface ShareTokenPayload {
  valid: boolean;
  coupleNames: string;
  label: string;
  eventIds: string[];
}

export async function fetchShareTokenMock(_token: string): Promise<ShareTokenPayload> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_SHARE_TOKEN_INVALID__) {
    return { valid: false, coupleNames: '', label: '', eventIds: [] };
  }

  return {
    valid: true,
    coupleNames: 'יובל ושיר',
    label: 'הורי עדי',
    eventIds: ['evt-wedding'],
  };
}

export async function addShareGuestMock(
  _token: string,
  data: { name: string; phone?: string; plusOnes: number },
): Promise<Guest> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  return {
    id: `share-g-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    rsvpStatus: 'pending',
    invitedBy: 'הורי עדי',
    plusOnes: data.plusOnes,
    eventIds: ['evt-wedding'],
  };
}

export async function submitShareListMock(_token: string): Promise<void> {
  if (typeof window !== 'undefined' && window.__PLAYWRIGHT_SHARE_SUBMIT_FAIL__) {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    throw new Error('Submit failed');
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
}
