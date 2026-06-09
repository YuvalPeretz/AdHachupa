import { Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './DuplicateBanner.module.scss';

interface DuplicateBannerProps {
  count: number;
  onReview: () => void;
}

export function DuplicateBanner({ count, onReview }: DuplicateBannerProps) {
  const { t } = useTranslation('common');

  return (
    <Alert
      type="warning"
      className={styles.banner}
      data-testid="duplicate-banner"
      showIcon
      title={
        <span data-testid="duplicate-banner-message">
          {t('duplicateBanner.message', { count })}
        </span>
      }
      action={
        <Button
          size="small"
          type="text"
          onClick={onReview}
          data-testid="duplicate-banner-review-btn"
          className={styles.reviewBtn}
        >
          {t('duplicateBanner.review')}
        </Button>
      }
    />
  );
}
