import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, Skeleton, message } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { useAppSelector } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';
import { fetchDuplicates, mergeGuests, dismissDuplicate } from '../../lib/firestore/guests';
import type { DuplicatePair } from '../../lib/firestore/types';
import styles from './DuplicateReview.module.scss';

export function DuplicateReview() {
  const navigate = useNavigate();
  const { t } = useTranslation('guests');
  const coupleId = useAppSelector(selectAuthUid) ?? '';
  const [messageApi, contextHolder] = message.useMessage();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['duplicates', coupleId],
    queryFn: () => fetchDuplicates(coupleId),
    enabled: Boolean(coupleId),
  });

  const mergeMutation = useMutation({
    mutationFn: ({ primaryId, secondaryId }: { primaryId: string; secondaryId: string }) =>
      mergeGuests(coupleId, primaryId, secondaryId),
    onSuccess: (_result, { primaryId }) => {
      void primaryId;
      void messageApi.success(t('duplicates.mergedSuccess'));
    },
  });

  const dismissMutation = useMutation({
    mutationFn: ({ guestId1, guestId2 }: { guestId1: string; guestId2: string }) =>
      dismissDuplicate(coupleId, guestId1, guestId2),
  });

  function handleMerge(pair: DuplicatePair) {
    mergeMutation.mutate(
      { primaryId: pair.guests[0].id, secondaryId: pair.guests[1].id },
      {
        onSuccess: () => {
          setResolvedIds((prev) => new Set([...prev, pair.id]));
        },
      },
    );
  }

  function handleKeepSeparate(pair: DuplicatePair) {
    dismissMutation.mutate(
      { guestId1: pair.guests[0].id, guestId2: pair.guests[1].id },
      {
        onSuccess: () => {
          setResolvedIds((prev) => new Set([...prev, pair.id]));
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page} data-testid="duplicate-review-skeleton">
        <PageHeader title={t('duplicates.pageTitle')} onBack={() => navigate('/guests')} />
        <div style={{ padding: '16px' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  const visiblePairs = (data?.pairs ?? []).filter((p) => !resolvedIds.has(p.id));
  const allResolved = (data?.pairs ?? []).length > 0 && visiblePairs.length === 0;

  return (
    <div className={styles.page} data-testid="duplicate-review-page">
      {contextHolder}
      <PageHeader title={t('duplicates.pageTitle')} onBack={() => navigate('/guests')} />

      <Flex vertical gap={16} className={styles.content}>
        {allResolved || (data?.pairs ?? []).length === 0 ? (
          <div className={styles.emptyState} data-testid="duplicate-empty-state">
            {t('duplicates.emptyState')}
          </div>
        ) : (
          visiblePairs.map((pair) => (
            <div
              key={pair.id}
              className={styles.pairCard}
              data-testid={`duplicate-pair-${pair.id}`}
            >
              <div className={styles.pairLabel}>{t('duplicates.pairLabel')}</div>

              {/* Two guest cards side by side */}
              <div className={styles.guestsRow}>
                <div className={styles.guestCard} data-testid={`duplicate-guest-a-${pair.id}`}>
                  <div className={styles.guestCardName}>{pair.guests[0].name}</div>
                  {pair.guests[0].phone && (
                    <div className={styles.guestCardPhone}>{pair.guests[0].phone}</div>
                  )}
                </div>

                <span className={styles.vsLabel}>vs</span>

                <div className={styles.guestCard} data-testid={`duplicate-guest-b-${pair.id}`}>
                  <div className={styles.guestCardName}>{pair.guests[1].name}</div>
                  {pair.guests[1].phone && (
                    <div className={styles.guestCardPhone}>{pair.guests[1].phone}</div>
                  )}
                </div>
              </div>

              {/* Similarity reason */}
              <div className={styles.reasonBadge} data-testid={`duplicate-reason-${pair.id}`}>
                {t(`duplicates.reason.${pair.reason}`)}
              </div>

              {/* Actions */}
              <Flex gap={8}>
                <Button
                  type="primary"
                  onClick={() => handleMerge(pair)}
                  loading={mergeMutation.isPending}
                  style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
                  data-testid={`merge-btn-${pair.id}`}
                >
                  {t('duplicates.mergeButton')}
                </Button>
                <Button
                  onClick={() => handleKeepSeparate(pair)}
                  loading={dismissMutation.isPending}
                  data-testid={`keep-separate-btn-${pair.id}`}
                >
                  {t('duplicates.keepSeparateButton')}
                </Button>
              </Flex>
            </div>
          ))
        )}
      </Flex>
    </div>
  );
}
