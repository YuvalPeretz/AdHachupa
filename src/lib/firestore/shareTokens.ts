import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/** Creates a new parent-share token document. Returns the token (doc id). */
export async function createShareToken(
  coupleId: string,
  coupleNames: string,
  label: string,
  eventIds: string[],
  expiresInDays = 30,
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const ref = await addDoc(collection(db, 'shareTokens'), {
    coupleId,
    coupleNames,
    label,
    eventIds,
    expiresAt,
    submitted: false,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export { fetchShareToken, addShareGuest, submitShareList } from './guests';
