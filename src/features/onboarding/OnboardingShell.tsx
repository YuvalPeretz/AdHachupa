import { Button, Flex, Progress, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FiArrowRight } from 'react-icons/fi';
import styles from './OnboardingShell.module.scss';

const { Text } = Typography;

interface OnboardingShellProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
  onBack?: () => void;
  backPath?: string;
  children: React.ReactNode;
}

export function OnboardingShell({
  currentStep,
  totalSteps,
  onNext,
  nextLabel,
  nextDisabled = false,
  isSubmitting = false,
  onBack,
  backPath,
  children,
}: OnboardingShellProps) {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (backPath) {
      void navigate(backPath);
    } else {
      void navigate(-1);
    }
  }

  return (
    <Flex vertical className={styles.shell} data-testid="onboarding-shell">
      <Flex vertical flex={1} className={styles.panel}>
        {/* Header: back button + progress */}
        <Flex
          align="center"
          justify="space-between"
          className={styles.header}
          data-testid="onboarding-header"
        >
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label={t('progress.step', {
              current: currentStep,
              total: totalSteps,
            })}
            data-testid="onboarding-back"
          >
            <FiArrowRight size={22} />
          </button>
          <Text className={styles.stepLabel} data-testid="onboarding-step-label">
            {t('progress.step', { current: currentStep, total: totalSteps })}
          </Text>
        </Flex>

        {/* Progress bar */}
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="#C9A97A"
          railColor="#F2C4CE"
          className={styles.progress}
          data-testid="onboarding-progress"
        />

        {/* Page content */}
        <Flex vertical flex={1} className={styles.content}>
          {children}
        </Flex>

        {/* Next button */}
        {onNext && (
          <div className={styles.footer} data-testid="onboarding-footer">
            <Button
              type="primary"
              size="large"
              block
              disabled={nextDisabled}
              loading={isSubmitting}
              onClick={onNext}
              data-testid="onboarding-next"
            >
              {nextLabel ?? t('eventSelection.next')}
            </Button>
          </div>
        )}
      </Flex>
    </Flex>
  );
}
