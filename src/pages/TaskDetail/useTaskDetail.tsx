/**
 * useTaskDetail — data hook for all Task Detail variants.
 *
 * Loads the base task by id. Each variant (Vendor/Payment/Decision/Reminder)
 * also imports its own sub-data directly using the task id.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '../../types';
import { useAppSelector } from '../../store';
import { selectCoupleId } from '../../features/auth/authSlice';
import { fetchTaskById, updateTask as updateTaskFs } from '../../lib/firestore/tasks';

export interface UseTaskDetailResult {
  task: Task | null | undefined;
  isLoading: boolean;
  updateTask: (updates: Partial<Pick<Task, 'status' | 'notes' | 'selectedVendorId'>>) => void;
  isSaving: boolean;
}

export function useTaskDetail(taskId: string): UseTaskDetailResult {
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectCoupleId) ?? '';

  const { data: task, isLoading } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (updates: Partial<Pick<Task, 'status' | 'notes' | 'selectedVendorId'>>) =>
      updateTaskFs(taskId, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', coupleId] });
    },
  });

  function updateTask(updates: Partial<Pick<Task, 'status' | 'notes' | 'selectedVendorId'>>) {
    mutation.mutate(updates);
  }

  return {
    task,
    isLoading,
    updateTask,
    isSaving: mutation.isPending,
  };
}
