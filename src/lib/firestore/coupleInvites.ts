import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import type { CoupleInviteDoc } from './types';

export interface CoupleInviteInfo {
  coupleId: string;
  coupleNames: string;
  expired: boolean;
  alreadyUsed: boolean;
}

/**
 * Creates a partner invite token. Returns the token (doc id) which is used
 * to build the /join/:token URL shared with the partner.
 *
 * Expires in 7 days by default.
 */
export async function createCoupleInvite(
  coupleId: string,
  createdByUid: string,
  coupleNames: string,
  expiresInDays = 7,
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const ref = await addDoc(collection(db, 'coupleInvites'), {
    coupleId,
    createdByUid,
    coupleNames,
    expiresAt,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

/**
 * Reads a partner invite and validates it.
 * Returns null if the token doesn't exist.
 */
export async function getCoupleInvite(token: string): Promise<CoupleInviteInfo | null> {
  const snap = await getDoc(doc(db, 'coupleInvites', token));
  if (!snap.exists()) return null;

  const data = snap.data() as CoupleInviteDoc;
  const expiresAt = data.expiresAt.toDate();

  return {
    coupleId: data.coupleId,
    coupleNames: data.coupleNames,
    expired: expiresAt < new Date(),
    alreadyUsed: Boolean(data.usedByUid),
  };
}

/**
 * Accepts a partner invite by calling the `acceptCoupleInvite` Cloud Function.
 *
 * The CF atomically:
 *  1. Validates the token (not expired, not used)
 *  2. Writes users/{joiningUid} = { coupleId }
 *  3. Adds joiningUid to couples/{coupleId}.memberUids
 *  4. Marks coupleInvites/{token}.usedByUid = joiningUid
 *
 * Returns the coupleId so the client can update Redux immediately.
 */
export async function acceptCoupleInvite(token: string): Promise<{ coupleId: string }> {
  const fn = httpsCallable<{ token: string }, { coupleId: string }>(
    functions,
    'acceptCoupleInvite',
  );
  const result = await fn({ token });
  return result.data;
}
