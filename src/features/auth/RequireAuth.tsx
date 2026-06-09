import { Navigate } from 'react-router';
import { Flex, Spin } from 'antd';
import { useAppSelector } from '../../store';
import { selectAuthStatus } from './authSlice';
import styles from './authGuard.module.scss';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Route guard: protects /onboarding/* (wizard steps) and all main-app routes.
 * - While auth is resolving (idle / loading) → show a loading skeleton so
 *   the wrong screen never flashes.
 * - Unauthenticated → redirect to /onboarding/welcome (sign-in entry point).
 * - Authenticated → render children.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const status = useAppSelector(selectAuthStatus);

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

  return <>{children}</>;
}
