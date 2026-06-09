import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { WeddingEvent } from '../../types';
import type { EventDoc } from './types';
import { docToEvent } from './converters';

export async function getEvents(coupleId: string): Promise<WeddingEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('coupleId', '==', coupleId),
    orderBy('date'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToEvent(d.id, d.data() as unknown as EventDoc));
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Pick<EventDoc, 'venue' | 'guestCountExpected' | 'date'>>,
): Promise<void> {
  await updateDoc(doc(db, 'events', eventId), updates as Record<string, unknown>);
}
