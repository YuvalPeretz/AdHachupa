import { Typography } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import { OnboardingShell } from '../../features/onboarding/OnboardingShell';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  toggleEventType,
  selectSelectedEventTypes,
} from '../../store/onboardingSlice';
import type { EventType } from '../../types';
import styles from './EventSelection.module.scss';

const { Title, Text } = Typography;

const EVENT_TYPES: EventType[] = [
  'wedding',
  'henna',
  'party',
  'shabbat',
  'mikveh',
  'kabbalat_panim',
];

export function EventSelection() {
  const navigate = useNavigate();
  const { t } = useTranslation('onboarding');
  const dispatch = useAppDispatch();
  const selectedTypes = useAppSelector(selectSelectedEventTypes);

  function handleToggle(type: EventType) {
    dispatch(toggleEventType(type));
  }

  function handleNext() {
    void navigate('/onboarding/guest-count');
  }

  return (
    <OnboardingShell
      currentStep={2}
      totalSteps={5}
      onNext={handleNext}
      nextLabel={t('eventSelection.next')}
      nextDisabled={selectedTypes.length === 0}
      backPath="/onboarding/welcome"
    >
      <Title level={2} className={styles.title} data-testid="event-selection-title">
        {t('eventSelection.title')}
      </Title>
      <Text className={styles.subtitle} data-testid="event-selection-subtitle">
        {t('eventSelection.subtitle')}
      </Text>

      {/* 3×2 card grid — RTL so first card renders at top-right */}
      <div className={styles.grid} data-testid="event-grid">
        {EVENT_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => handleToggle(type)}
              aria-pressed={isSelected}
              data-testid={`event-card-${type}`}
            >
              {isSelected && (
                <span className={styles.checkmark} data-testid={`event-check-${type}`}>
                  <FiCheck size={16} />
                </span>
              )}
              <Text className={styles.cardLabel}>
                {t(`eventSelection.events.${type}`)}
              </Text>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.addOther}
        data-testid="event-add-other"
      >
        {t('eventSelection.addOther')}
      </button>
    </OnboardingShell>
  );
}
