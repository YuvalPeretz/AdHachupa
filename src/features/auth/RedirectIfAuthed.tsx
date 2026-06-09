import { Navigate } from 'react-router';
import { Flex, Spin } from 'antd';
import { useAppSelector } from '../../store';
import { selectAuthStatus, selectCoupleId } from './authSlice';
import styles from './authGuard.module.scss';

interface RedirectIfAuthedProps {
  children: React.ReactNode;
}

/**
 * Route guard for / (Splash) and /onboarding/welcome.
 *
 *   loading / idle               → skeleton (no flash)
 *   authenticated + coupleId set → /dashboard (returning user)
 *   authenticated + no coupleId  → /onboarding/events (new user)
 *   unauthenticated              → render children
 */
export function RedirectIfAuthed({ children }: RedirectIfAuthedProps) {
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

  if (status === 'authenticated') {
    return <Navigate to={coupleId !== null ? '/dashboard' : '/onboarding/events'} replace />;
  }

  return <>{children}</>;
}
