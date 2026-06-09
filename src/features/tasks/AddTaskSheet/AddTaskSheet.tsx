import { useState } from 'react';
import { Button, Flex, Input, Select, DatePicker } from 'antd';
import {
  MdStorefront,
  MdPayment,
  MdHelpOutline,
  MdNotificationsNone,
} from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../../../components/BottomSheet/BottomSheet';
import type { Task, WeddingEvent } from '../../../types';
import styles from './AddTaskSheet.module.scss';

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  events: WeddingEvent[];
  onSave: (data: {
    name: string;
    type: Task['type'];
    category: string;
    priority: Task['priority'];
    eventId: string;
    dueDate?: string;
    responsible?: string;
    notes?: string;
  }) => void;
  isSaving: boolean;
}

interface FormState {
  name: string;
  type: Task['type'];
  category: string;
  priority: Task['priority'];
  eventId: string;
  responsible: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  type: 'vendor',
  category: 'ספקים',
  priority: 'essential',
  eventId: '',
  responsible: '',
  notes: '',
};

const CATEGORIES = ['ספקים', 'תשלומים', 'ביגוד', 'טיפוח', 'לוגיסטיקה', 'שונות'];

export function AddTaskSheet({ open, onClose, events, onSave, isSaving }: AddTaskSheetProps) {
  const { t } = useTranslation('tasks');
  const { t: tCommon } = useTranslation('common');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function handleClose() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      type: form.type,
      category: form.category,
      priority: form.priority,
      eventId: form.eventId || (events[0]?.id ?? ''),
      responsible: form.responsible || undefined,
      notes: form.notes.trim() || undefined,
    });
  }

  const isSaveDisabled = !form.name.trim() || isSaving;
  const eventOptions = events.map((e) => ({ value: e.id, label: e.label }));

  const typeOptions: { key: Task['type']; icon: React.ReactNode; label: string }[] = [
    { key: 'vendor', icon: <MdStorefront size={18} />, label: t('taskTypes.vendor') },
    { key: 'payment', icon: <MdPayment size={18} />, label: t('taskTypes.payment') },
    { key: 'decision', icon: <MdHelpOutline size={18} />, label: t('taskTypes.decision') },
    { key: 'reminder', icon: <MdNotificationsNone size={18} />, label: t('taskTypes.reminder') },
  ];

  const priorityOptions: { key: Task['priority']; chipClass: string; label: string }[] = [
    { key: 'essential', chipClass: styles.chipEssential, label: tCommon('priority.essential') },
    { key: 'logistic', chipClass: styles.chipLogistic, label: tCommon('priority.logistic') },
    { key: 'aesthetic', chipClass: styles.chipAesthetic, label: tCommon('priority.aesthetic') },
    { key: 'personal', chipClass: styles.chipPersonal, label: tCommon('priority.personal') },
  ];

  const responsibleOptions: { key: string; label: string }[] = [
    { key: 'partner1', label: t('responsible.partner1') },
    { key: 'partner2', label: t('responsible.partner2') },
    { key: 'both', label: t('responsible.both') },
  ];

  return (
    <BottomSheet open={open} onClose={handleClose} title={t('addTask.title')}>
      <Flex vertical gap={16} className={styles.form} data-testid="add-task-form">

        {/* ── Task name (required) ──────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.nameLabel')}</div>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={t('addTask.namePlaceholder')}
            size="large"
            data-testid="add-task-name"
          />
        </div>

        {/* ── Task type (icon segment) ───────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.typeLabel')}</div>
          <Flex wrap gap={8} justify="flex-end" data-testid="task-type-selector">
            {typeOptions.map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.chip}${form.type === key ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, type: key }))}
                data-testid={`task-type-${key}`}
                aria-pressed={form.type === key}
                style={form.type === key
                  ? { background: 'rgba(201,169,122,0.15)', borderColor: '#C9A97A' }
                  : {}}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {icon}
                  {label}
                </span>
              </button>
            ))}
          </Flex>
        </div>

        {/* ── Category chips ─────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.categoryLabel')}</div>
          <Flex wrap gap={8} justify="flex-end" data-testid="category-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip}${form.category === cat ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, category: cat }))}
                data-testid={`category-chip-add-${cat}`}
                aria-pressed={form.category === cat}
                style={form.category === cat
                  ? { background: 'rgba(201,169,122,0.15)', borderColor: '#C9A97A' }
                  : {}}
              >
                {cat}
              </button>
            ))}
          </Flex>
        </div>

        {/* ── Priority chips ─────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.priorityLabel')}</div>
          <Flex wrap gap={8} justify="flex-end" data-testid="priority-chips">
            {priorityOptions.map(({ key, chipClass, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.chip} ${chipClass}${form.priority === key ? ` ${styles.chipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, priority: key }))}
                data-testid={`priority-chip-${key}`}
                aria-pressed={form.priority === key}
              >
                {label}
              </button>
            ))}
          </Flex>
        </div>

        {/* ── Event selector ─────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.eventLabel')}</div>
          <Select
            value={form.eventId || (events[0]?.id ?? '')}
            onChange={(val) => setForm((p) => ({ ...p, eventId: val }))}
            options={eventOptions}
            style={{ width: '100%' }}
            size="large"
            data-testid="add-task-event"
          />
        </div>

        {/* ── Due date picker ────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.dueDateLabel')}</div>
          <DatePicker
            style={{ width: '100%' }}
            size="large"
            format="DD/MM/YYYY"
            placeholder={t('addTask.dueDateLabel')}
            data-testid="add-task-due-date"
            onChange={(_date, dateStr) => {
              const str = Array.isArray(dateStr) ? dateStr[0] : dateStr;
              setForm((p) => ({ ...p, dueDate: str || undefined } as typeof p & { dueDate?: string }));
            }}
          />
        </div>

        {/* ── Responsible (avatar chips) ─────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.responsibleLabel')}</div>
          <Flex gap={12} justify="flex-end" data-testid="responsible-chips">
            {responsibleOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.avatarChip}${form.responsible === key ? ` ${styles.avatarChipActive}` : ''}`}
                onClick={() => setForm((p) => ({ ...p, responsible: p.responsible === key ? '' : key }))}
                data-testid={`responsible-${key}`}
                aria-pressed={form.responsible === key}
              >
                <span>{label}</span>
              </button>
            ))}
          </Flex>
        </div>

        {/* ── Notes ─────────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addTask.notesLabel')}</div>
          <Input.TextArea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder={t('addTask.notesPlaceholder')}
            rows={3}
            data-testid="add-task-notes"
          />
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div className={styles.actions}>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={isSaveDisabled}
            loading={isSaving}
            style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
            data-testid="add-task-save"
          >
            {t('addTask.saveButton')}
          </Button>
          <Button onClick={handleClose} data-testid="add-task-cancel">
            {t('addTask.cancelButton')}
          </Button>
        </div>
      </Flex>
    </BottomSheet>
  );
}
