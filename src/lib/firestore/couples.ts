import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { CoupleDoc, UserProfileDoc } from './types';

export async function getCouple(coupleId: string): Promise<CoupleDoc | null> {
  const snap = await getDoc(doc(db, 'couples', coupleId));
  if (!snap.exists()) return null;
  return snap.data() as unknown as CoupleDoc;
}

export async function setCouple(
  coupleId: string,
  data: Omit<CoupleDoc, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  await setDoc(doc(db, 'couples', coupleId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Reads users/{uid} → returns the coupleId for this user, or null if not found. */
export async function getUserProfile(uid: string): Promise<UserProfileDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfileDoc;
}

/** Writes users/{uid} = { coupleId }. Called by the onboarding CF response handler. */
export async function createUserProfile(uid: string, coupleId: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), { coupleId });
}
