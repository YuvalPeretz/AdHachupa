import { Flex, Progress, Skeleton } from 'antd';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { IoSettingsOutline } from 'react-icons/io5';
import { HeroCard } from '../../components/HeroCard/HeroCard';
import { useDashboard } from './useDashboard';
import type { Task } from '../../types';
import styles from './Dashboard.module.scss';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BudgetCardProps {
  totalBudget: number;
  totalSpent: number;
  giftIncome: number;
  breakeven: number;
}

function BudgetCard({ totalBudget, totalSpent, giftIncome, breakeven }: BudgetCardProps) {
  const { t } = useTranslation('dashboard');
  const progressPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const isPositive = breakeven >= 0;

  return (
    <div className={styles.budgetCard} data-testid="budget-card">
      {/* Spent / Total amounts */}
      <Flex align="baseline" gap={6} className={styles.budgetAmounts}>
        <span className={styles.budgetSpent} data-testid="budget-spent">
          {formatCurrency(totalSpent)}
        </span>
        <span className={styles.budgetTotal}>
          / {formatCurrency(totalBudget)}
        </span>
      </Flex>

      {/* Progress bar — fills right-to-left via RTL direction on the container */}
      <div data-testid="budget-progress-bar">
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#C9A97A"
          railColor="rgba(45,45,45,0.08)"
          strokeLinecap="round"
        />
      </div>

      {/* Gift income + breakeven */}
      <Flex justify="space-between" className={styles.budgetMeta} data-testid="budget-meta">
        <span className={styles.giftRow}>
          {t('budget.giftIncome')}:{' '}
          <span className={styles.giftAmount} data-testid="gift-income">
            {formatCurrency(giftIncome)}
          </span>
        </span>
        <span
          className={isPositive ? styles.breakevenPositive : styles.breakevenNegative}
          data-testid="breakeven-value"
          data-breakeven-positive={isPositive ? 'true' : 'false'}
        >
          {isPositive
            ? `${t('budget.breakevenPositive')} ${formatCurrency(breakeven)}`
            : `${t('budget.breakevenNegative')} ${formatCurrency(Math.abs(breakeven))}`}
        </span>
      </Flex>
    </div>
  );
}

interface VendorChipsProps {
  vendors: { id: string; name: string }[];
}

function VendorChips({ vendors }: VendorChipsProps) {
  const { t } = useTranslation('dashboard');

  if (vendors.length === 0) {
    return (
      <p className={styles.otherEventMeta} data-testid="vendors-empty">
        {t('vendors.empty')}
      </p>
    );
  }

  return (
    <div
      className={styles.vendorScroll}
      data-testid="vendor-chips"
      role="list"
      aria-label="ספקים נבחרים"
    >
      {vendors.map((vendor) => {
        const initials = vendor.name.charAt(0);
        return (
          <div key={vendor.id} className={styles.vendorChip} role="listitem">
            <span className={styles.vendorAvatar} aria-hidden="true">
              {initials}
            </span>
            <span>{vendor.name}</span>
          </div>
        );
      })}
    </div>
  );
}

interface TaskMiniListProps {
  tasks: Task[];
}

function TaskMiniList({ tasks }: TaskMiniListProps) {
  const { t } = useTranslation('dashboard');

  if (tasks.length === 0) {
    return <p className={styles.otherEventMeta} data-testid="tasks-mini-empty">{t('tasks.empty')}</p>;
  }

  const STATUS_LABEL: Record<string, string> = {
    inProgress: 'בתהליך',
    notStarted: 'טרם התחיל',
    closed: 'הושלם',
  };

  return (
    <div data-testid="tasks-mini-list">
      {tasks.map((task) => (
        <div key={task.id} className={styles.taskRow} data-testid="task-mini-row">
          <span className={styles.taskName}>{task.name}</span>
          <span
            className={`${styles.taskBadge} ${task.isOverdue ? styles.taskBadgeOverdue : task.status === 'inProgress' ? styles.taskBadgeInProgress : styles.taskBadgeNotStarted}`}
          >
            {task.isOverdue ? 'באיחור' : STATUS_LABEL[task.status] ?? task.status}
          </span>
        </div>
      ))}
      <Link to="/tasks" className={styles.seeAllLink} data-testid="tasks-see-all">
        {t('tasks.seeAll')}
      </Link>
    </div>
  );
}

interface OtherEventsListProps {
  events: { id: string; label: string; date?: string; daysLeft: number }[];
}

function OtherEventsList({ events }: OtherEventsListProps) {
  const { t } = useTranslation('dashboard');

  if (events.length === 0) {
    return (
      <p className={styles.otherEventMeta} data-testid="other-events-empty">
        {t('otherEvents.empty')}
      </p>
    );
  }

  return (
    <div data-testid="other-events-list">
      {events.map((event) => (
        <div key={event.id} className={styles.otherEventCard} data-testid="other-event-card">
          <Flex justify="space-between" align="center">
            <div>
              <p className={styles.otherEventName}>{event.label}</p>
              {event.date && (
                <p className={styles.otherEventMeta}>{event.date}</p>
              )}
            </div>
            <span className={styles.otherEventDays}>
              {t('otherEvents.daysLeft', { days: event.daysLeft })}
            </span>
          </Flex>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className={styles.page} data-testid="dashboard-skeleton">
      {/* Greeting skeleton */}
      <div className={styles.skeletonSection}>
        <Skeleton active title={{ width: 180 }} paragraph={{ rows: 1, width: 120 }} />
      </div>
      {/* Hero card skeleton */}
      <div className={styles.skeletonSection}>
        <Skeleton.Button
          active
          block
          style={{ height: 180, borderRadius: 16 }}
        />
      </div>
      {/* Budget card skeleton */}
      <div className={styles.skeletonSection}>
        <Skeleton.Button
          active
          block
          style={{ height: 110, borderRadius: 16 }}
        />
      </div>
      {/* Vendor chips skeleton */}
      <div className={styles.skeletonSection}>
        <Flex gap={8}>
          {[1, 2, 3].map((i) => (
            <Skeleton.Button
              key={i}
              active
              style={{ width: 100, borderRadius: 9999, height: 36 }}
            />
          ))}
        </Flex>
      </div>
      {/* Other events skeleton */}
      <div className={styles.skeletonSection}>
        <Skeleton.Button
          active
          block
          style={{ height: 72, borderRadius: 16 }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Dashboard() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className={styles.page} data-testid="dashboard-error">
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ fontSize: 16, color: 'rgba(45,45,45,0.65)', marginBottom: 20 }}>
            שגיאה בטעינת הנתונים. בדקו את החיבור לאינטרנט ונסו שוב.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#C9A97A',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 15,
              cursor: 'pointer',
            }}
            data-testid="dashboard-retry-btn"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const { upcomingEvent, taskProgress, upcomingTasks, budget, vendors, otherEvents, coupleNames } = data;

  return (
    <div className={styles.page} data-testid="dashboard-page">
      {/* ── 1. Greeting ────────────────────────────────── */}
      <div data-testid="dashboard-greeting">
        <Flex justify="space-between" align="center">
          <h1 className={styles.greeting}>{t('greeting', { names: coupleNames })}</h1>
          <button
            className={styles.settingsButton}
            onClick={() => void navigate('/settings')}
            aria-label="הגדרות"
            data-testid="dashboard-settings-button"
          >
            <IoSettingsOutline size={22} />
          </button>
        </Flex>
        {upcomingEvent && (
          <p className={styles.greetingSubtitle}>
            {t('daysUntil', {
              days: upcomingEvent.daysLeft,
              eventType: upcomingEvent.label,
            })}
          </p>
        )}
      </div>

      {/* ── 2. HeroCard — upcoming event ───────────────── */}
      {upcomingEvent && (
        <HeroCard
          eventType={upcomingEvent.label}
          eventName={`ה${upcomingEvent.label} של ${coupleNames}`}
          daysLeft={upcomingEvent.daysLeft}
          date={upcomingEvent.date ?? ''}
          venue={upcomingEvent.venue ?? ''}
          tasksCompleted={taskProgress.completed}
          tasksTotal={taskProgress.total}
        />
      )}

      {/* ── 3. Upcoming tasks mini list ────────────────── */}
      <p className={styles.sectionTitle}>{t('sections.tasks')}</p>
      <TaskMiniList tasks={upcomingTasks} />

      {/* ── 4. Budget summary card ─────────────────────── */}
      <p className={styles.sectionTitle}>{t('sections.budget')}</p>
      <BudgetCard
        totalBudget={budget.totalBudget}
        totalSpent={budget.totalSpent}
        giftIncome={budget.giftIncome}
        breakeven={budget.breakeven}
      />

      {/* ── 4. Vendor chips ────────────────────────────── */}
      <p className={styles.sectionTitle}>{t('sections.vendors')}</p>
      <VendorChips vendors={vendors.slice(0, 6)} />

      {/* ── 5. Other events ────────────────────────────── */}
      {otherEvents.length > 0 && (
        <>
          <p className={styles.sectionTitle}>{t('sections.otherEvents')}</p>
          <OtherEventsList events={otherEvents} />
        </>
      )}

      {/* ── 6. Settings ────────────────────────────────── */}
      <p className={styles.sectionTitle}>{t('sections.settings')}</p>
      <button
        className={styles.settingsCard}
        onClick={() => void navigate('/settings')}
        data-testid="dashboard-settings-card"
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={10}>
            <IoSettingsOutline size={20} className={styles.settingsCardIcon} />
            <span className={styles.settingsCardLabel}>{t('settings.label')}</span>
          </Flex>
          <span className={styles.settingsCardChevron}>‹</span>
        </Flex>
      </button>
    </div>
  );
}
