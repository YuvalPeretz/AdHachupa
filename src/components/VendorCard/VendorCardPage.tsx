// TEST ONLY - remove after Phase 1
import { Flex } from 'antd';
import { VendorCard } from './VendorCard';
import type { Vendor } from '../../types';

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor-selected',
    name: 'סטודיו לימור כהן',
    status: 'selected',
    priceMin: 8000,
    priceMax: 12000,
    phone: '052-1234567',
    rating: 5,
    advancePaid: 3000,
    balanceDue: 7000,
  },
  {
    id: 'vendor-considering',
    name: 'צלמים ירושלמי',
    status: 'considering',
    priceMin: 6000,
    priceMax: 9000,
    phone: '054-9876543',
    rating: 4,
    advancePaid: 0,
    balanceDue: 7500,
  },
  {
    id: 'vendor-rejected',
    name: 'גלריה ראשון',
    status: 'rejected',
    priceMin: 15000,
    priceMax: 20000,
    phone: '050-1112233',
    rating: 3,
  },
];

export function VendorCardPage() {
  return (
    <div
      style={{
        background: '#FDF6EC',
        minHeight: '100vh',
        padding: 20,
        direction: 'rtl',
      }}
      data-testid="vendor-card-page"
    >
      <Flex vertical gap={16}>
        {MOCK_VENDORS.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onSelect={() => {}}
            onEdit={() => {}}
          />
        ))}
      </Flex>
    </div>
  );
}
