/**
 * TaskDetail — dispatcher component.
 *
 * Reads the task by id and delegates to the appropriate variant:
 *   type=vendor    → TaskDetailVendor
 *   type=payment   → TaskDetailPayment
 *   type=decision  → TaskDetailDecision
 *   type=reminder  → TaskDetailReminder
 *
 * The spec requires a single route /tasks/:taskId that renders the correct
 * variant based on the task's type field.
 */
import { useParams, useNavigate } from 'react-router';
import { Flex, Skeleton } from 'antd';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { useTaskDetail } from './useTaskDetail';
import { TaskDetailVendor } from './TaskDetailVendor';
import { TaskDetailPayment } from './TaskDetailPayment';
import { TaskDetailDecision } from './TaskDetailDecision';
import { TaskDetailReminder } from './TaskDetailReminder';
import styles from './TaskDetail.module.scss';

export function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { task, isLoading } = useTaskDetail(taskId ?? '');

  if (isLoading) {
    return (
      <Flex vertical className={styles.page} data-testid="task-detail-skeleton">
        <PageHeader title="..." onBack={() => navigate('/tasks')} />
        <div style={{ padding: '24px 20px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </Flex>
    );
  }

  if (!task) {
    return (
      <Flex vertical className={styles.page} data-testid="task-detail-not-found">
        <PageHeader title="—" onBack={() => navigate('/tasks')} />
        <div style={{ padding: '24px 20px', textAlign: 'right', fontFamily: 'Rubik' }}>
          <p>משימה לא נמצאה</p>
        </div>
      </Flex>
    );
  }

  switch (task.type) {
    case 'vendor':
      return <TaskDetailVendor taskId={task.id} />;
    case 'payment':
      return <TaskDetailPayment taskId={task.id} />;
    case 'decision':
      return <TaskDetailDecision taskId={task.id} />;
    case 'reminder':
      return <TaskDetailReminder taskId={task.id} />;
    default:
      return <TaskDetailVendor taskId={task.id} />;
  }
}
