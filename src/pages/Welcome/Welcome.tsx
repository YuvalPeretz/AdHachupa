import { Button, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { signInWithGoogle } from '../../lib/firebase';
import styles from './Welcome.module.scss';

const { Title, Text } = Typography;

export function Welcome() {
  const { t } = useTranslation('onboarding');

  async function handleSignIn() {
    try {
      await signInWithGoogle();
      // Routing is handled by RedirectIfAuthed reacting to the new auth state.
      // No explicit navigate() call needed here.
    } catch (err) {
      // Popup closed by user or other non-fatal error — log and stay on page.
      console.error('[Welcome] signInWithGoogle error:', err);
    }
  }

  return (
    <Flex
      vertical
      align="center"
      justify="space-between"
      className={styles.container}
      data-testid="welcome-screen"
    >
      {/* Couple silhouette placeholder illustration */}
      <Flex vertical align="center" flex={1} justify="center">
        <div className={styles.illustration} data-testid="welcome-illustration" aria-hidden="true">
          <img
            src="/android-chrome-512x512.png"
            alt=""
            className={styles.illustrationIcon}
            width={260}
            height={260}
          />
        </div>

        <Title
          level={1}
          className={styles.heading}
          data-testid="welcome-heading"
        >
          {t('welcome.heading')}
        </Title>
        <Text className={styles.subheading} data-testid="welcome-subheading">
          {t('welcome.subheading')}
        </Text>
      </Flex>

      {/* CTA section */}
      <Flex vertical className={styles.ctaSection} gap={16}>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => void handleSignIn()}
          data-testid="welcome-cta"
          className={styles.ctaButton}
        >
          {t('welcome.cta')}
        </Button>
        <button
          type="button"
          className={styles.loginLink}
          onClick={() => void handleSignIn()}
          data-testid="welcome-login-link"
        >
          {t('welcome.loginLink')}
        </button>
      </Flex>
    </Flex>
  );
}
