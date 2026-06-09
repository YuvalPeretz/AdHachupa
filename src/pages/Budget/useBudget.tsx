import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';
import { fetchBudget, addExpense, updateTotalBudget } from '../../lib/firestore/budget';
import type { AddExpenseInput } from '../../lib/firestore/types';

export function useBudget() {
  const coupleId = useAppSelector(selectAuthUid) ?? '';

  return useQuery({
    queryKey: ['budget', coupleId],
    queryFn: () => fetchBudget(coupleId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(coupleId),
  });
}

export function useUpdateTotalBudget() {
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectAuthUid) ?? '';

  return useMutation({
    mutationFn: (totalBudget: number) => updateTotalBudget(coupleId, totalBudget),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['budget', coupleId] });
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectAuthUid) ?? '';

  return useMutation({
    mutationFn: (data: AddExpenseInput) => addExpense(coupleId, data),
    onSuccess: () => {
      // Skip delay in Playwright; in production, wait for the CF trigger to settle
      const delay = (typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window) ? 0 : 800;
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['budget', coupleId] });
      }, delay);
    },
  });
}
