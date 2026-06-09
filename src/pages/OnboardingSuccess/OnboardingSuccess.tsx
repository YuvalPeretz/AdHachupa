import { Button, Flex, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import styles from './OnboardingSuccess.module.scss';

const { Title, Text } = Typography;

export function OnboardingSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation('onboarding');

  function handleDashboard() {
    void navigate('/dashboard');
  }

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      className={styles.container}
      data-testid="onboarding-success-screen"
    >
      <Flex vertical align="center" className={styles.innerPanel}>
      {/* Gold checkmark circle */}
      <div className={styles.checkCircle} data-testid="success-check-circle" aria-hidden="true">
        <FiCheck size={56} className={styles.checkIcon} />
      </div>

      {/* Celebration sparkles */}
      <div className={styles.sparkles} aria-hidden="true">
        <svg
          width="200"
          height="80"
          viewBox="0 0 200 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="5" fill="#F2C4CE" fillOpacity="0.8" />
          <circle cx="50" cy="10" r="3" fill="#C9A97A" fillOpacity="0.7" />
          <circle cx="90" cy="5" r="4" fill="#F2C4CE" fillOpacity="0.6" />
          <circle cx="130" cy="8" r="3" fill="#C9A97A" fillOpacity="0.75" />
          <circle cx="170" cy="18" r="5" fill="#F2C4CE" fillOpacity="0.7" />
          <circle cx="185" cy="50" r="4" fill="#C9A97A" fillOpacity="0.5" />
          <circle cx="10" cy="55" r="3" fill="#C9A97A" fillOpacity="0.6" />
          <circle cx="40" cy="65" r="5" fill="#F2C4CE" fillOpacity="0.5" />
          <circle cx="100" cy="70" r="3" fill="#C9A97A" fillOpacity="0.65" />
          <circle cx="160" cy="62" r="4" fill="#F2C4CE" fillOpacity="0.6" />
          {/* Confetti lines */}
          <rect x="68" y="12" width="4" height="14" rx="2" fill="#C9A97A" fillOpacity="0.5" transform="rotate(15 68 12)" />
          <rect x="140" y="5" width="4" height="14" rx="2" fill="#F2C4CE" fillOpacity="0.6" transform="rotate(-20 140 5)" />
          <rect x="25" y="35" width="4" height="12" rx="2" fill="#F2C4CE" fillOpacity="0.5" transform="rotate(30 25 35)" />
          <rect x="175" y="32" width="3" height="12" rx="2" fill="#C9A97A" fillOpacity="0.6" transform="rotate(-15 175 32)" />
        </svg>
      </div>

      <Title
        level={1}
        className={styles.title}
        data-testid="success-title"
      >
        {t('success.title')}
      </Title>
      <Text className={styles.subtitle} data-testid="success-subtitle">
        {t('success.subtitle')}
      </Text>

      <Button
        type="primary"
        size="large"
        block
        onClick={handleDashboard}
        data-testid="success-cta"
        className={styles.ctaButton}
      >
        {t('success.cta')}
      </Button>
      </Flex>
    </Flex>
  );
}
