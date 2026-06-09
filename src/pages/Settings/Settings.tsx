import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Input, Modal, Skeleton, Switch, Typography } from 'antd';
import { httpsCallable } from 'firebase/functions';
import { useQuery } from '@tanstack/react-query';
import { getCouple } from '../../lib/firestore/couples';
import { useAppSelector } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';
import { functions, signOutUser } from '../../lib/firebase';
import styles from './Settings.module.scss';

const { Title, Text } = Typography;

type Category = 'guests' | 'tasks' | 'budget' | 'couple';
const CATEGORIES: Category[] = ['guests', 'tasks', 'budget', 'couple'];

export function Settings() {
  const { t } = useTranslation('settings');
  const { t: tOnb } = useTranslation('onboarding');
  const navigate = useNavigate();
  const coupleId = useAppSelector(selectAuthUid) ?? '';

  const [selected, setSelected] = useState<Set<Category>>(new Set());
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const { data: couple, isLoading } = useQuery({
    queryKey: ['couple', coupleId],
    queryFn: () => getCouple(coupleId),
    enabled: Boolean(coupleId),
  });

  function toggle(cat: Category) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const hasSelection = selected.size > 0 || deleteAccount;
  const confirmValid = confirmText === t('danger.confirmWord');

  function openConfirm() {
    setConfirmText('');
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!confirmValid) return;
    setDeleting(true);
    try {
      const fn = httpsCallable(functions, 'deleteAllData');
      await fn({ categories: [...selected], deleteAccount });
      await signOutUser();
      void navigate('/onboarding/welcome');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    void navigate('/onboarding/welcome');
  }

  const selectedLabels = [
    ...[...selected].map((cat) => t(`danger.categories.${cat}.label`)),
    ...(deleteAccount ? [t('danger.deleteAccount.label')] : []),
  ];

  return (
    <div className={styles.page} data-testid="settings-page">
      <Title level={2} className={styles.pageTitle} data-testid="settings-title">
        {t('title')}
      </Title>

      {/* ── Couple info ─────────────────────────────────── */}
      <p className={styles.sectionLabel}>{t('sections.couple')}</p>
      <div className={styles.card} data-testid="settings-couple-card">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
        ) : couple ? (
          <Flex vertical gap={14}>
            <SettingRow label={t('couple.names')} value={`${couple.name1} ו${couple.name2}`} />
            <SettingRow
              label={t('couple.region')}
              value={tOnb(`coupleInfo.regions.${couple.region}`, { defaultValue: couple.region })}
            />
            <SettingRow
              label={t('couple.kosher')}
              value={couple.isKosher ? t('couple.kosherYes') : t('couple.kosherNo')}
            />
          </Flex>
        ) : null}
      </div>

      {/* ── Account ─────────────────────────────────────── */}
      <p className={styles.sectionLabel}>{t('sections.account')}</p>
      <div className={styles.card}>
        <Button
          block
          onClick={() => void handleSignOut()}
          data-testid="settings-sign-out"
          className={styles.signOutButton}
        >
          {t('account.signOut')}
        </Button>
      </div>

      {/* ── Danger zone ─────────────────────────────────── */}
      <p className={styles.sectionLabel}>{t('sections.danger')}</p>
      <div className={`${styles.card} ${styles.dangerCard}`}>
        <Text className={styles.dangerIntro}>{t('danger.intro')}</Text>

        <Flex vertical gap={0}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat}
              className={`${styles.deleteRow} ${i < CATEGORIES.length - 1 ? styles.deleteRowBorder : ''}`}
            >
              <Flex justify="space-between" align="center" gap={12}>
                <div className={styles.deleteRowText}>
                  <Text className={styles.deleteRowLabel}>{t(`danger.categories.${cat}.label`)}</Text>
                  <Text className={styles.deleteRowDesc}>{t(`danger.categories.${cat}.description`)}</Text>
                </div>
                <Switch
                  checked={selected.has(cat)}
                  onChange={() => toggle(cat)}
                  data-testid={`delete-switch-${cat}`}
                />
              </Flex>
            </div>
          ))}

          {/* Account deletion — visually separated */}
          <div className={`${styles.deleteRow} ${styles.deleteRowAccount}`}>
            <Flex justify="space-between" align="center" gap={12}>
              <div className={styles.deleteRowText}>
                <Text className={`${styles.deleteRowLabel} ${styles.deleteRowLabelDanger}`}>
                  {t('danger.deleteAccount.label')}
                </Text>
                <Text className={styles.deleteRowDesc}>{t('danger.deleteAccount.description')}</Text>
              </div>
              <Switch
                checked={deleteAccount}
                onChange={setDeleteAccount}
                data-testid="delete-switch-account"
              />
            </Flex>
          </div>
        </Flex>

        <Button
          danger
          type="primary"
          block
          disabled={!hasSelection}
          onClick={openConfirm}
          className={styles.deleteButton}
          data-testid="settings-delete-selected"
        >
          {t('danger.deleteButton')}
        </Button>
      </div>

      {/* ── Confirm modal ────────────────────────────────── */}
      <Modal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        title={t('danger.confirmTitle')}
        footer={null}
        centered
        width={360}
        destroyOnHidden
        data-testid="delete-confirm-modal"
      >
        <Flex vertical gap={14} style={{ paddingBlockStart: 8 }}>
          <Text style={{ fontSize: 14 }}>{t('danger.confirmWillDelete')}</Text>
          <ul className={styles.confirmList}>
            {selectedLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <Text style={{ fontSize: 14 }}>{t('danger.confirmDescription')}</Text>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('danger.confirmPlaceholder')}
            data-testid="delete-confirm-input"
            autoComplete="off"
          />
          <Flex gap={8} justify="flex-end">
            <Button onClick={() => setDeleteOpen(false)}>{t('danger.cancel')}</Button>
            <Button
              danger
              type="primary"
              disabled={!confirmValid}
              loading={deleting}
              onClick={() => void handleDelete()}
              data-testid="delete-confirm-button"
            >
              {deleting ? t('danger.deleting') : t('danger.confirmButton')}
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" align="center">
      <Text style={{ fontSize: 14, color: 'rgba(45,45,45,0.55)' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: 500 }}>{value}</Text>
    </Flex>
  );
}
