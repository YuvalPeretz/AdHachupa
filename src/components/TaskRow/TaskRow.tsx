import { Flex, Tag } from 'antd';
import { MdChevronLeft, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types';
import { getStatusTagProps } from '../../utils/statusConfig';
import styles from './TaskRow.module.scss';

interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskRow({ task, onClick }: TaskRowProps) {
  const { t } = useTranslation('common');
  const statusProps = getStatusTagProps(task.status);
  const isClosed = task.status === 'closed';
  const isOverdue = task.isOverdue === true && !isClosed;

  return (
    <button
      type="button"
      className={`${styles.row}${isClosed ? ` ${styles.rowClosed}` : ''}`}
      onClick={() => onClick(task)}
      data-testid={`task-row-${task.id}`}
    >
      <Flex align="center" gap={12} style={{ width: '100%' }}>
        {/* Checkbox on the right (RTL — flex row, first child is inline-end) */}
        <Flex align="center" className={styles.checkbox} data-testid="task-checkbox">
          {isClosed ? (
            <MdCheckBox size={20} color="#A8C5A0" />
          ) : (
            <MdCheckBoxOutlineBlank size={20} color="#BDBDBD" />
          )}
        </Flex>

        {/* Main content — grows to fill */}
        <Flex vertical gap={4} style={{ flex: 1, textAlign: 'right' }}>
          <Flex justify="space-between" align="center" gap={8}>
            <span
              className={`${styles.name}${isClosed ? ` ${styles.nameClosed}` : ''}`}
              data-testid="task-name"
            >
              {task.name}
            </span>
            <Tag
              color={statusProps.color}
              style={statusProps.style}
              data-testid="task-status-badge"
            >
              {statusProps.label}
            </Tag>
          </Flex>

          <Flex justify="space-between" align="center">
            <Flex gap={8} align="center">
              <span className={styles.category} data-testid="task-category">
                {task.category}
              </span>
              {task.dueDate && (
                <span
                  className={`${styles.dueDate}${isOverdue ? ` ${styles.dueDateOverdue}` : ''}`}
                  data-testid="task-due-date"
                >
                  {t('tasks.dueDate')} {task.dueDate}
                </span>
              )}
            </Flex>
            {/* Chevron on the left (inline-start in RTL) */}
            <MdChevronLeft size={18} color="#BDBDBD" />
          </Flex>
        </Flex>
      </Flex>
    </button>
  );
}
