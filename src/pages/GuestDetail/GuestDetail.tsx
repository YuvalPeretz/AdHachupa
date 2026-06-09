import { useNavigate, useParams } from 'react-router';
import { Avatar, Button, Flex, Input, Select, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { getInitials } from '../../utils/initials';
import type { RsvpStatus } from '../../types';
import { useGuestDetail } from './useGuestDetail';
import styles from './GuestDetail.module.scss';

const RSVP_STATUSES: { key: RsvpStatus; labelKey: 'rsvp.confirmed' | 'rsvp.pending' | 'rsvp.cancelled' }[] = [
  { key: 'confirmed', labelKey: 'rsvp.confirmed' },
  { key: 'pending', labelKey: 'rsvp.pending' },
  { key: 'cancelled', labelKey: 'rsvp.cancelled' },
];

export function GuestDetail() {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('guests');
  const {
    isLoading,
    localGuest,
    setLocalGuest,
    events,
    handleRsvpChange,
    handleSave,
    isSaving,
    toastContextHolder,
  } = useGuestDetail(guestId ?? '');

  if (isLoading || !localGuest) {
    return (
      <div className={styles.page} data-testid="guest-detail-skeleton">
        {toastContextHolder}
        <PageHeader title={t('detail.title')} onBack={() => navigate('/guests')} />
        <div style={{ padding: '24px 20px' }}>
          <Skeleton avatar active paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  const initials = getInitials(localGuest.name);

  const invitedByOptions = [
    { value: 'הזוג', label: t('invitedBy.couple') },
    { value: 'הורי הכלה', label: t('invitedBy.brideParents') },
    { value: 'הורי החתן', label: t('invitedBy.groomParents') },
  ];

  return (
    <div className={styles.page} data-testid="guest-detail-page">
      {toastContextHolder}
      <PageHeader title={t('detail.title')} onBack={() => navigate('/guests')} />

      {/* ── Avatar + name ────────────────────────────────── */}
      <Flex vertical align="center" gap={8} className={styles.avatarSection}>
        <Avatar
          size={80}
          style={{
            backgroundColor: '#F2C4CE',
            color: '#2D2D2D',
            fontFamily: 'Rubik, sans-serif',
            fontSize: 28,
            fontWeight: 700,
          }}
          data-testid="guest-avatar"
        >
          {initials}
        </Avatar>
        <h1 className={styles.guestName} data-testid="guest-detail-name">
          {localGuest.name}
        </h1>
      </Flex>

      <Flex vertical gap={12} className={styles.cardsArea}>
        {/* ── 1. Contact card ─────────────────────────── */}
        <div className={styles.card} data-testid="contact-card">
          <div className={styles.cardTitle}>{t('detail.contactCard')}</div>
          <Flex align="center" gap={8} className={styles.contactRow}>
            <span className={styles.contactLabel}>{t('detail.phone')}</span>
            <span data-testid="guest-phone">
              {localGuest.phone ?? t('detail.noPhone')}
            </span>
          </Flex>
          <Flex align="center" gap={8} className={styles.contactRow}>
            <span className={styles.contactLabel}>{t('detail.email')}</span>
            <span data-testid="guest-email">
              {(localGuest as { email?: string }).email ?? t('detail.noEmail')}
            </span>
          </Flex>
        </div>

        {/* ── 2. Arrival card — RSVP + plus-ones ──────── */}
        <div className={styles.card} data-testid="arrival-card">
          <div className={styles.cardTitle}>{t('detail.arrivalCard')}</div>

          <div className={styles.fieldLabel}>{t('detail.rsvpLabel')}</div>
          <Flex gap={8} wrap data-testid="rsvp-chips">
            {RSVP_STATUSES.map(({ key, labelKey }) => {
              const isActive = localGuest.rsvpStatus === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.rsvpChip} ${styles[key]}${isActive ? ` ${styles.active}` : ''}`}
                  onClick={() => handleRsvpChange(key)}
                  data-testid={`rsvp-chip-${key}`}
                  aria-pressed={isActive}
                  data-rsvp-active={isActive ? 'true' : 'false'}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </Flex>

          <Flex align="center" gap={16} className={styles.stepperRow} data-testid="plus-ones-stepper">
            <span className={styles.fieldLabel}>{t('detail.plusOnesLabel')}</span>
            <Button
              size="small"
              onClick={() =>
                setLocalGuest((p) => p ? { ...p, plusOnes: Math.max(0, p.plusOnes - 1) } : p)
              }
              disabled={localGuest.plusOnes === 0}
              data-testid="plus-ones-decrement"
            >
              −
            </Button>
            <span className={styles.stepperValue} data-testid="plus-ones-value">
              {localGuest.plusOnes}
            </span>
            <Button
              size="small"
              onClick={() =>
                setLocalGuest((p) => p ? { ...p, plusOnes: p.plusOnes + 1 } : p)
              }
              data-testid="plus-ones-increment"
            >
              +
            </Button>
          </Flex>
        </div>

        {/* ── 3. Events card ──────────────────────────── */}
        <div className={styles.card} data-testid="events-card">
          <div className={styles.cardTitle}>{t('detail.eventsCard')}</div>
          <Flex wrap gap={8}>
            {events
              .filter((e) => localGuest.eventIds.includes(e.id))
              .map((e) => (
                <span key={e.id} className={styles.eventChip} data-testid={`event-chip-${e.id}`}>
                  {e.label}
                </span>
              ))}
          </Flex>
        </div>

        {/* ── 4. Assignment card ──────────────────────── */}
        <div className={styles.card} data-testid="assignment-card">
          <div className={styles.cardTitle}>{t('detail.assignmentCard')}</div>

          <div className={styles.fieldLabel}>{t('detail.invitedByLabel')}</div>
          <Select
            value={localGuest.invitedBy}
            onChange={(val) => setLocalGuest((p) => p ? { ...p, invitedBy: val } : p)}
            options={invitedByOptions}
            style={{ width: '100%', marginBlockEnd: 12 }}
            data-testid="invited-by-select"
          />

          <div className={styles.fieldLabel}>{t('detail.tableNoLabel')}</div>
          <Input
            value={localGuest.tableNo ?? ''}
            onChange={(e) =>
              setLocalGuest((p) => p ? { ...p, tableNo: e.target.value } : p)
            }
            placeholder={t('detail.tableNoPlaceholder')}
            data-testid="table-no-input"
          />
        </div>

        {/* ── 5. Notes card ───────────────────────────── */}
        <div className={styles.card} data-testid="notes-card">
          <div className={styles.cardTitle}>{t('detail.notesCard')}</div>
          <Input.TextArea
            value={(localGuest as { notes?: string }).notes ?? ''}
            onChange={(e) =>
              setLocalGuest((p) => p ? { ...p, notes: e.target.value } as typeof p : p)
            }
            placeholder={t('detail.notesPlaceholder')}
            autoSize={{ minRows: 3, maxRows: 6 }}
            data-testid="notes-input"
          />
        </div>

        {/* ── Delete section ──────────────────────────── */}
        <div className={styles.deleteCard} data-testid="delete-section">
          <div className={styles.cardTitle}>{t('detail.deleteSection')}</div>
          <Button
            danger
            block
            data-testid="delete-guest-btn"
          >
            {t('detail.deleteButton')}
          </Button>
        </div>

        {/* ── Save button ─────────────────────────────── */}
        <div className={styles.actionsRow}>
          <Button
            type="primary"
            block
            size="large"
            onClick={handleSave}
            loading={isSaving}
            style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A', borderRadius: 12 }}
            data-testid="save-guest-btn"
          >
            {t('detail.saveButton')}
          </Button>
        </div>
      </Flex>
    </div>
  );
}
