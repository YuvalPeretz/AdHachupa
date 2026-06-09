import { useState } from 'react';
import { Alert, Button, Flex, Input, Select } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../../../components/BottomSheet/BottomSheet';
import type { WeddingEvent } from '../../../types';
import { addGuest } from '../../../lib/firestore/guests';
import { useAppSelector } from '../../../store';
import { selectCoupleId } from '../../../features/auth/authSlice';
import styles from './AddGuestSheet.module.scss';

interface AddGuestSheetProps {
  open: boolean;
  onClose: () => void;
  events: WeddingEvent[];
  onDuplicatesFound: () => void;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  plusOnes: number;
  invitedBy: string;
  eventIds: string[];
}

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  email: '',
  plusOnes: 0,
  invitedBy: 'הזוג',
  eventIds: [],
};

export function AddGuestSheet({ open, onClose, events, onDuplicatesFound }: AddGuestSheetProps) {
  const { t } = useTranslation('guests');
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectCoupleId) ?? '';
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof addGuest>[1]) => addGuest(coupleId, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['guests', coupleId] });

      if (data.duplicates.length > 0) {
        // Show duplicate warning inline — guest is saved regardless
        setDuplicateWarning(true);
      } else {
        // Clean close
        handleClose();
      }
    },
  });

  function handleClose() {
    setForm(EMPTY_FORM);
    setDuplicateWarning(false);
    onClose();
  }

  function handleSave() {
    if (!form.name.trim()) return;
    setDuplicateWarning(false);
    mutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      plusOnes: form.plusOnes,
      invitedBy: form.invitedBy,
      eventIds: form.eventIds.length > 0 ? form.eventIds : events.map((e) => e.id),
    });
  }

  function toggleEvent(eventId: string) {
    setForm((prev) => ({
      ...prev,
      eventIds: prev.eventIds.includes(eventId)
        ? prev.eventIds.filter((id) => id !== eventId)
        : [...prev.eventIds, eventId],
    }));
  }

  const isSaveDisabled = !form.name.trim() || mutation.isPending;

  const invitedByOptions = [
    { value: 'הזוג', label: t('invitedBy.couple') },
    { value: 'הורי הכלה', label: t('invitedBy.brideParents') },
    { value: 'הורי החתן', label: t('invitedBy.groomParents') },
  ];

  return (
    <BottomSheet open={open} onClose={handleClose} title={t('addGuest.title')}>
      <Flex vertical gap={14} className={styles.form} data-testid="add-guest-form">
        {/* ── Name (required) ───────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addGuest.namePlaceholder')}</div>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={t('addGuest.namePlaceholder')}
            size="large"
            data-testid="add-guest-name"
          />
        </div>

        {/* ── Phone ─────────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addGuest.phonePlaceholder')}</div>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder={t('addGuest.phonePlaceholder')}
            type="tel"
            size="large"
            data-testid="add-guest-phone"
          />
        </div>

        {/* ── Email ─────────────────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addGuest.emailPlaceholder')}</div>
          <Input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder={t('addGuest.emailPlaceholder')}
            type="email"
            size="large"
            data-testid="add-guest-email"
          />
        </div>

        {/* ── Plus-ones stepper ─────────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addGuest.plusOnesLabel')}</div>
          <Flex align="center" justify="space-between" gap={12} data-testid="plus-ones-stepper">
            <Button
              onClick={() => setForm((p) => ({ ...p, plusOnes: Math.max(0, p.plusOnes - 1) }))}
              disabled={form.plusOnes === 0}
              data-testid="plus-ones-decrement"
            >
              −
            </Button>
            <span className={styles.stepperValue} data-testid="plus-ones-value">
              {form.plusOnes}
            </span>
            <Button
              onClick={() => setForm((p) => ({ ...p, plusOnes: p.plusOnes + 1 }))}
              data-testid="plus-ones-increment"
            >
              +
            </Button>
          </Flex>
        </div>

        {/* ── Invited by (dropdown) ─────────────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addGuest.invitedByLabel')}</div>
          <Select
            value={form.invitedBy}
            onChange={(val) => setForm((p) => ({ ...p, invitedBy: val }))}
            options={invitedByOptions}
            style={{ width: '100%' }}
            size="large"
            data-testid="add-guest-invited-by"
          />
        </div>

        {/* ── Events (multi-select chips) ───────────────── */}
        <div>
          <div className={styles.fieldLabel}>{t('addGuest.eventsLabel')}</div>
          <Flex wrap gap={8} data-testid="add-guest-events">
            {events.map((event) => {
              const isActive = form.eventIds.includes(event.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  className={`${styles.eventChip}${isActive ? ` ${styles.active}` : ''}`}
                  onClick={() => toggleEvent(event.id)}
                  data-testid={`event-chip-${event.id}`}
                  aria-pressed={isActive}
                >
                  {event.label}
                </button>
              );
            })}
          </Flex>
        </div>

        {/* ── Duplicate warning (inline, after save) ────── */}
        {duplicateWarning && (
          <Alert
            type="warning"
            showIcon
            className={styles.duplicateWarning}
            message={t('duplicateWarning.title')}
            description={t('duplicateWarning.message')}
            data-testid="add-guest-duplicate-warning"
            action={
              <Button
                size="small"
                type="text"
                onClick={() => {
                  handleClose();
                  onDuplicatesFound();
                }}
                data-testid="add-guest-duplicate-review-btn"
              >
                {t('duplicateWarning.review')}
              </Button>
            }
          />
        )}

        {/* ── Actions ───────────────────────────────────── */}
        <Flex justify="flex-end" gap={10} className={styles.actions}>
          <Button onClick={handleClose} data-testid="add-guest-cancel">
            {t('addGuest.cancelButton')}
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={isSaveDisabled}
            loading={mutation.isPending}
            style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
            data-testid="add-guest-save"
          >
            {t('addGuest.saveButton')}
          </Button>
        </Flex>
      </Flex>
    </BottomSheet>
  );
}
