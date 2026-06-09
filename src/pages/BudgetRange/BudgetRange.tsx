import { InputNumber, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { OnboardingShell } from '../../features/onboarding/OnboardingShell';
import { useAppDispatch, useAppSelector } from '../../store';
import { setTotalBudget, selectTotalBudget } from '../../store/onboardingSlice';
import styles from './BudgetRange.module.scss';

const { Title, Text } = Typography;

export function BudgetRange() {
  const navigate = useNavigate();
  const { t } = useTranslation('onboarding');
  const dispatch = useAppDispatch();
  const totalBudget = useAppSelector(selectTotalBudget);

  function handleNext() {
    void navigate('/onboarding/couple-info');
  }

  return (
    <OnboardingShell
      currentStep={4}
      totalSteps={5}
      onNext={handleNext}
      nextLabel={t('budgetRange.next')}
      nextDisabled={totalBudget == null || totalBudget <= 0}
      backPath="/onboarding/guest-count"
    >
      <Title level={2} className={styles.title} data-testid="budget-range-title">
        {t('budgetRange.title')}
      </Title>
      <Text className={styles.subtitle} data-testid="budget-range-subtitle">
        {t('budgetRange.subtitle')}
      </Text>

      <div className={styles.inputWrapper} data-testid="budget-input-wrapper">
        <InputNumber
          value={totalBudget}
          onChange={(v) => dispatch(setTotalBudget(v ?? 0))}
          min={0}
          step={5000}
          prefix="₪"
          size="large"
          style={{ width: '100%', direction: 'rtl' }}
          formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(v) => Number((v ?? '').replace(/,/g, '')) as unknown as 0}
          placeholder={t('budgetRange.inputPlaceholder')}
          data-testid="budget-total-input"
        />
      </div>

      <Text className={styles.helperText} data-testid="budget-helper-text">
        {t('budgetRange.helperText')}
      </Text>
    </OnboardingShell>
  );
}
