// TEST ONLY - remove after Phase 1
import { Flex } from 'antd';
import { TaskRow } from './TaskRow';
import type { Task } from '../../types';

const MOCK_TASKS: Task[] = [
  {
    id: 'task-not-started',
    name: 'בחירת אולם אירועים',
    type: 'vendor',
    category: 'אולם ותפעול',
    priority: 'essential',
    status: 'notStarted',
    dueDate: '01/09/2026',
    isOverdue: false,
    eventId: 'event-1',
  },
  {
    id: 'task-in-progress',
    name: 'בחירת צלם',
    type: 'vendor',
    category: 'ספקים',
    priority: 'essential',
    status: 'inProgress',
    dueDate: '15/08/2026',
    isOverdue: false,
    eventId: 'event-1',
  },
  {
    id: 'task-closed',
    name: 'רישום לרבנות',
    type: 'reminder',
    category: 'אחר',
    priority: 'logistic',
    status: 'closed',
    dueDate: '01/06/2026',
    isOverdue: false,
    eventId: 'event-1',
  },
  {
    id: 'task-overdue',
    name: 'הזמנת תזמורת',
    type: 'vendor',
    category: 'ספקים',
    priority: 'aesthetic',
    status: 'inProgress',
    dueDate: '01/03/2026',
    isOverdue: true,
    eventId: 'event-1',
  },
];

export function TaskRowPage() {
  return (
    <div
      style={{
        background: '#FDF6EC',
        minHeight: '100vh',
        padding: 20,
        direction: 'rtl',
      }}
      data-testid="task-row-page"
    >
      <Flex vertical gap={12}>
        {MOCK_TASKS.map((task) => (
          <TaskRow key={task.id} task={task} onClick={() => {}} />
        ))}
      </Flex>
    </div>
  );
}
