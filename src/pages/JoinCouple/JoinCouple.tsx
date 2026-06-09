import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button, Flex, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getCoupleInvite, acceptCoupleInvite } from '../../lib/firestore/coupleInvites';
import type { CoupleInviteInfo } from '../../lib/firestore/coupleInvites';
import { signInWithGoogle } from '../../lib/firebase';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectAuthStatus, selectAuthUid, selectCoupleId, setCoupleId } from '../../features/auth/authSlice';
import styles from './JoinCouple.module.scss';

declare global {
  interface Window {
    __PLAYWRIGHT_JOIN_INVITE__?: CoupleInviteInfo | null | 'loading';
    __PLAYWRIGHT_ACCEPT_INVITE__?: { coupleId: string } | 'error';
    __PLAYWRIGHT_ACCEPT_INVITE_CALLED__?: number;
  }
}

type JoinState = 'idle' | 'joining' | 'success' | 'error';

export function JoinCouple() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector(selectAuthStatus);
  const uid = useAppSelector(selectAuthUid);
  const existingCoupleId = useAppSelector(selectCoupleId);

  const [joinState, setJoinState] = useState<JoinState>('idle');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const { data: invite, isLoading: inviteLoading } = useQuery({
    queryKey: ['coupleInvite', token],
    queryFn: (): Promise<CoupleInviteInfo | null> => {
      if (typeof window !== 'undefined' && '__PLAYWRIGHT_JOIN_INVITE__' in window) {
        const seam = window.__PLAYWRIGHT_JOIN_INVITE__;
        if (seam === 'loading') return new Promise<CoupleInviteInfo | null>(() => {});
        return Promise.resolve(seam ?? null);
      }
      return getCoupleInvite(token!);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  async function handleSignIn() {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // AuthListener will re-run and update Redux auth state
    } catch {
      setSigningIn(false);
    }
  }

  async function handleJoin() {
    if (!token) return;
    setJoinState('joining');
    setJoinError(null);
    try {
      let result: { coupleId: string };
      if (typeof window !== 'undefined' && '__PLAYWRIGHT_ACCEPT_INVITE__' in window) {
        window.__PLAYWRIGHT_ACCEPT_INVITE_CALLED__ = (window.__PLAYWRIGHT_ACCEPT_INVITE_CALLED__ ?? 0) + 1;
        const seam = window.__PLAYWRIGHT_ACCEPT_INVITE__;
        if (seam === 'error') throw new Error('mock error');
        result = seam!;
      } else {
        result = await acceptCoupleInvite(token);
      }
      dispatch(setCoupleId(result.coupleId));
      setJoinState('success');
      setTimeout(() => void navigate('/dashboard'), 1500);
    } catch {
      setJoinState('error');
      setJoinError('אירעה שגיאה. ייתכן שהקישור פג תוקף או כבר שומש.');
    }
  }

  // ── Loading states ────────────────────────────────────────────────────────

  if (authStatus === 'idle' || authStatus === 'loading' || inviteLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <Flex justify="center" align="center" style={{ minHeight: 120 }}>
            <Spin size="large" />
          </Flex>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ───────────────────────────────────────────────

  if (!invite) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.title}>קישור לא תקין</div>
          <div className={styles.subtitle}>הקישור לא נמצא. בקשו מבן/בת הזוג לשלוח קישור חדש.</div>
        </div>
      </div>
    );
  }

  if (invite.expired) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.title}>הקישור פג תוקף</div>
          <div className={styles.subtitle}>
            הקישור תקף ל-7 ימים בלבד. בקשו מבן/בת הזוג לשלוח קישור חדש מהגדרות האפליקציה.
          </div>
        </div>
      </div>
    );
  }

  if (invite.alreadyUsed) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.title}>קישור כבר שומש</div>
          <div className={styles.subtitle}>
            כבר הצטרף/ה משתמש לחשבון זה. אם זה לא אתם, פנו לתמיכה.
          </div>
        </div>
      </div>
    );
  }

  // ── Success — checked before existingCoupleId so the screen renders after joining ──

  if (joinState === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src="/transparent-icon-no-text.png" alt="" className={styles.logoImg} />
          </div>
          <div className={styles.title}>ברוכים הבאים! 🎉</div>
          <div className={styles.successText}>
            הצטרפתם בהצלחה לתכנון החתונה של {invite.coupleNames}
          </div>
        </div>
      </div>
    );
  }

  // ── User already belongs to a couple ─────────────────────────────────────

  if (existingCoupleId) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.title}>כבר מחוברים לחשבון</div>
          <div className={styles.subtitle}>
            אתם כבר שייכים לחשבון זוגי. לא ניתן להצטרף לחשבון נוסף.
          </div>
          <Button block onClick={() => void navigate('/dashboard')} style={{ marginTop: 20 }}>
            חזרה לאפליקציה
          </Button>
        </div>
      </div>
    );
  }

  // ── Main flow ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.page} data-testid="join-couple-page">
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/transparent-icon-no-text.png" alt="" className={styles.logoImg} />
        </div>

        <div className={styles.title}>הצטרפו לתכנון</div>
        <div className={styles.subtitle}>הוזמנתם לנהל את האירוע יחד עם</div>
        <div className={styles.coupleNames}>{invite.coupleNames}</div>

        {authStatus !== 'authenticated' || !uid ? (
          /* ── Not signed in: sign in first ─── */
          <>
            <div className={styles.subtitle} style={{ marginBottom: 16 }}>
              יש להתחבר תחילה כדי להצטרף
            </div>
            <Button
              className={styles.joinBtn}
              onClick={() => void handleSignIn()}
              loading={signingIn}
              data-testid="join-sign-in-btn"
            >
              התחברות עם Google
            </Button>
            <div className={styles.signInNote}>
              אם אין לכם חשבון, ייצור אחד אוטומטית
            </div>
          </>
        ) : (
          /* ── Signed in: show join button ─── */
          <>
            <Button
              className={styles.joinBtn}
              onClick={() => void handleJoin()}
              loading={joinState === 'joining'}
              data-testid="join-couple-btn"
            >
              הצטרפות לתכנון
            </Button>
            {joinError && (
              <div className={styles.errorText} data-testid="join-error">
                {joinError}
              </div>
            )}
            <div className={styles.signInNote}>
              מחובר/ת בתור {uid}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
