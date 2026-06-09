/**
 * ParentShare — /share/:token
 *
 * Standalone web-only page. No AppShell, no BottomNav, no app header.
 * Parents open this link in a browser to add their guests without logging in.
 */
import { useParams } from 'react-router';
import { Button, Flex, Input, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParentShare } from './useParentShare';
import styles from './ParentShare.module.scss';

export function ParentShare() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation('guests');
  const {
    tokenData,
    isLoading,
    sessionGuests,
    isSubmitted,
    addForm,
    setAddForm,
    handleAddGuest,
    handleSubmit,
    isAdding,
    isSubmitting,
  } = useParentShare(token ?? '');

  if (isLoading) {
    return (
      <div className={styles.page} data-testid="parent-share-loading">
        <div className={styles.header}>
          <Skeleton active title={{ width: 200 }} paragraph={{ rows: 1, width: 160 }} />
        </div>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  if (!tokenData?.valid) {
    return (
      <div className={styles.page} data-testid="parent-share-invalid">
        <div className={styles.invalidToken}>{t('share.invalidToken')}</div>
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="parent-share-page">
      {/* ── Header ────────────────────────────────────────── */}
      <div className={styles.header} data-testid="parent-share-header">
        <h1 className={styles.title}>{t('share.pageTitle')}</h1>
        <p className={styles.subtitle} data-testid="parent-share-subtitle">
          {t('share.subtitle', { coupleNames: tokenData.coupleNames })}
        </p>
      </div>

      {isSubmitted ? (
        /* ── Success state ──────────────────────────────── */
        <div className={styles.successCard} data-testid="parent-share-success">
          {t('share.submitSuccess')}
        </div>
      ) : (
        <>
          {/* ── Add guest form ───────────────────────────── */}
          <div className={styles.formCard} data-testid="parent-share-form">
            <div className={styles.formTitle}>{t('share.pageTitle')}</div>
            <Flex vertical gap={12}>
              {/* Name */}
              <div>
                <div className={styles.fieldLabel}>{t('share.namePlaceholder')}</div>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t('share.namePlaceholder')}
                  size="large"
                  data-testid="share-guest-name"
                />
              </div>

              {/* Phone */}
              <div>
                <div className={styles.fieldLabel}>{t('share.phonePlaceholder')}</div>
                <Input
                  value={addForm.phone}
                  onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder={t('share.phonePlaceholder')}
                  type="tel"
                  size="large"
                  data-testid="share-guest-phone"
                />
              </div>

              {/* Plus-ones stepper */}
              <div>
                <div className={styles.fieldLabel}>{t('share.plusOnesLabel')}</div>
                <Flex align="center" gap={12} data-testid="share-plus-ones-stepper">
                  <Button
                    onClick={() => setAddForm((p) => ({ ...p, plusOnes: Math.max(0, p.plusOnes - 1) }))}
                    disabled={addForm.plusOnes === 0}
                    data-testid="share-plus-ones-decrement"
                  >
                    −
                  </Button>
                  <span className={styles.stepperValue} data-testid="share-plus-ones-value">
                    {addForm.plusOnes}
                  </span>
                  <Button
                    onClick={() => setAddForm((p) => ({ ...p, plusOnes: p.plusOnes + 1 }))}
                    data-testid="share-plus-ones-increment"
                  >
                    +
                  </Button>
                </Flex>
              </div>

              <Button
                type="primary"
                block
                size="large"
                className={styles.addButton}
                onClick={handleAddGuest}
                loading={isAdding}
                disabled={!addForm.name.trim()}
                style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A', borderRadius: 12 }}
                data-testid="share-add-guest-btn"
              >
                {t('share.addButton')}
              </Button>
            </Flex>
          </div>

          {/* ── Session list ──────────────────────────────── */}
          {sessionGuests.length > 0 && (
            <div className={styles.sessionList} data-testid="share-session-list">
              <div className={styles.sessionTitle}>{t('share.sessionListTitle')}</div>
              {sessionGuests.map((guest) => (
                <Flex
                  key={guest.id}
                  justify="space-between"
                  align="center"
                  className={styles.sessionItem}
                  data-testid={`share-session-guest-${guest.id}`}
                >
                  <span className={styles.sessionItemName}>{guest.name}</span>
                  {guest.plusOnes > 0 && (
                    <span className={styles.sessionItemMeta}>
                      +{guest.plusOnes}
                    </span>
                  )}
                </Flex>
              ))}
            </div>
          )}

          {/* ── Submit button ─────────────────────────────── */}
          {sessionGuests.length > 0 && (
            <Button
              type="primary"
              block
              size="large"
              onClick={handleSubmit}
              loading={isSubmitting}
              style={{
                backgroundColor: '#A8C5A0',
                borderColor: '#A8C5A0',
                borderRadius: 12,
                height: 48,
              }}
              data-testid="share-submit-btn"
            >
              {t('share.submitButton')}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
