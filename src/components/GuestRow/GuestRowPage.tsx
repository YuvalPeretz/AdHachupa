// TEST ONLY - remove after Phase 1
import { Flex } from 'antd';
import { GuestRow } from './GuestRow';
import type { Guest } from '../../types';

const MOCK_GUESTS: Guest[] = [
  {
    id: 'guest-confirmed',
    name: 'דנה כהן',
    phone: '050-1234567',
    rsvpStatus: 'confirmed',
    invitedBy: 'הכלה',
    plusOnes: 1,
    tableNo: '5',
    eventIds: ['event-1'],
  },
  {
    id: 'guest-pending',
    name: 'אלון לוי',
    phone: '052-9876543',
    rsvpStatus: 'pending',
    invitedBy: 'החתן',
    plusOnes: 0,
    eventIds: ['event-1'],
  },
  {
    id: 'guest-cancelled',
    name: 'מיכל שמואלי',
    rsvpStatus: 'cancelled',
    invitedBy: 'הכלה',
    plusOnes: 2,
    eventIds: ['event-1'],
  },
];

export function GuestRowPage() {
  return (
    <div
      style={{
        background: '#FDF6EC',
        minHeight: '100vh',
        padding: 20,
        direction: 'rtl',
      }}
      data-testid="guest-row-page"
    >
      <Flex vertical gap={12}>
        {MOCK_GUESTS.map((guest) => (
          <GuestRow key={guest.id} guest={guest} onClick={() => {}} />
        ))}
      </Flex>
    </div>
  );
}
