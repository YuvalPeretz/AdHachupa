import { Navigate } from 'react-router';
import { Flex, Spin } from 'antd';
import { useAppSelector } from '../../store';
import { selectAuthStatus, selectAuthUid } from './authSlice';
import { useCoupleByUid } from './useCoupleByUid';
import styles from './authGuard.module.scss';

interface RedirectIfAuthedProps {
  children: React.ReactNode;
}

/**
 * Route guard: protects / (Splash) and /onboarding/welcome.
 * Sends authenticated users to the right destination so they never see
 * the sign-in screens again on return visits.
 *
 * Auth state → Couple doc? → Landing:
 *   loading / idle            → show skeleton (no flash)
 *   authenticated + no couple → /onboarding/events (new user, start wizard)
 *   authenticated + couple    → /dashboard (returning user)
 *   unauthenticated           → render children (Splash / Welcome)
 */
export function RedirectIfAuthed({ children }: RedirectIfAuthedProps) {
  const status = useAppSelector(selectAuthStatus);
  const uid = useAppSelector(selectAuthUid);
  const { coupleExists, isLoading: coupleLoading } = useCoupleByUid(
    status === 'authenticated' ? uid : null,
  );

  // While Firebase auth resolves, show a skeleton — never flash the wrong screen
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
    // Still checking Firestore — keep showing skeleton
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

    return <Navigate to="/onboarding/events" replace />;
  }

  // Unauthenticated — render Splash or Welcome normally
  return <>{children}</>;
}
