import { Flex, Tag, Rate, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Vendor } from '../../types';
import { getStatusTagProps } from '../../utils/statusConfig';
import styles from './VendorCard.module.scss';

interface VendorCardProps {
  vendor: Vendor;
  onSelect: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onSelect, onEdit }: VendorCardProps) {
  const { t } = useTranslation('common');
  const statusProps = getStatusTagProps(vendor.status);
  const isConsidering = vendor.status === 'considering';

  return (
    <div className={styles.card} data-testid={`vendor-card-${vendor.id}`}>
      {/* Header row: name + status badge */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Tag
          color={statusProps.color}
          style={statusProps.style}
          data-testid="vendor-status-badge"
        >
          {statusProps.label}
        </Tag>
        <span className={styles.name} data-testid="vendor-name">
          {vendor.name}
        </span>
      </Flex>

      {/* Star rating */}
      {vendor.rating !== undefined && (
        <Flex justify="flex-end" style={{ marginBottom: 8 }}>
          <Rate
            disabled
            value={vendor.rating}
            style={{ fontSize: 14, color: '#C9A97A' }}
          />
        </Flex>
      )}

      {/* Price range */}
      {(vendor.priceMin !== undefined || vendor.priceMax !== undefined) && (
        <Flex justify="space-between" align="center" className={styles.infoRow}>
          <span className={styles.value}>
            {vendor.priceMin !== undefined && vendor.priceMax !== undefined
              ? `₪${vendor.priceMin.toLocaleString()} – ₪${vendor.priceMax.toLocaleString()}`
              : vendor.priceMin !== undefined
                ? `מ-₪${vendor.priceMin.toLocaleString()}`
                : `עד ₪${vendor.priceMax!.toLocaleString()}`}
          </span>
          <span className={styles.label}>{t('vendors.priceRange')}</span>
        </Flex>
      )}

      {/* Contact */}
      {(vendor.phone || vendor.email) && (
        <Flex justify="space-between" align="center" className={styles.infoRow}>
          <span className={styles.value} data-testid="vendor-contact">
            {vendor.phone ?? vendor.email}
          </span>
          <span className={styles.label}>{t('vendors.contact')}</span>
        </Flex>
      )}

      {/* Payment row */}
      {(vendor.advancePaid !== undefined || vendor.balanceDue !== undefined) && (
        <div
          className={styles.paymentRow}
          data-testid="vendor-payment-row"
        >
          <Flex justify="space-between" align="center" className={styles.infoRow}>
            <span className={styles.value}>
              {vendor.advancePaid !== undefined
                ? `₪${vendor.advancePaid.toLocaleString()}`
                : '—'}
            </span>
            <span className={styles.label}>{t('vendors.advance')}</span>
          </Flex>
          <Flex justify="space-between" align="center" className={styles.infoRow}>
            <span className={styles.value}>
              {vendor.balanceDue !== undefined
                ? `₪${vendor.balanceDue.toLocaleString()}`
                : '—'}
            </span>
            <span className={styles.label}>{t('vendors.balance')}</span>
          </Flex>
        </div>
      )}

      {/* Actions */}
      <Flex justify="flex-start" gap={8} style={{ marginTop: 12 }}>
        <Button
          size="small"
          onClick={() => onEdit(vendor)}
          data-testid="vendor-edit-btn"
        >
          {t('vendors.edit')}
        </Button>
        {isConsidering && (
          <Button
            type="primary"
            size="small"
            onClick={() => onSelect(vendor)}
            data-testid="vendor-select-btn"
          >
            {t('vendors.setAsSelected')}
          </Button>
        )}
      </Flex>
    </div>
  );
}
