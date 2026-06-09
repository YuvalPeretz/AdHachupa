/**
 * useGuestList — data-loading hook for the Guest List page.
 *
 * Loads the full guest list + events + duplicate count from the mock resolver.
 * In production these would be parallel Firestore reads wrapped in React Query.
 *
 * Exposes:
 *  - guests grouped by invitedBy section
 *  - stats (total / confirmed / cancelled / pending)
 *  - activeEventId + setter (synced with Redux global tab state)
 *  - duplicateCount for DuplicateBanner conditional rendering
 */
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';
import { setActiveGuestEventId } from '../../store/guestsSlice';
import type { Guest } from '../../types';
import { fetchGuests } from '../../lib/firestore/guests';
import type { GuestsPayload } from '../../lib/firestore/types';

export interface GuestSection {
  key: string;
  label: string;
  guests: Guest[];
}

export interface GuestStats {
  total: number;
  confirmed: number;
  cancelled: number;
  pending: number;
}

export interface UseGuestListResult {
  data: GuestsPayload | undefined;
  isLoading: boolean;
  sections: GuestSection[];
  stats: GuestStats;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  duplicateCount: number;
}

function computeStats(guests: Guest[]): GuestStats {
  const total = guests.reduce((acc, g) => acc + 1 + g.plusOnes, 0);
  const confirmed = guests
    .filter((g) => g.rsvpStatus === 'confirmed')
    .reduce((acc, g) => acc + 1 + g.plusOnes, 0);
  const cancelled = guests
    .filter((g) => g.rsvpStatus === 'cancelled')
    .reduce((acc, g) => acc + 1 + g.plusOnes, 0);
  const pending = guests
    .filter((g) => g.rsvpStatus === 'pending')
    .reduce((acc, g) => acc + 1 + g.plusOnes, 0);
  return { total, confirmed, cancelled, pending };
}

function groupGuests(guests: Guest[]): GuestSection[] {
  const order = ['הזוג', 'הורי הכלה', 'הורי החתן'];
  const map = new Map<string, Guest[]>();

  for (const guest of guests) {
    const key = guest.invitedBy;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(guest);
  }

  // Ordered sections first, then any extras
  const sections: GuestSection[] = [];
  for (const label of order) {
    if (map.has(label)) {
      sections.push({ key: label, label, guests: map.get(label)! });
    }
  }
  for (const [label, gs] of map.entries()) {
    if (!order.includes(label)) {
      sections.push({ key: label, label, guests: gs });
    }
  }
  return sections;
}

export function useGuestList(): UseGuestListResult {
  const dispatch = useAppDispatch();
  const coupleId = useAppSelector(selectAuthUid) ?? '';
  const activeEventId = useAppSelector((s) => s.guests.activeEventId);

  const { data, isLoading } = useQuery<GuestsPayload>({
    queryKey: ['guests', coupleId],
    queryFn: () => fetchGuests(coupleId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(coupleId),
  });

  function setActiveEventId(id: string) {
    dispatch(setActiveGuestEventId(id));
  }

  // Resolve the active event ID — default to first event once data loads
  const resolvedActiveEventId = useMemo(() => {
    if (!data) return activeEventId;
    if (!activeEventId && data.events.length > 0) return data.events[0].id;
    return activeEventId;
  }, [data, activeEventId]);

  // Filter guests by active event
  const filteredGuests = useMemo(() => {
    if (!data) return [];
    if (!resolvedActiveEventId) return data.guests;
    return data.guests.filter((g) => g.eventIds.includes(resolvedActiveEventId));
  }, [data, resolvedActiveEventId]);

  const sections = useMemo(() => groupGuests(filteredGuests), [filteredGuests]);
  const stats = useMemo(() => computeStats(filteredGuests), [filteredGuests]);

  return {
    data,
    isLoading,
    sections,
    stats,
    activeEventId: resolvedActiveEventId,
    setActiveEventId,
    duplicateCount: data?.duplicateCount ?? 0,
  };
}
