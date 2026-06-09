/**
 * useGuestDetail — data-loading + mutations for the Guest Detail page.
 *
 * Loads a single guest by ID (from mock), exposes RSVP and full-save mutations.
 * RSVP uses optimistic update → rolls back on failure with a toast.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Guest, RsvpStatus, WeddingEvent } from '../../types';
import { fetchGuestById, updateGuest, GUESTS_SEAM_EVENTS } from '../../lib/firestore/guests';
import { useAppSelector } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';

export interface UseGuestDetailResult {
  guest: Guest | null | undefined;
  events: WeddingEvent[];
  isLoading: boolean;
  localGuest: Guest | null;
  setLocalGuest: React.Dispatch<React.SetStateAction<Guest | null>>;
  handleRsvpChange: (status: RsvpStatus) => void;
  handleSave: () => void;
  isSaving: boolean;
  /** Render this in the component for toast messages to appear */
  toastContextHolder: ReactNode;
}

export function useGuestDetail(guestId: string): UseGuestDetailResult {
  const { t } = useTranslation('guests');
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectAuthUid) ?? '';
  const [messageApi, contextHolder] = message.useMessage();

  const { data: guest, isLoading } = useQuery<Guest | null>({
    queryKey: ['guest', guestId],
    queryFn: () => fetchGuestById(guestId),
    staleTime: 2 * 60 * 1000,
  });

  // Local working copy — synced from query data
  const [localGuest, setLocalGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (guest) setLocalGuest(guest);
  }, [guest]);

  // ── RSVP optimistic mutation ──────────────────────────
  const rsvpMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RsvpStatus }) =>
      updateGuest(id, { rsvpStatus: status }),
    onMutate: async ({ status }) => {
      // Snapshot previous value
      const previous = queryClient.getQueryData<Guest>(['guest', guestId]);
      // Optimistically update local state
      setLocalGuest((prev) => (prev ? { ...prev, rsvpStatus: status } : prev));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back
      if (context?.previous) {
        setLocalGuest(context.previous);
      }
      void messageApi.error(t('rsvp.saveError'));
    },
    onSuccess: (updatedGuest) => {
      queryClient.setQueryData(['guest', guestId], updatedGuest);
      void queryClient.invalidateQueries({ queryKey: ['guests', coupleId] });
    },
  });

  function handleRsvpChange(status: RsvpStatus) {
    if (!localGuest) return;
    rsvpMutation.mutate({ id: localGuest.id, status });
  }

  // ── Full save mutation ────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (updates: Partial<Guest>) =>
      updateGuest(guestId, updates as Parameters<typeof updateGuest>[1]),
    onSuccess: (updated) => {
      queryClient.setQueryData(['guest', guestId], updated);
      void queryClient.invalidateQueries({ queryKey: ['guests', coupleId] });
    },
  });

  function handleSave() {
    if (!localGuest) return;
    saveMutation.mutate(localGuest);
  }

  return {
    guest,
    events: GUESTS_SEAM_EVENTS as WeddingEvent[],
    isLoading,
    localGuest,
    setLocalGuest,
    handleRsvpChange,
    handleSave,
    isSaving: saveMutation.isPending,
    toastContextHolder: contextHolder,
  };
}
