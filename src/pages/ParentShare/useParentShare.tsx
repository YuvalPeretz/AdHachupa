/**
 * useParentShare — data-loading + mutations for the Parent Share web page.
 *
 * Validates the share token, then allows the parent to add guests to a session
 * list and finally submit the whole list back to the couple.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { Guest } from '../../types';
import { fetchShareToken, addShareGuest, submitShareList } from '../../lib/firestore/guests';
import type { ShareTokenPayload } from '../../lib/firestore/types';

export interface UseParentShareResult {
  tokenData: ShareTokenPayload | undefined;
  isLoading: boolean;
  sessionGuests: Guest[];
  isSubmitted: boolean;
  addForm: { name: string; phone: string; plusOnes: number };
  setAddForm: React.Dispatch<React.SetStateAction<{ name: string; phone: string; plusOnes: number }>>;
  handleAddGuest: () => void;
  handleSubmit: () => void;
  isAdding: boolean;
  isSubmitting: boolean;
  submitError: boolean;
}

const EMPTY_FORM = { name: '', phone: '', plusOnes: 0 };

export function useParentShare(token: string): UseParentShareResult {
  const [sessionGuests, setSessionGuests] = useState<Guest[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);

  const { data: tokenData, isLoading } = useQuery<ShareTokenPayload>({
    queryKey: ['shareToken', token],
    queryFn: () => fetchShareToken(token),
    staleTime: Infinity, // token validity doesn't change during session
  });

  const addMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string; plusOnes: number }) =>
      addShareGuest(token, data),
    onSuccess: (guest) => {
      setSessionGuests((prev) => [...prev, guest]);
      setAddForm(EMPTY_FORM);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => submitShareList(token),
    onSuccess: () => {
      setIsSubmitted(true);
      setSubmitError(false);
    },
    onError: () => {
      setSubmitError(true);
    },
  });

  function handleAddGuest() {
    if (!addForm.name.trim()) return;
    addMutation.mutate({
      name: addForm.name.trim(),
      phone: addForm.phone.trim() || undefined,
      plusOnes: addForm.plusOnes,
    });
  }

  function handleSubmit() {
    submitMutation.mutate();
  }

  return {
    tokenData,
    isLoading,
    sessionGuests,
    isSubmitted,
    addForm,
    setAddForm,
    handleAddGuest,
    handleSubmit,
    isAdding: addMutation.isPending,
    isSubmitting: submitMutation.isPending,
    submitError,
  };
}
