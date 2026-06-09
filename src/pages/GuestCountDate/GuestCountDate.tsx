import { Checkbox, Flex, Typography, InputNumber } from 'antd';
import { DatePicker } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { OnboardingShell } from '../../features/onboarding/OnboardingShell';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setEventGuestCount,
  setEventDate,
  setEventSkipDate,
  selectSelectedEventTypes,
  selectEventConfigs,
} from '../../store/onboardingSlice';
import type { EventType } from '../../types';
import styles from './GuestCountDate.module.scss';

const { Title, Text } = Typography;

export function GuestCountDate() {
  const navigate = useNavigate();
  const { t } = useTranslation('onboarding');
  const dispatch = useAppDispatch();
  const selectedTypes = useAppSelector(selectSelectedEventTypes);
  const eventConfigs = useAppSelector(selectEventConfigs);

  function handleNext() {
    void navigate('/onboarding/budget');
  }

  function handleGuestCountChange(type: EventType, value: number | null) {
    dispatch(setEventGuestCount({ type, count: value ?? 1 }));
  }

  function handleDateChange(type: EventType, dateStr: string | null) {
    dispatch(setEventDate({ type, date: dateStr }));
  }

  function handleSkipDate(type: EventType, skip: boolean) {
    dispatch(setEventSkipDate({ type, skip }));
  }

  return (
    <OnboardingShell
      currentStep={3}
      totalSteps={5}
      onNext={handleNext}
      nextLabel={t('guestCount.next')}
      backPath="/onboarding/events"
    >
      <Title level={2} className={styles.title} data-testid="guest-count-title">
        {t('guestCount.title')}
      </Title>
      <Text className={styles.subtitle} data-testid="guest-count-subtitle">
        {t('guestCount.subtitle')}
      </Text>

      <Flex vertical gap={16} data-testid="event-cards">
        {selectedTypes.map((type) => {
          const config = eventConfigs[type];
          const guestCount = config?.guestCount ?? 100;
          const skipDate = config?.skipDate ?? false;
          const dateValue = config?.date ? dayjs(config.date) : null;

          return (
            <div
              key={type}
              className={styles.card}
              data-testid={`guest-count-card-${type}`}
            >
              <Text className={styles.eventLabel}>
                {t(`eventSelection.events.${type}`)}
              </Text>

              {/* Guest count input */}
              <Flex align="center" justify="space-between" className={styles.stepperRow}>
                <Text className={styles.stepperLabel}>{t('guestCount.guestsLabel')}</Text>
                <InputNumber
                  value={guestCount}
                  min={1}
                  max={2000}
                  step={10}
                  onChange={(val) => handleGuestCountChange(type, val)}
                  className={styles.guestInput}
                  data-testid={`stepper-value-${type}`}
                  controls
                />
              </Flex>

              {/* Month/year picker */}
              <Flex align="center" justify="space-between" className={styles.dateRow}>
                <Checkbox
                  checked={skipDate}
                  onChange={(e) => handleSkipDate(type, e.target.checked)}
                  data-testid={`skip-date-${type}`}
                >
                  <Text className={styles.skipLabel}>{t('guestCount.skipDate')}</Text>
                </Checkbox>
                <DatePicker
                  picker="month"
                  value={dateValue}
                  disabled={skipDate}
                  placeholder={t('guestCount.datePlaceholder')}
                  onChange={(date) => {
                    handleDateChange(type, date ? date.format('YYYY-MM-DD') : null);
                  }}
                  format="MM/YYYY"
                  data-testid={`date-picker-${type}`}
                  className={styles.datePicker}
                  allowClear
                />
              </Flex>
            </div>
          );
        })}
      </Flex>
    </OnboardingShell>
  );
}
