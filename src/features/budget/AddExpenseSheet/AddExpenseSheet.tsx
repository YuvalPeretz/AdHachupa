import { useState } from 'react';
import { Button, Flex, Input, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../../../components/BottomSheet/BottomSheet';
import { BillingUnitSelector } from '../../../components/BillingUnitSelector/BillingUnitSelector';
import type { BillingUnit, WeddingEvent } from '../../../types';
import type { AddExpenseInput } from '../../../lib/firestore/types';
import styles from './AddExpenseSheet.module.scss';

const CATEGORIES = [
  'אולם ותפעול',
  'ספקים',
  'ביגוד',
  'טיפוח',
  'הוצאות נוספות',
  'אחר',
];

type ExpensePriority = 'required' | 'optional';

interface FormState {
  name: string;
  category: string;
  estimatedCost: number | null;
  actualCost: number | null;
  billingUnit: BillingUnit;
  unitPrice: number | null;
  priority: ExpensePriority;
  eventId: string;
  responsible: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  category: 'ספקים',
  estimatedCost: null,
  actualCost: null,
  billingUnit: 'per_item',
  unitPrice: null,
  priority: 'required',
  eventId: '',
  responsible: '',
  notes: '',
};

interface AddExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  events: WeddingEvent[];
  guestCount: number;
  onSave: (data: AddExpenseInput) => void;
  isSaving: boolean;
}

export function AddExpenseSheet({
  open,
  onClose,
  events,
  guestCount,
  onSave,
  isSaving,
}: AddExpenseSheetProps) {
  const { t } = useTranslation('budget');
  const { t: tCommon } = useTranslation('common');

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function handleClose() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function handleSave() {
    if (!form.name.trim()) return;

    const estimatedCost = computeTotal() ?? form.estimatedCost ?? 0;

    onSave({
      name: form.name.trim(),
      category: form.category,
      estimatedCost,
      actualCost: form.actualCost ?? undefined,
      billingUnit: form.billingUnit,
      unitPrice: form.unitPrice ?? undefined,
      guestCount: form.billingUnit === 'per_guest' ? guestCount : undefined,
      priority: form.priority,
      eventId: form.eventId || (events[0]?.id ?? ''),
      responsible: form.responsible || undefined,
      notes: form.notes.trim() || undefined,
    });
  }

  /** Live total calculation for per_guest billing */
  function computeTotal(): number | null {
    if (form.billingUnit === 'per_guest' && form.unitPrice !== null) {
      return form.unitPrice * guestCount;
    }
    return null;
  }

  const liveTotal = computeTotal();
  const isSaveDisabled = !form.name.trim() || isSaving;

  const eventOptions = events.map((e) => ({ value: e.id, label: e.label }));

  const priorityOptions: { key: ExpensePriority; label: string }[] = [
    { key: 'required', label: t('addExpense.priorityRequired') },
    { key: 'optional', label: t('addExpense.priorityOptional') },
  ];

  const responsibleOptions: { key: string; label: string }[] = [
    { key: 'partner1', label: tCommon('priority.essential').charAt(0) !== '' ? 'כלה' : 'כלה' },
    { key: 'partner2', label: 'חתן' },
    { key: 'both', label: 'שניהם' },
  ];

  return (
    <BottomSheet open={open} onClose={handleClose} title={t('addExpense.title')}>
      <Flex vertical gap={16} className={styles.form} data-testid="add-expense-form">

        {/* ── Item name (required) ──────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.nameLabel')}</div>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={t('addExpense.namePlaceholder')}
            size="large"
            data-testid="expense-name-input"
          />
        </div>

        {/* ── Category chips ─────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.categoryLabel')}</div>
          <div className={styles.chipRow} data-testid="expense-category-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip}${form.category === cat ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, category: cat }))}
                data-testid={`expense-category-${cat}`}
                aria-pressed={form.category === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Billing unit selector (shared component) ─────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.billingUnitLabel')}</div>
          <BillingUnitSelector
            value={form.billingUnit}
            onChange={(unit) => setForm((p) => ({ ...p, billingUnit: unit, unitPrice: null }))}
          />
        </div>

        {/* ── Unit price + live hint (for per_guest / per_hour) */}
        {(form.billingUnit === 'per_guest' || form.billingUnit === 'per_hour') && (
          <div>
            <div className={styles.fieldLabel}>{t('addExpense.estimatedCostLabel')}</div>
            <InputNumber
              value={form.unitPrice}
              onChange={(val) => setForm((p) => ({ ...p, unitPrice: val }))}
              placeholder="₪"
              prefix="₪"
              min={0}
              style={{ width: '100%' }}
              size="large"
              data-testid="expense-unit-price"
            />
            {/* Live total hint */}
            {form.billingUnit === 'per_guest' && form.unitPrice !== null && (
              <div className={styles.perGuestHint} data-testid="per-guest-hint">
                {t('addExpense.perGuestHint', {
                  unit: form.unitPrice.toLocaleString('he-IL'),
                  count: guestCount,
                  total: (form.unitPrice * guestCount).toLocaleString('he-IL'),
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Estimated cost (for per_item) ─────────────────── */}
        {form.billingUnit === 'per_item' && (
          <div>
            <div className={styles.fieldLabel}>{t('addExpense.estimatedCostLabel')}</div>
            <InputNumber
              value={form.estimatedCost}
              onChange={(val) => setForm((p) => ({ ...p, estimatedCost: val }))}
              placeholder="₪"
              prefix="₪"
              min={0}
              style={{ width: '100%' }}
              size="large"
              data-testid="expense-estimated-cost"
            />
          </div>
        )}

        {/* ── Actual cost ───────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.actualCostLabel')}</div>
          <InputNumber
            value={form.actualCost}
            onChange={(val) => setForm((p) => ({ ...p, actualCost: val }))}
            placeholder="₪"
            prefix="₪"
            min={0}
            style={{ width: '100%' }}
            size="large"
            data-testid="expense-actual-cost"
          />
        </div>

        {/* ── Priority chips ─────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.priorityLabel')}</div>
          <div className={styles.chipRow} data-testid="expense-priority-chips">
            {priorityOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.chip}${form.priority === key ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, priority: key }))}
                data-testid={`expense-priority-${key}`}
                aria-pressed={form.priority === key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Event selector ────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.eventLabel')}</div>
          <Select
            value={form.eventId || (events[0]?.id ?? '')}
            onChange={(val) => setForm((p) => ({ ...p, eventId: val }))}
            options={eventOptions}
            style={{ width: '100%' }}
            size="large"
            data-testid="expense-event-select"
          />
        </div>

        {/* ── Responsible (avatar chips) ────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.responsibleLabel')}</div>
          <div className={styles.avatarChips} data-testid="expense-responsible-chips">
            {responsibleOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.avatarChip}${form.responsible === key ? ` ${styles.avatarChipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, responsible: p.responsible === key ? '' : key }))}
                data-testid={`expense-responsible-${key}`}
                aria-pressed={form.responsible === key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notes ────────────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addExpense.notesLabel')}</div>
          <Input.TextArea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder={t('addExpense.notesPlaceholder')}
            rows={3}
            data-testid="expense-notes"
          />
        </div>

        {/* ── Live total summary (when per_guest is set) ───── */}
        {liveTotal !== null && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(201, 169, 122, 0.10)',
              borderRadius: 12,
              fontFamily: 'Rubik',
              fontSize: 15,
              fontWeight: 600,
              color: '#C9A97A',
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
            data-testid="expense-total-display"
          >
            ₪{liveTotal.toLocaleString('he-IL')}
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────── */}
        <Flex vertical gap={10} className={styles.actions}>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={isSaveDisabled}
            loading={isSaving}
            style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
            data-testid="expense-save-btn"
          >
            {t('addExpense.saveButton')}
          </Button>
          <Button onClick={handleClose} data-testid="expense-cancel-btn">
            {t('addExpense.cancelButton')}
          </Button>
        </Flex>
      </Flex>
    </BottomSheet>
  );
}
