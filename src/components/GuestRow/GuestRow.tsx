import { Flex, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Guest } from '../../types';
import { getStatusTagProps } from '../../utils/statusConfig';
import styles from './GuestRow.module.scss';

interface GuestRowProps {
  guest: Guest;
  onClick: (guest: Guest) => void;
}

export function GuestRow({ guest, onClick }: GuestRowProps) {
  const { t } = useTranslation('common');
  const statusProps = getStatusTagProps(guest.rsvpStatus);
  const isCancelled = guest.rsvpStatus === 'cancelled';

  return (
    <button
      type="button"
      className={`${styles.row}${isCancelled ? ` ${styles.rowCancelled}` : ''}`}
      onClick={() => onClick(guest)}
      data-testid={`guest-row-${guest.id}`}
    >
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        {/* Status badge — on the left in RTL layout (logical inline-start) */}
        <Flex vertical align="flex-start" gap={4} data-testid="guest-rsvp-badge">
          <Tag color={statusProps.color} style={statusProps.style}>
            {statusProps.label}
          </Tag>
          {guest.tableNo && (
            <span className={styles.tableNo}>
              {t('guests.table')} {guest.tableNo}
            </span>
          )}
        </Flex>

        {/* Guest info — on the right in RTL layout */}
        <div className={styles.infoSlot}>
          <p
            className={`${styles.name}${isCancelled ? ` ${styles.nameCancelled}` : ''}`}
            data-testid="guest-name"
          >
            {guest.name}
          </p>
          <p className={styles.meta}>
            {t('guests.invitedBy')}: {guest.invitedBy}
            {guest.plusOnes > 0 && (
              <> · {guest.plusOnes} {t('guests.plusOnes')}</>
            )}
          </p>
        </div>
      </Flex>
    </button>
  );
}
