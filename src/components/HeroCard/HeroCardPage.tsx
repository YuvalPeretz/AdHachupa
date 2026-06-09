// TEST ONLY - remove after Phase 1
import { HeroCard } from './HeroCard';

export function HeroCardPage() {
  return (
    <div
      style={{
        background: '#FDF6EC',
        minHeight: '100vh',
        padding: 20,
        direction: 'rtl',
      }}
      data-testid="hero-card-page"
    >
      <HeroCard
        eventType="חתונה"
        eventName="החתונה של יובל ושיר"
        daysLeft={87}
        date="12/09/2026"
        venue="אולם הגן הקסום, תל אביב"
        tasksCompleted={18}
        tasksTotal={42}
      />
    </div>
  );
}
