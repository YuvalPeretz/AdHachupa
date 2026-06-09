import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, Input, Skeleton } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import type { Task, TaskDecision, DecisionOption } from '../../types';
import { fetchTaskById, fetchTaskDecision, updateTaskDecision } from '../../lib/firestore/tasks';
import styles from './TaskDetail.module.scss';

interface TaskDetailDecisionProps {
  taskId: string;
}

// Single option card — displays pros/cons columns
interface OptionCardProps {
  option: DecisionOption;
  index: number;
}

function OptionCard({ option, index }: OptionCardProps) {
  const { t } = useTranslation('tasks');

  return (
    <Flex vertical gap={10} className={styles.decisionCard} data-testid={`decision-option-${option.id}`}>
      <div className={styles.decisionCardTitle} data-testid={`decision-option-title-${index}`}>
        {option.label || `${t('detail.decision.option')} ${index + 1}`}
      </div>

      {/* Pros */}
      <Flex vertical gap={4}>
        <div className={styles.proConsHeader}>{t('detail.decision.prosLabel')}</div>
        {option.pros.map((pro, i) => (
          <div key={i} className={styles.proItem} data-testid={`pro-item-${option.id}-${i}`}>
            {pro}
          </div>
        ))}
      </Flex>

      {/* Cons */}
      <Flex vertical gap={4}>
        <div className={styles.proConsHeader}>{t('detail.decision.consLabel')}</div>
        {option.cons.map((con, i) => (
          <div key={i} className={styles.conItem} data-testid={`con-item-${option.id}-${i}`}>
            {con}
          </div>
        ))}
      </Flex>
    </Flex>
  );
}

export function TaskDetailDecision({ taskId }: TaskDetailDecisionProps) {
  const { t } = useTranslation('tasks');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localFinalDecision, setLocalFinalDecision] = useState<string | null>(null);

  const { data: task, isLoading: taskLoading } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: decision, isLoading: decisionLoading } = useQuery<TaskDecision>({
    queryKey: ['decision', taskId],
    queryFn: () => fetchTaskDecision(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const decisionMutation = useMutation({
    mutationFn: (updates: Partial<TaskDecision>) => updateTaskDecision(taskId, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decision', taskId] });
    },
  });

  const isLoading = taskLoading || decisionLoading;

  if (isLoading || !task || !decision) {
    return (
      <Flex vertical className={styles.page} data-testid="task-detail-decision-skeleton">
        <PageHeader title="..." onBack={() => navigate('/tasks')} />
        <div style={{ padding: '24px 20px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </Flex>
    );
  }

  const effectiveFinalDecision =
    localFinalDecision !== null ? localFinalDecision : (decision.finalDecision ?? '');

  function handleSave() {
    decisionMutation.mutate({ finalDecision: effectiveFinalDecision || undefined });
    setLocalFinalDecision(null);
  }

  function handleAddOption() {
    if (!decision) return;
    const newOption: DecisionOption = {
      id: `opt-${Date.now()}`,
      label: `${t('detail.decision.option')} ${decision.options.length + 1}`,
      pros: [],
      cons: [],
    };
    decisionMutation.mutate({
      options: [...decision.options, newOption],
    });
  }

  return (
    <Flex vertical className={styles.page} data-testid="task-detail-decision-page">
      <PageHeader title={task.name} onBack={() => navigate('/tasks')} />

      <Flex vertical gap={20} className={styles.content}>
        <div className={styles.desktopTitle}>{task.name}</div>

        {/* ── Option cards (side-by-side, RTL: right card first) ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.statusLabel')}</div>

          {decision.options.length > 0 ? (
            <Flex
              gap={12}
              data-testid="decision-options-container"
            >
              {decision.options.map((option, idx) => (
                <OptionCard key={option.id} option={option} index={idx} />
              ))}
            </Flex>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: '#9e9e9e',
                fontFamily: 'Rubik',
                fontSize: 14,
                padding: '12px 0',
              }}
              data-testid="no-options-message"
            >
              אין אפשרויות עדיין
            </div>
          )}

          {/* Dashed "add option" card */}
          <button
            type="button"
            className={styles.dashedCard}
            onClick={handleAddOption}
            data-testid="add-option-dashed-card"
            style={{ marginTop: 12 }}
            disabled={decisionMutation.isPending}
          >
            {t('detail.decision.addOption')}
          </button>
        </div>

        {/* ── Final decision input ──────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.decision.finalDecisionLabel')}</div>
          <Input
            value={effectiveFinalDecision}
            onChange={(e) => setLocalFinalDecision(e.target.value)}
            placeholder={t('detail.decision.finalDecisionPlaceholder')}
            size="large"
            className={`${styles.finalDecisionInput}${effectiveFinalDecision ? ` ${styles.filled}` : ''}`}
            style={
              effectiveFinalDecision
                ? {
                    borderColor: '#C9A97A',
                    boxShadow: '0 0 0 2px rgba(201, 169, 122, 0.2)',
                    borderRadius: 12,
                  }
                : { borderRadius: 12 }
            }
            data-testid="final-decision-input"
          />
        </div>

        {/* ── Save button ───────────────────────────────── */}
        <Button
          type="primary"
          className={styles.saveBtn}
          style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
          loading={decisionMutation.isPending}
          onClick={handleSave}
          data-testid="decision-save-btn"
        >
          {t('detail.saveButton')}
        </Button>
      </Flex>
    </Flex>
  );
}
