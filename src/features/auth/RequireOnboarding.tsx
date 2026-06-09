import { Navigate } from 'react-router';
import { Flex, Spin } from 'antd';
import { useAppSelector } from '../../store';
import { selectAuthStatus, selectAuthUid } from './authSlice';
import { useCoupleByUid } from './useCoupleByUid';
import styles from './authGuard.module.scss';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Route guard for onboarding wizard steps (/onboarding/events through /onboarding/couple-info).
 *
 * Three-way decision:
 *   unauthenticated           → /onboarding/welcome (sign-in first)
 *   authenticated + couple    → /dashboard (already finished onboarding)
 *   authenticated + no couple → render the wizard step
 *
 * Note: /onboarding/success is intentionally NOT wrapped by this guard because the couple
 * doc is created right before navigating there — redirecting away would skip the celebration.
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const status = useAppSelector(selectAuthStatus);
  const uid = useAppSelector(selectAuthUid);
  const { coupleExists, isLoading: coupleLoading } = useCoupleByUid(
    status === 'authenticated' ? uid : null,
  );

  if (status === 'idle' || status === 'loading') {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        className={styles.loadingContainer}
        data-testid="auth-loading-skeleton"
      >
        <Spin size="large" />
      </Flex>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  if (coupleLoading) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        className={styles.loadingContainer}
        data-testid="auth-loading-skeleton"
      >
        <Spin size="large" />
      </Flex>
    );
  }

  if (coupleExists) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
