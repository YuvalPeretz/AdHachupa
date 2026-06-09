import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Switch, Skeleton, Flex } from 'antd';
import { MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { BillingUnitSelector } from '../../components/BillingUnitSelector/BillingUnitSelector';
import type { Task, TaskPayment, BillingUnit } from '../../types';
import { useAppSelector } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';
import { fetchTaskById, fetchTaskPayment, updateTaskPayment } from '../../lib/firestore/tasks';
import styles from './TaskDetail.module.scss';

interface TaskDetailPaymentProps {
  taskId: string;
}

export function TaskDetailPayment({ taskId }: TaskDetailPaymentProps) {
  const { t } = useTranslation('tasks');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectAuthUid) ?? '';

  const { data: task, isLoading: taskLoading } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: payment, isLoading: paymentLoading } = useQuery<TaskPayment>({
    queryKey: ['payment', taskId],
    queryFn: () => fetchTaskPayment(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const [localBillingUnit, setLocalBillingUnit] = useState<BillingUnit | null>(null);

  const paymentMutation = useMutation({
    mutationFn: (updates: Partial<Pick<TaskPayment, 'advancePaid' | 'advanceAmount' | 'balancePaid' | 'balanceAmount'>>) =>
      updateTaskPayment(coupleId, taskId, updates),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['payment', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', coupleId] });
      if (data.task.status === 'closed') {
        void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      }
    },
  });

  const isLoading = taskLoading || paymentLoading;

  if (isLoading || !task || !payment) {
    return (
      <Flex vertical className={styles.page} data-testid="task-detail-payment-skeleton">
        <PageHeader title="..." onBack={() => navigate('/tasks')} />
        <div style={{ padding: '24px 20px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </Flex>
    );
  }

  const effectiveBillingUnit = localBillingUnit ?? payment.billingUnit;
  const isOverdue = payment.deadline
    ? (() => {
        const [d, m, y] = payment.deadline.split('/').map(Number);
        return new Date(y, m - 1, d) < new Date();
      })()
    : false;

  const isFullyPaid = payment.paymentStatus === 'fully_paid' || task.status === 'closed';

  return (
    <Flex
      vertical
      className={styles.page}
      data-testid={
        isFullyPaid
          ? 'task-detail-payment-fully-paid'
          : payment.advancePaid
            ? 'task-detail-payment-advance-paid'
            : 'task-detail-payment-unpaid'
      }
    >
      <PageHeader title={task.name} onBack={() => navigate('/tasks')} />

      <Flex vertical gap={20} className={styles.content}>
        <div className={styles.desktopTitle}>{task.name}</div>

        {/* ── Total amount + billing unit ───────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.payment.totalLabel')}</div>

          {/* Hero total */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'Rubik, sans-serif',
              fontSize: 36,
              fontWeight: 700,
              color: '#2D2D2D',
              padding: '12px 0',
            }}
            data-testid="payment-total"
          >
            ₪{payment.estimatedCost.toLocaleString()}
          </div>

          {/* Billing unit selector */}
          <div style={{ marginTop: 12 }}>
            <div className={styles.fieldLabel}>{t('detail.payment.billingUnitLabel')}</div>
            <BillingUnitSelector
              value={effectiveBillingUnit}
              onChange={(unit) => setLocalBillingUnit(unit)}
            />
          </div>
        </div>

        {/* ── Advance payment row ───────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.payment.advanceLabel')}</div>
          <Flex justify="space-between" align="center" className={styles.paymentRow} data-testid="advance-row">
            <Flex align="center" gap={8}>
              <Switch
                checked={payment.advancePaid}
                onChange={(checked) => {
                  paymentMutation.mutate({
                    advancePaid: checked,
                    advanceAmount: payment.advanceAmount,
                  });
                }}
                disabled={isFullyPaid || paymentMutation.isPending}
                style={{
                  backgroundColor: payment.advancePaid ? '#A8C5A0' : undefined,
                }}
                data-testid="advance-paid-toggle"
              />
              <span className={styles.paymentLabel}>{t('detail.payment.advancePaidToggle')}</span>
            </Flex>
            <Flex align="center" gap={6}>
              {payment.advancePaid ? (
                <MdCheckCircle
                  size={20}
                  color="#A8C5A0"
                  data-testid="advance-paid-icon"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={20}
                  color="#E07070"
                  data-testid="advance-unpaid-icon"
                />
              )}
              <span
                className={`${styles.paymentAmount}${payment.advancePaid ? ` ${styles.paymentAmountGreen}` : ` ${styles.paymentAmountRed}`}`}
                data-testid="advance-amount"
              >
                ₪{(payment.advanceAmount ?? 0).toLocaleString()}
              </span>
            </Flex>
          </Flex>
        </div>

        {/* ── Balance row ───────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.payment.balanceLabel')}</div>
          <Flex justify="space-between" align="center" className={styles.paymentRow} data-testid="balance-row">
            <Flex align="center" gap={8}>
              <Switch
                checked={payment.balancePaid}
                onChange={(checked) => {
                  paymentMutation.mutate({
                    balancePaid: checked,
                    balanceAmount: payment.balanceAmount,
                  });
                }}
                disabled={!payment.advancePaid || isFullyPaid || paymentMutation.isPending}
                style={{
                  backgroundColor: payment.balancePaid ? '#A8C5A0' : undefined,
                }}
                data-testid="balance-paid-toggle"
              />
              <span className={styles.paymentLabel}>{t('detail.payment.balancePaidToggle')}</span>
            </Flex>
            <Flex align="center" gap={6}>
              {payment.balancePaid ? (
                <MdCheckCircle
                  size={20}
                  color="#A8C5A0"
                  data-testid="balance-paid-icon"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={20}
                  color="#E07070"
                  data-testid="balance-unpaid-icon"
                />
              )}
              <span
                className={`${styles.paymentAmount}${payment.balancePaid ? ` ${styles.paymentAmountGreen}` : ` ${styles.paymentAmountRed}`}`}
                data-testid="balance-amount"
              >
                ₪{(payment.balanceAmount ?? 0).toLocaleString()}
              </span>
            </Flex>
          </Flex>

          {/* Deadline */}
          {payment.deadline && (
            <Flex justify="space-between" align="center" className={styles.infoRow} data-testid="payment-deadline-row">
              <span
                className={`${styles.infoValue}${isOverdue && !isFullyPaid ? ` ${styles.infoValueRed}` : ''}`}
                data-testid="payment-deadline"
              >
                {payment.deadline}
                {isOverdue && !isFullyPaid && (
                  <span style={{ marginInlineStart: 6, fontSize: 12 }}>
                    {t('detail.payment.overdue')}
                  </span>
                )}
              </span>
              <span className={styles.infoLabel}>{t('detail.payment.deadlineLabel')}</span>
            </Flex>
          )}
        </div>

        {/* ── Fully paid status ─────────────────────────── */}
        {isFullyPaid && (
          <div
            style={{
              background: '#A8C5A0',
              borderRadius: 12,
              padding: '14px 16px',
              textAlign: 'center',
              fontFamily: 'Rubik',
              fontWeight: 600,
              color: '#fff',
              fontSize: 15,
            }}
            data-testid="fully-paid-banner"
          >
            {t('detail.payment.fullyPaid')}
          </div>
        )}

        {/* ── Save button ───────────────────────────────── */}
        {!isFullyPaid && (
          <Button
            type="primary"
            className={styles.saveBtn}
            style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
            loading={paymentMutation.isPending}
            onClick={() => {
              // Save billing unit change
              if (localBillingUnit && localBillingUnit !== payment.billingUnit) {
                // In production: update billing unit via mutation
                setLocalBillingUnit(null);
              }
            }}
            data-testid="payment-save-btn"
          >
            {t('detail.saveButton')}
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
