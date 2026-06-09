/**
 * useTaskList — data-loading hook for the Task List page.
 *
 * Loads the full task list + events from the mock resolver.
 * In production these would be parallel Firestore reads wrapped in React Query.
 *
 * Exposes:
 *  - tasks grouped by category (filtered by active event and category chip)
 *  - activeEventId + setter (synced with Redux global tab state)
 *  - activeCategory + setter
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectCoupleId } from '../../features/auth/authSlice';
import { setActiveTaskEventId, setActiveTaskCategory } from '../../store/tasksSlice';
import type { Task, TasksPayload } from '../../types';
import { fetchTasks, addTask } from '../../lib/firestore/tasks';

export const CATEGORY_FILTERS = [
  'all',
  'ספקים',
  'תשלומים',
  'ביגוד',
  'טיפוח',
  'לוגיסטיקה',
  'שונות',
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export interface TaskSection {
  key: string;
  label: string;
  tasks: Task[];
}

export interface UseTaskListResult {
  data: TasksPayload | undefined;
  isLoading: boolean;
  sections: TaskSection[];
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  activeCategory: string;
  setActiveCategoryFilter: (cat: string) => void;
  addTaskMutation: ReturnType<typeof useMutation<Task, Error, Parameters<typeof addTask>[1]>>;
}

function groupTasksByCategory(tasks: Task[]): TaskSection[] {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!map.has(task.category)) map.set(task.category, []);
    map.get(task.category)!.push(task);
  }
  const sections: TaskSection[] = [];
  for (const [cat, catTasks] of map.entries()) {
    sections.push({ key: cat, label: cat, tasks: catTasks });
  }
  return sections;
}

export function useTaskList(): UseTaskListResult {
  const dispatch = useAppDispatch();
  const coupleId = useAppSelector(selectCoupleId) ?? '';
  const activeEventId = useAppSelector((s) => s.tasks.activeEventId);
  const activeCategory = useAppSelector((s) => s.tasks.activeCategory);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<TasksPayload>({
    queryKey: ['tasks', coupleId],
    queryFn: () => fetchTasks(coupleId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(coupleId),
  });

  function setActiveEventId(id: string) {
    dispatch(setActiveTaskEventId(id));
  }

  function setActiveCategoryFilter(cat: string) {
    dispatch(setActiveTaskCategory(cat));
  }

  const resolvedActiveEventId = useMemo(() => {
    if (!data) return activeEventId;
    if (!activeEventId && data.events.length > 0) return data.events[0].id;
    return activeEventId;
  }, [data, activeEventId]);

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    let tasks = resolvedActiveEventId
      ? data.tasks.filter((t) => t.eventId === resolvedActiveEventId)
      : data.tasks;
    if (activeCategory !== 'all') {
      tasks = tasks.filter((t) => t.category === activeCategory);
    }
    return tasks;
  }, [data, resolvedActiveEventId, activeCategory]);

  const sections = useMemo(() => groupTasksByCategory(filteredTasks), [filteredTasks]);

  const addTaskMutation = useMutation<Task, Error, Parameters<typeof addTask>[1]>({
    mutationFn: (data) => addTask(coupleId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks', coupleId] });
    },
  });

  return {
    data,
    isLoading,
    sections,
    activeEventId: resolvedActiveEventId,
    setActiveEventId,
    activeCategory,
    setActiveCategoryFilter,
    addTaskMutation,
  };
}
