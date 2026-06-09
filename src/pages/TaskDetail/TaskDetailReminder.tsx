import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, DatePicker, TimePicker, Switch, Skeleton, Flex } from 'antd';
import { MdLink, MdAccountTree } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import type { Task, TaskReminder } from '../../types';
import { fetchTaskById, fetchTaskReminder, updateTaskReminder } from '../../lib/firestore/tasks';
import styles from './TaskDetail.module.scss';

interface TaskDetailReminderProps {
  taskId: string;
}

export function TaskDetailReminder({ taskId }: TaskDetailReminderProps) {
  const { t } = useTranslation('tasks');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localNotify, setLocalNotify] = useState<boolean | null>(null);

  const { data: task, isLoading: taskLoading } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: reminder, isLoading: reminderLoading } = useQuery<TaskReminder>({
    queryKey: ['reminder', taskId],
    queryFn: () => fetchTaskReminder(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const reminderMutation = useMutation({
    mutationFn: (updates: Partial<TaskReminder>) => updateTaskReminder(taskId, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminder', taskId] });
      setLocalNotify(null);
    },
  });

  const isLoading = taskLoading || reminderLoading;

  if (isLoading || !task || !reminder) {
    return (
      <Flex vertical className={styles.page} data-testid="task-detail-reminder-skeleton">
        <PageHeader title="..." onBack={() => navigate('/tasks')} />
        <div style={{ padding: '24px 20px' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </Flex>
    );
  }

  const effectiveNotify = localNotify !== null ? localNotify : reminder.notifyEnabled;

  function handleSave() {
    reminderMutation.mutate({ notifyEnabled: effectiveNotify });
  }

  return (
    <Flex vertical className={styles.page} data-testid="task-detail-reminder-page">
      <PageHeader title={task.name} onBack={() => navigate('/tasks')} />

      <Flex vertical gap={20} className={styles.content}>
        <div className={styles.desktopTitle}>{task.name}</div>

        {/* ── Date + time ───────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.reminder.dateLabel')}</div>

          <Flex vertical gap={12}>
            <div>
              <div className={styles.fieldLabel}>{t('detail.reminder.dateLabel')}</div>
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
                placeholder={t('detail.reminder.dateLabel')}
                data-testid="reminder-date-picker"
              />
            </div>
            <div>
              <div className={styles.fieldLabel}>{t('detail.reminder.timeLabel')}</div>
              <TimePicker
                style={{ width: '100%' }}
                size="large"
                format="HH:mm"
                placeholder={t('detail.reminder.timeLabel')}
                data-testid="reminder-time-picker"
              />
            </div>
          </Flex>
        </div>

        {/* ── Push notification toggle ──────────────────── */}
        <div className={styles.section}>
          <Flex justify="space-between" align="center">
            <Switch
              checked={effectiveNotify}
              onChange={(checked) => setLocalNotify(checked)}
              style={{
                backgroundColor: effectiveNotify ? '#C9A97A' : undefined,
              }}
              data-testid="notify-toggle"
              aria-label={t('detail.reminder.notifyLabel')}
            />
            <span
              style={{
                fontFamily: 'Rubik',
                fontSize: 15,
                color: '#2D2D2D',
                textAlign: 'right',
              }}
            >
              {t('detail.reminder.notifyLabel')}
            </span>
          </Flex>
        </div>

        {/* ── Linked task chip ──────────────────────────── */}
        {(reminder.linkedTaskName || reminder.linkedEventName) && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('detail.reminder.linkedTaskLabel')}</div>
            <Flex justify="flex-end">
              <div className={styles.linkedChip} data-testid="linked-task-chip">
                <MdLink size={14} />
                <span>
                  {reminder.linkedEventName
                    ? `${reminder.linkedEventName} — `
                    : ''}
                  {reminder.linkedTaskName}
                </span>
              </div>
            </Flex>
          </div>
        )}

        {/* ── Dependency chip ───────────────────────────── */}
        {reminder.dependencyTaskName && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('detail.reminder.dependencyLabel')}</div>
            <Flex justify="flex-end">
              <div className={styles.linkedChip} data-testid="dependency-chip">
                <MdAccountTree size={14} />
                <span>{reminder.dependencyTaskName}</span>
              </div>
            </Flex>
          </div>
        )}

        {/* ── Save button ───────────────────────────────── */}
        <Button
          type="primary"
          className={styles.saveBtn}
          style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
          loading={reminderMutation.isPending}
          onClick={handleSave}
          data-testid="reminder-save-btn"
        >
          {t('detail.saveButton')}
        </Button>
      </Flex>
    </Flex>
  );
}
