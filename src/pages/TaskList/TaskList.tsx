import { useNavigate } from "react-router";
import { Flex, Skeleton } from "antd";
import { MdAssignment } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { EventPillTab } from "../../components/EventPillTab/EventPillTab";
import { TaskRow } from "../../components/TaskRow/TaskRow";
import { AddTaskSheet } from "../../features/tasks/AddTaskSheet/AddTaskSheet";
import type { Task } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectAddSheetOpen, closeAddSheet } from "../../store/uiSlice";
import { useTaskList, CATEGORY_FILTERS } from "./useTaskList";
import styles from "./TaskList.module.scss";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TaskListSkeleton() {
  return (
    <Flex vertical className={styles.page} data-testid="task-list-skeleton">
      <div className={styles.skeletonSection}>
        <Skeleton.Button active block style={{ height: 36, borderRadius: 9999 }} />
      </div>
      <div className={styles.skeletonSection}>
        <Skeleton.Button active block style={{ height: 36, borderRadius: 9999 }} />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton.Button active block style={{ height: 68, borderRadius: 16 }} />
        </div>
      ))}
    </Flex>
  );
}

// ─── Category Chips ───────────────────────────────────────────────────────────

interface CategoryChipsProps {
  activeCategory: string;
  onSelect: (cat: string) => void;
}

function CategoryChips({ activeCategory, onSelect }: CategoryChipsProps) {
  const { t } = useTranslation("tasks");

  const labelMap: Record<string, string> = {
    all: t("categories.all"),
    ספקים: t("categories.vendors"),
    תשלומים: t("categories.payments"),
    ביגוד: t("categories.clothing"),
    טיפוח: t("categories.grooming"),
    לוגיסטיקה: t("categories.logistics"),
    שונות: t("categories.other"),
  };

  return (
    <div className={styles.categoryScroll} data-testid="category-scroll">
      <Flex gap={8} className={styles.categoryChips}>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.chip}${activeCategory === cat ? ` ${styles.chipActive}` : ""}`}
            onClick={() => onSelect(cat)}
            data-testid={`category-chip-${cat}`}
            aria-pressed={activeCategory === cat}
          >
            {labelMap[cat] ?? cat}
          </button>
        ))}
      </Flex>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function TaskListEmpty() {
  const { t } = useTranslation("tasks");
  return (
    <Flex vertical align="center" justify="center" gap={16} className={styles.emptyState} data-testid="task-list-empty">
      <MdAssignment size={56} color="#D4C4B0" />
      <p>{t("emptyStateAll")}</p>
    </Flex>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TaskList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const addSheetOpen = useAppSelector(selectAddSheetOpen);
  const {
    data,
    isLoading,
    sections,
    activeEventId,
    setActiveEventId,
    activeCategory,
    setActiveCategoryFilter,
    addTaskMutation,
  } = useTaskList();

  if (isLoading || !data) {
    return <TaskListSkeleton />;
  }

  function handleTaskClick(task: Task) {
    navigate(`/tasks/${task.id}`);
  }

  const isEmpty = sections.length === 0;

  return (
    <Flex vertical className={styles.page} data-testid="task-list-page">
      {/* ── Event pill tabs ─────────────────────────────── */}
      <div className={styles.eventPillWrapper}>
        <EventPillTab events={data.events} activeEventId={activeEventId} onChange={setActiveEventId} />
      </div>

      {/* ── Category filter chips ────────────────────────── */}
      <CategoryChips activeCategory={activeCategory} onSelect={setActiveCategoryFilter} />

      {/* ── Task list grouped by category ───────────────── */}
      <div className={styles.sections} data-testid="task-sections">
        {isEmpty ? (
          <TaskListEmpty />
        ) : (
          sections.map((section) => (
            <div key={section.key} data-testid={`task-section-${section.key}`}>
              <div className={styles.sectionHeader} data-testid="task-section-header">
                {section.label}
              </div>
              <Flex vertical gap={8}>
                {section.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onClick={handleTaskClick} />
                ))}
              </Flex>
            </div>
          ))
        )}
      </div>

      {/* ── Add Task bottom sheet ────────────────────────── */}
      <AddTaskSheet
        open={addSheetOpen === 'task'}
        onClose={() => dispatch(closeAddSheet())}
        events={data.events}
        onSave={(taskData) => {
          addTaskMutation.mutate(taskData, {
            onSuccess: () => dispatch(closeAddSheet()),
          });
        }}
        isSaving={addTaskMutation.isPending}
      />
    </Flex>
  );
}
