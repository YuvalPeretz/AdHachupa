import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import type { BillingUnit } from '../../types';

interface BillingUnitSelectorProps {
  value: BillingUnit;
  onChange: (unit: BillingUnit) => void;
  disabled?: boolean;
}

export function BillingUnitSelector({ value, onChange, disabled }: BillingUnitSelectorProps) {
  const { t } = useTranslation('common');

  const options: { label: string; value: BillingUnit }[] = [
    { label: t('billingUnit.per_item'), value: 'per_item' },
    { label: t('billingUnit.per_guest'), value: 'per_guest' },
    { label: t('billingUnit.per_hour'), value: 'per_hour' },
  ];

  return (
    <Segmented<BillingUnit>
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: '100%' }}
      data-testid="billing-unit-selector"
    />
  );
}
