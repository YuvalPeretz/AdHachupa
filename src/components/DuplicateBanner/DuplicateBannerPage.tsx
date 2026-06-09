// TEST ONLY - remove after Phase 1
import { DuplicateBanner } from './DuplicateBanner';

export function DuplicateBannerPage() {
  return (
    <div
      style={{
        background: '#FDF6EC',
        minHeight: '100vh',
        padding: 20,
        direction: 'rtl',
      }}
      data-testid="duplicate-banner-page"
    >
      <DuplicateBanner count={3} onReview={() => {}} />
    </div>
  );
}
