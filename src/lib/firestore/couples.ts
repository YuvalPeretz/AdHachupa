import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { CoupleDoc } from './types';

export async function getCouple(uid: string): Promise<CoupleDoc | null> {
  const snap = await getDoc(doc(db, 'couples', uid));
  if (!snap.exists()) return null;
  return snap.data() as unknown as CoupleDoc;
}

export async function setCouple(
  uid: string,
  data: Omit<CoupleDoc, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  await setDoc(doc(db, 'couples', uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
