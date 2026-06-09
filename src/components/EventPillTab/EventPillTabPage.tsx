// TEST ONLY - remove after Phase 1
import { useState } from 'react';
import { EventPillTab } from './EventPillTab';
import type { WeddingEvent } from '../../types';

const MOCK_EVENTS: WeddingEvent[] = [
  { id: 'event-1', type: 'wedding', label: 'חתונה' },
  { id: 'event-2', type: 'henna', label: 'חינה' },
  { id: 'event-3', type: 'kabbalat_panim', label: 'קבלת פנים' },
];

export function EventPillTabPage() {
  const [activeEventId, setActiveEventId] = useState('event-1');

  return (
    <div style={{ background: '#FDF6EC', minHeight: '100vh', padding: 20, direction: 'rtl' }}>
      <EventPillTab events={MOCK_EVENTS} activeEventId={activeEventId} onChange={setActiveEventId} />
    </div>
  );
}
