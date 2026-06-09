/**
 * Firestore data functions for the vendors domain.
 *
 * Playwright seams ensure vendor data is available in tests
 * without touching real Firebase.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import type { Vendor, Task } from '../../types';
import type { VendorDoc } from './types';
import { docToVendor } from './converters';

// ─── Playwright seam ──────────────────────────────────────────────────────────

function inPlaywright(): boolean {
  return typeof window !== 'undefined' && '__PLAYWRIGHT_AUTH_MOCK__' in window;
}

// Seam vendors — task-1 has two "considering" vendors; other tasks have none
const BASE_VENDORS_TASK_1: Vendor[] = [
  { id: 'v1', name: 'DJ Alexander', status: 'considering', taskId: 'task-1', priceMin: 3_000, priceMax: 5_000, phone: '052-1234567', notes: 'ראינו בחתונה של חנה' },
  { id: 'v2', name: 'DJ מיכל', status: 'considering', taskId: 'task-1', priceMin: 4_000, priceMax: 6_000, phone: '054-7654321', notes: 'הומלץ על ידי הצלם' },
];

// Mutable state — reset on each page load (module scope)
let mutableVendors: Vendor[] = [...BASE_VENDORS_TASK_1];

function seamVendorsForTask(taskId: string): Vendor[] {
  return mutableVendors.filter((v) => v.taskId === taskId);
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export async function fetchVendors(taskId: string): Promise<Vendor[]> {
  if (inPlaywright()) return seamVendorsForTask(taskId);

  const q = query(collection(db, 'vendors'), where('taskId', '==', taskId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToVendor(d.id, d.data() as unknown as VendorDoc));
}

export async function addVendor(
  coupleId: string,
  taskId: string,
  data: Omit<Vendor, 'id' | 'status'>,
): Promise<Vendor> {
  if (inPlaywright()) {
    const newVendor: Vendor = { id: `v-${Date.now()}`, ...data, taskId, status: 'considering' };
    mutableVendors = [...mutableVendors, newVendor];
    return newVendor;
  }

  const vendorData = {
    coupleId,
    taskId,
    name: data.name,
    status: 'considering' as const,
    priceMin: data.priceMin,
    priceMax: data.priceMax,
    email: data.email,
    phone: data.phone,
    rating: data.rating,
    notes: data.notes,
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'vendors'), vendorData);
  return { id: ref.id, ...data, taskId, status: 'considering' };
}

export async function updateVendor(
  vendorId: string,
  updates: Partial<Omit<VendorDoc, 'coupleId' | 'taskId' | 'updatedAt'>>,
): Promise<void> {
  if (inPlaywright()) {
    mutableVendors = mutableVendors.map((v) =>
      v.id === vendorId ? { ...v, ...(updates as Partial<Vendor>) } : v,
    );
    return;
  }
  await updateDoc(doc(db, 'vendors', vendorId), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteVendor(vendorId: string): Promise<void> {
  if (inPlaywright()) {
    mutableVendors = mutableVendors.filter((v) => v.id !== vendorId);
    return;
  }
  await deleteDoc(doc(db, 'vendors', vendorId));
}

export async function selectVendor(
  coupleId: string,
  taskId: string,
  vendorId: string,
): Promise<{ task: Task; vendors: Vendor[] }> {
  if (inPlaywright()) {
    mutableVendors = mutableVendors.map((v) => ({
      ...v,
      status: v.id === vendorId ? ('selected' as const) : ('rejected' as const),
    }));
    const selectedVendor = mutableVendors.find((v) => v.id === vendorId);
    const seamTask: Task = {
      id: taskId, name: '', type: 'vendor', category: '', priority: 'essential',
      status: 'closed', isOverdue: false, eventId: 'evt-wedding',
      selectedVendorId: vendorId, notes: selectedVendor?.notes,
    };
    return { task: seamTask, vendors: seamVendorsForTask(taskId) };
  }

  const selectFn = httpsCallable<
    { coupleId: string; taskId: string; vendorId: string },
    { task: Task; vendors: Vendor[] }
  >(functions, 'selectVendor');
  const result = await selectFn({ coupleId, taskId, vendorId });
  return result.data;
}

export async function fetchVendorById(vendorId: string): Promise<Vendor | null> {
  if (inPlaywright()) {
    return mutableVendors.find((v) => v.id === vendorId) ?? null;
  }

  const snap = await getDoc(doc(db, 'vendors', vendorId));
  if (!snap.exists()) return null;
  return docToVendor(snap.id, snap.data() as unknown as VendorDoc);
}
