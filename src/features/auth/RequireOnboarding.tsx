import { Navigate } from 'react-router';
import { Flex, Spin } from 'antd';
import { useAppSelector } from '../../store';
import { selectAuthStatus, selectCoupleId } from './authSlice';
import styles from './authGuard.module.scss';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Route guard for onboarding wizard steps.
 *
 *   unauthenticated              → /onboarding/welcome
 *   authenticated + coupleId set → /dashboard (already done onboarding)
 *   authenticated + no coupleId  → render wizard step
 *
 * AuthListener resolves coupleId from users/{uid} before setting status to
 * 'authenticated', so no separate Firestore check is needed here.
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const status = useAppSelector(selectAuthStatus);
  const coupleId = useAppSelector(selectCoupleId);

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

  if (coupleId !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
