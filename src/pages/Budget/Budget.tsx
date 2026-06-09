import { useState, useMemo } from "react";
import { Button, Flex, InputNumber, Modal, Progress, Skeleton } from "antd";
import { MdHome, MdPeople, MdCheckroom, MdSpa, MdCategory } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectAddSheetOpen, closeAddSheet } from "../../store/uiSlice";
import { useBudget, useAddExpense, useUpdateTotalBudget } from "./useBudget";
import { AddExpenseSheet } from "../../features/budget/AddExpenseSheet/AddExpenseSheet";
import type { BudgetCategory } from "../../types";
import styles from "./Budget.module.scss";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString("he-IL")}`;
}

function getCategoryIcon(name: string): React.ReactNode {
  if (name.includes("אולם")) return <MdHome size={18} color="#C9A97A" />;
  if (name.includes("ספקים")) return <MdPeople size={18} color="#C9A97A" />;
  if (name.includes("ביגוד")) return <MdCheckroom size={18} color="#C9A97A" />;
  if (name.includes("טיפוח")) return <MdSpa size={18} color="#C9A97A" />;
  return <MdCategory size={18} color="#C9A97A" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BreakevenChipProps {
  value: number;
  labelPositive: string;
  labelNegative: string;
  testId?: string;
  positiveAttr?: string;
}

function BreakevenChip({ value, labelPositive, labelNegative, testId, positiveAttr }: BreakevenChipProps) {
  const isPositive = value >= 0;
  return (
    <span
      className={`${styles.breakevenChip} ${isPositive ? styles.breakevenChipPositive : styles.breakevenChipNegative}`}
      data-testid={testId}
      data-breakeven-positive={positiveAttr !== undefined ? positiveAttr : isPositive ? "true" : "false"}
    >
      {isPositive ? `${labelPositive} ${formatCurrency(value)}` : `${labelNegative} ${formatCurrency(Math.abs(value))}`}
    </span>
  );
}

interface CategoryRowProps {
  category: BudgetCategory;
}

function CategoryRow({ category }: CategoryRowProps) {
  const { t } = useTranslation("budget");
  const percent = category.allocated > 0 ? Math.min(Math.round((category.spent / category.allocated) * 100), 100) : 0;

  return (
    <Flex align="flex-start" gap={10} data-testid={`category-row-${category.name}`}>
      <div className={styles.categoryIcon} aria-hidden="true">
        {getCategoryIcon(category.name)}
      </div>
      <div className={styles.categoryInfo}>
        <Flex justify="space-between" align="baseline" className={styles.categoryHeader}>
          <span className={styles.categoryName}>{category.name}</span>
          <span className={styles.categoryAmounts}>
            {t("categories.spent", { spent: category.spent.toLocaleString("he-IL") })} {t("categories.of")}{" "}
            {t("categories.budget", { budget: category.allocated.toLocaleString("he-IL") })}
          </span>
        </Flex>
        {/* Progress bar — fills right-to-left in RTL context */}
        <div data-testid={`category-progress-${category.name}`}>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#C9A97A"
            railColor="rgba(45,45,45,0.08)"
            strokeLinecap="round"
            size="small"
          />
        </div>
      </div>
    </Flex>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BudgetSkeleton() {
  return (
    <div className={styles.page} data-testid="budget-skeleton">
      <div className={styles.skeletonSection}>
        <Flex gap={8}>
          {[1, 2].map((i) => (
            <Skeleton.Button key={i} active style={{ width: 140, borderRadius: 9999, height: 32 }} />
          ))}
        </Flex>
      </div>
      <Flex justify="center" className={styles.skeletonSection}>
        <Skeleton.Avatar active style={{ width: 180, height: 180 }} />
      </Flex>
      <div className={styles.skeletonSection}>
        <Skeleton.Button active block style={{ height: 110, borderRadius: 16 }} />
      </div>
      <Flex vertical gap={10} className={styles.skeletonSection}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Button key={i} active block style={{ height: 48, borderRadius: 12 }} />
        ))}
      </Flex>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Budget() {
  const { t } = useTranslation("budget");
  const dispatch = useAppDispatch();
  const addSheetOpen = useAppSelector(selectAddSheetOpen);
  const { data, isLoading } = useBudget();
  const addExpenseMutation = useAddExpense();
  const updateBudgetMutation = useUpdateTotalBudget();
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState<number | null>(null);

  const firstEvent = data?.events[0];
  const daysLeft = useMemo(() => {
    if (!firstEvent?.date) return 0;
    const [d, m, y] = firstEvent.date.split("/").map(Number);
    return Math.max(0, Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [firstEvent?.date]);

  if (isLoading || !data) {
    return <BudgetSkeleton />;
  }

  const { budget, rsvpBreakeven, confirmedGuestCount, events } = data;
  const { totalBudget, totalSpent, giftIncome, breakeven, categories } = budget;

  const percentSpent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  return (
    <div className={styles.page} data-testid="budget-page">
      {/* ── Context chips ───────────────────────────────── */}
      <div className={styles.contextChips} data-testid="context-chips">
        <span className={styles.contextChip} data-testid="confirmed-guests-chip">
          {t("contextChips.confirmedGuests", { count: confirmedGuestCount })}
        </span>
        {firstEvent && (
          <span className={styles.contextChip} data-testid="days-left-chip">
            {t("contextChips.daysLeft", { days: daysLeft })}
          </span>
        )}
      </div>

      {/* ── Donut ring hero ─────────────────────────────── */}
      <Flex vertical align="center" className={styles.donutSection} data-testid="donut-section">
        <Progress
          type="circle"
          percent={percentSpent}
          size={180}
          strokeColor="#C9A97A"
          railColor="rgba(45,45,45,0.08)"
          strokeLinecap="round"
          format={() => (
            <Flex vertical align="center" className={styles.donutCenter} data-testid="donut-center">
              <span className={styles.donutPercent} data-testid="donut-percent">
                {t("donut.percentSpent", { percent: percentSpent })}
              </span>
              <span className={styles.donutLabel}>{t("donut.ofBudget")}</span>
            </Flex>
          )}
        />

        <button
          type="button"
          className={styles.editBudgetLink}
          data-testid="edit-budget-link"
          onClick={() => {
            setEditValue(totalBudget);
            setEditOpen(true);
          }}
        >
          {t("donut.editBudget")}
        </button>
      </Flex>

      {/* ── Gifts & breakeven card ──────────────────────── */}
      <div className={styles.card} data-testid="gifts-breakeven-card">
        <div className={styles.cardTitle}>{t("giftsCard.title")}</div>

        {/* Gift income row */}
        <Flex justify="space-between" align="center" className={styles.metaRow}>
          <span className={styles.metaLabel}>{t("giftsCard.giftIncome")}</span>
          <span className={styles.metaValue} data-testid="gift-income-value">
            {formatCurrency(giftIncome)}
          </span>
        </Flex>

        {/* Breakeven row */}
        <Flex justify="space-between" align="center" className={styles.metaRow}>
          <span className={styles.metaLabel}>{t("giftsCard.breakeven")}</span>
          <BreakevenChip
            value={breakeven}
            labelPositive={t("giftsCard.surplus")}
            labelNegative={t("giftsCard.deficit")}
            testId="breakeven-chip"
            positiveAttr={breakeven >= 0 ? "true" : "false"}
          />
        </Flex>

        {/* RSVP breakeven row */}
        <Flex justify="space-between" align="center" className={styles.metaRow}>
          <span className={styles.metaLabel}>
            {rsvpBreakeven >= 0 ? t("giftsCard.rsvpSurplus") : t("giftsCard.rsvpDeficit")}
          </span>
          <BreakevenChip
            value={rsvpBreakeven}
            labelPositive={t("giftsCard.surplus")}
            labelNegative={t("giftsCard.deficit")}
            testId="rsvp-breakeven-chip"
          />
        </Flex>
      </div>

      {/* ── Category breakdown ──────────────────────────── */}
      <p className={styles.sectionTitle}>{t("categories.title")}</p>
      <div className={styles.card}>
        <Flex vertical gap={12} className={styles.categoryList} data-testid="category-list">
          {categories.map((cat) => (
            <CategoryRow key={cat.name} category={cat} />
          ))}
        </Flex>
      </div>

      {/* ── Add Expense bottom sheet ─────────────────────── */}
      <AddExpenseSheet
        open={addSheetOpen === 'expense'}
        onClose={() => dispatch(closeAddSheet())}
        events={events}
        guestCount={confirmedGuestCount}
        onSave={(data) => {
          addExpenseMutation.mutate(data, {
            onSuccess: () => dispatch(closeAddSheet()),
          });
        }}
        isSaving={addExpenseMutation.isPending}
      />

      {/* ── Edit total budget modal ──────────────────────── */}
      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        title={t("donut.editBudget")}
        footer={null}
        centered
        width={360}
        destroyOnHidden
      >
        <Flex vertical gap={16} style={{ paddingBlockStart: 8 }}>
          <InputNumber
            value={editValue}
            onChange={setEditValue}
            min={0}
            step={1000}
            prefix="₪"
            style={{ width: '100%', direction: 'rtl' }}
            formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(v) => Number((v ?? '').replace(/,/g, '')) as unknown as 0}
            data-testid="edit-budget-input"
          />
          <Flex gap={8} justify="flex-end">
            <Button onClick={() => setEditOpen(false)}>{t("editBudgetModal.cancel")}</Button>
            <Button
              type="primary"
              loading={updateBudgetMutation.isPending}
              onClick={() => {
                if (editValue == null) return;
                updateBudgetMutation.mutate(editValue, {
                  onSuccess: () => setEditOpen(false),
                });
              }}
              data-testid="edit-budget-save"
            >
              {t("editBudgetModal.save")}
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </div>
  );
}
