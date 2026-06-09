import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();

const CATEGORY_COLLECTIONS: Record<string, string[]> = {
  guests: ["guests", "dismissedDuplicates", "guestGifts"],
  tasks: ["tasks", "taskPayments", "taskVendorConfigs", "taskDecisions", "taskReminders", "vendors"],
  budget: ["budgetExpenses"],
  couple: ["events", "shareTokens", "scheduledNotifications"],
};

// Singleton docs keyed by uid (not by coupleId field)
const CATEGORY_SINGLETONS: Record<string, string[]> = {
  budget: ["budget"],
  couple: ["couples"],
};

async function deleteCollection(collectionName: string, coupleId: string): Promise<void> {
  const snap = await db
    .collection(collectionName)
    .where("coupleId", "==", coupleId)
    .get();

  if (snap.empty) return;

  for (let i = 0; i < snap.docs.length; i += 500) {
    const batch = db.batch();
    snap.docs.slice(i, i + 500).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

interface DeletePayload {
  categories: string[]; // e.g. ["guests", "tasks", "budget", "couple"]
  deleteAccount: boolean;
}

export const deleteAllData = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "auth required");

  const uid = request.auth.uid;
  const { categories = [], deleteAccount = false } = request.data as DeletePayload;

  // Delete all collections for each selected category in parallel
  const collectionDeletes = categories.flatMap(
    (cat) => (CATEGORY_COLLECTIONS[cat] ?? []).map((col) => deleteCollection(col, uid)),
  );
  await Promise.all(collectionDeletes);

  // Delete singleton docs for selected categories
  for (const cat of categories) {
    const singletons = CATEGORY_SINGLETONS[cat] ?? [];
    if (singletons.length > 0) {
      const batch = db.batch();
      singletons.forEach((col) => batch.delete(db.collection(col).doc(uid)));
      await batch.commit();
    }
  }

  // Delete Firebase Auth user last (after data is gone)
  if (deleteAccount) {
    await getAuth().deleteUser(uid);
  }

  return { success: true };
});
