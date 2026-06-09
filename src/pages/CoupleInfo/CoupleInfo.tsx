import { useState } from 'react';
import { Flex, Form, Input, Select, Switch, Typography, message } from 'antd';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { OnboardingShell } from '../../features/onboarding/OnboardingShell';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setCoupleInfo,
  selectCoupleInfo,
  selectSelectedEventTypes,
  selectEventConfigs,
  selectTotalBudget,
  resetOnboarding,
} from '../../store/onboardingSlice';
import type { Gender } from '../../store/onboardingSlice';
import { functions } from '../../lib/firebase';
import { createUserProfile } from '../../lib/firestore/couples';
import { selectAuthUid, setCoupleId } from '../../features/auth/authSlice';
import styles from './CoupleInfo.module.scss';

const { Title, Text } = Typography;

const GENDERS: Gender[] = ['female', 'male', 'other'];

const REGIONS = [
  'tel_aviv',
  'jerusalem',
  'haifa',
  'beer_sheva',
  'sharon',
  'shfela',
  'galil',
  'negev',
  'other',
] as const;

export function CoupleInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation('onboarding');
  const dispatch = useAppDispatch();
  const uid = useAppSelector(selectAuthUid);
  const coupleInfo = useAppSelector(selectCoupleInfo);
  const selectedTypes = useAppSelector(selectSelectedEventTypes);
  const eventConfigs = useAppSelector(selectEventConfigs);
  const totalBudget = useAppSelector(selectTotalBudget);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!coupleInfo.name1 || !coupleInfo.name2) return;
    setSubmitting(true);
    try {
      const onboardingFn = httpsCallable<unknown, { coupleId: string }>(functions, 'onboarding');
      const result = await onboardingFn({
        name1: coupleInfo.name1,
        name2: coupleInfo.name2,
        gender1: coupleInfo.gender1,
        gender2: coupleInfo.gender2,
        region: coupleInfo.region,
        isKosher: coupleInfo.isKosher,
        totalBudget: totalBudget ?? 0,
        uid: uid ?? '',
        events: selectedTypes.map((type) => ({
          type,
          label: t(`eventSelection.events.${type}`),
          date: eventConfigs[type]?.skipDate ? undefined : (eventConfigs[type]?.date ?? undefined),
          guestCount: eventConfigs[type]?.guestCount ?? 100,
        })),
      });
      const coupleId = result.data.coupleId;
      // Write users/{uid} → { coupleId } so Firestore security rules can resolve
      // the caller's couple on every subsequent read. The rules use
      // get(users/{uid}).data.coupleId; without this doc every query returns
      // PERMISSION_DENIED, causing an endless loading skeleton on the dashboard.
      if (uid && coupleId) {
        await createUserProfile(uid, coupleId);
      }
      dispatch(setCoupleId(coupleId));
      dispatch(resetOnboarding());
      void navigate('/onboarding/success');
    } catch (err) {
      void message.error('שגיאה בשמירת הנתונים. נסו שוב.');
      console.error('onboarding CF error', err);
    } finally {
      setSubmitting(false);
    }
  }

  function setName(field: 'name1' | 'name2', value: string) {
    dispatch(setCoupleInfo({ [field]: value }));
  }

  function setGender(field: 'gender1' | 'gender2', value: Gender) {
    dispatch(setCoupleInfo({ [field]: value }));
  }

  function setRegion(value: string) {
    dispatch(setCoupleInfo({ region: value }));
  }

  function setKosher(value: boolean) {
    dispatch(setCoupleInfo({ isKosher: value }));
  }

  return (
    <OnboardingShell
      currentStep={5}
      totalSteps={5}
      onNext={() => { void handleSubmit(); }}
      nextLabel={t('coupleInfo.submit')}
      nextDisabled={!coupleInfo.name1 || !coupleInfo.name2 || submitting}
      isSubmitting={submitting}
      backPath="/onboarding/budget"
    >
      <Title level={2} className={styles.title} data-testid="couple-info-title">
        {t('coupleInfo.title')}
      </Title>
      <Text className={styles.subtitle} data-testid="couple-info-subtitle">
        {t('coupleInfo.subtitle')}
      </Text>

      <Form layout="vertical" className={styles.form} data-testid="couple-info-form">
        {/* Names side by side */}
        <Flex gap={12} className={styles.nameRow} data-testid="name-fields">
          <Form.Item className={styles.nameItem}>
            <Input
              value={coupleInfo.name1}
              onChange={(e) => setName('name1', e.target.value)}
              placeholder={t('coupleInfo.name1Placeholder')}
              className={styles.nameInput}
              data-testid="couple-name1"
            />
          </Form.Item>
          <Form.Item className={styles.nameItem}>
            <Input
              value={coupleInfo.name2}
              onChange={(e) => setName('name2', e.target.value)}
              placeholder={t('coupleInfo.name2Placeholder')}
              className={styles.nameInput}
              data-testid="couple-name2"
            />
          </Form.Item>
        </Flex>

        {/* Gender selectors */}
        <Flex gap={12} className={styles.genderRow} data-testid="gender-fields">
          <Form.Item label={t('coupleInfo.genderLabel')} className={styles.genderItem}>
            <Flex gap={6} wrap data-testid="gender-chips-1">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.genderChip} ${coupleInfo.gender1 === g ? styles.genderChipActive : ''}`}
                  onClick={() => setGender('gender1', g)}
                  aria-pressed={coupleInfo.gender1 === g}
                  data-testid={`gender1-${g}`}
                >
                  {t(`coupleInfo.genders.${g}`)}
                </button>
              ))}
            </Flex>
          </Form.Item>
          <Form.Item label={t('coupleInfo.genderLabel')} className={styles.genderItem}>
            <Flex gap={6} wrap data-testid="gender-chips-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.genderChip} ${coupleInfo.gender2 === g ? styles.genderChipActive : ''}`}
                  onClick={() => setGender('gender2', g)}
                  aria-pressed={coupleInfo.gender2 === g}
                  data-testid={`gender2-${g}`}
                >
                  {t(`coupleInfo.genders.${g}`)}
                </button>
              ))}
            </Flex>
          </Form.Item>
        </Flex>

        {/* Region */}
        <Form.Item label={t('coupleInfo.regionLabel')} data-testid="region-field">
          <Select
            value={coupleInfo.region || undefined}
            onChange={setRegion}
            placeholder={t('coupleInfo.regionPlaceholder')}
            className={styles.regionSelect}
            data-testid="couple-region"
            options={REGIONS.map((r) => ({
              value: r,
              label: t(`coupleInfo.regions.${r}`),
            }))}
          />
        </Form.Item>

        {/* Kosher toggle */}
        <Flex align="center" justify="space-between" className={styles.kosherRow} data-testid="kosher-field">
          <Text className={styles.kosherLabel}>{t('coupleInfo.kosherLabel')}</Text>
          <Switch
            checked={coupleInfo.isKosher}
            onChange={setKosher}
            data-testid="couple-kosher"
            className={coupleInfo.isKosher ? styles.switchOn : ''}
          />
        </Flex>
      </Form>
    </OnboardingShell>
  );
}
