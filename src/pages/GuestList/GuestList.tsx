import { useNavigate } from 'react-router';
import { Flex, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { EventPillTab } from '../../components/EventPillTab/EventPillTab';
import { DuplicateBanner } from '../../components/DuplicateBanner/DuplicateBanner';
import { GuestRow } from '../../components/GuestRow/GuestRow';
import { AddGuestSheet } from '../../features/guests/AddGuestSheet/AddGuestSheet';
import type { Guest } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectAddSheetOpen, closeAddSheet } from '../../store/uiSlice';
import { useGuestList } from './useGuestList';
import styles from './GuestList.module.scss';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GuestListSkeleton() {
  return (
    <div className={styles.page} data-testid="guest-list-skeleton">
      <div className={styles.skeletonSection}>
        <Skeleton.Button active block style={{ height: 36, borderRadius: 9999 }} />
      </div>
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Button
            key={i}
            active
            block
            style={{ height: 80, borderRadius: 16 }}
          />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton.Button active block style={{ height: 68, borderRadius: 16 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Stats grid ───────────────────────────────────────────────────────────────

interface StatsGridProps {
  total: number;
  confirmed: number;
  cancelled: number;
  pending: number;
}

function StatsGrid({ total, confirmed, cancelled, pending }: StatsGridProps) {
  const { t } = useTranslation('guests');
  const stats = [
    { key: 'total', label: t('stats.total'), value: total },
    { key: 'confirmed', label: t('stats.confirmed'), value: confirmed },
    { key: 'cancelled', label: t('stats.cancelled'), value: cancelled },
    { key: 'pending', label: t('stats.pending'), value: pending },
  ];

  return (
    <div className={styles.statsGrid} data-testid="stats-grid">
      {stats.map((s) => (
        <div key={s.key} className={styles.statCard} data-testid={`stat-${s.key}`}>
          <div className={styles.statValue} data-testid={`stat-${s.key}-value`}>
            {s.value}
          </div>
          <div className={styles.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GuestList() {
  const { t } = useTranslation('guests');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const addSheetOpen = useAppSelector(selectAddSheetOpen);
  const {
    data,
    isLoading,
    sections,
    stats,
    activeEventId,
    setActiveEventId,
    duplicateCount,
  } = useGuestList();

  if (isLoading || !data) {
    return <GuestListSkeleton />;
  }

  function handleGuestClick(guest: Guest) {
    navigate(`/guests/${guest.id}`);
  }

  function handleDuplicateReview() {
    navigate('/guests/duplicates');
  }

  return (
    <div className={styles.page} data-testid="guest-list-page">
      {/* ── Event pill tabs ─────────────────────────────── */}
      <EventPillTab
        events={data.events}
        activeEventId={activeEventId}
        onChange={setActiveEventId}
      />

      {/* ── Stats 2×2 grid ──────────────────────────────── */}
      <StatsGrid
        total={stats.total}
        confirmed={stats.confirmed}
        cancelled={stats.cancelled}
        pending={stats.pending}
      />

      {/* ── Duplicate banner (conditional) ──────────────── */}
      {duplicateCount > 0 && (
        <DuplicateBanner count={duplicateCount} onReview={handleDuplicateReview} />
      )}

      {/* ── Guest list grouped by invitedBy ─────────────── */}
      <div data-testid="guest-sections">
        {sections.length === 0 ? (
          <p data-testid="guest-list-empty">{t('emptyState')}</p>
        ) : (
          sections.map((section) => (
            <div key={section.key} data-testid={`section-${section.key}`}>
              <div
                className={styles.sectionHeader}
                data-testid="section-header"
              >
                {section.label} ({section.guests.length})
              </div>
              <Flex vertical gap={6} className={styles.guestList}>
                {section.guests.map((guest) => (
                  <GuestRow
                    key={guest.id}
                    guest={guest}
                    onClick={handleGuestClick}
                  />
                ))}
              </Flex>
            </div>
          ))
        )}
      </div>

      {/* ── Add Guest bottom sheet ───────────────────────── */}
      <AddGuestSheet
        open={addSheetOpen === 'guest'}
        onClose={() => dispatch(closeAddSheet())}
        events={data.events}
        onDuplicatesFound={handleDuplicateReview}
      />
    </div>
  );
}
