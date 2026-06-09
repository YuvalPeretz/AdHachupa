import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

// ─── Shared recalculation helper ──────────────────────────────────────────────

async function recalculateBreakeven(coupleId: string): Promise<void> {
  const [expensesSnap, actualGiftsSnap, estimatedGiftsSnap, confirmedSnap, budgetSnap] =
    await Promise.all([
      db.collection("budgetExpenses").where("coupleId", "==", coupleId).get(),
      db.collection("guestGifts").where("coupleId", "==", coupleId).where("isEstimate", "==", false).get(),
      db.collection("guestGifts").where("coupleId", "==", coupleId).where("isEstimate", "==", true).get(),
      db.collection("guests").where("coupleId", "==", coupleId).where("rsvpStatus", "==", "confirmed").get(),
      db.collection("budget").doc(coupleId).get(),
    ]);

  const totalExpenses = expensesSnap.docs.reduce((sum, d) => {
    const data = d.data();
    return sum + ((data.actualCost ?? data.estimatedCost) as number);
  }, 0);

  const actualGifts = actualGiftsSnap.docs.reduce(
    (sum, d) => sum + ((d.data().amount ?? 0) as number),
    0
  );
  const estimatedGifts = estimatedGiftsSnap.docs.reduce(
    (sum, d) => sum + ((d.data().estimatedAmount ?? 0) as number),
    0
  );

  const averageGiftPerGuest = budgetSnap.exists
    ? ((budgetSnap.data()!.averageGiftPerGuest ?? 600) as number)
    : 600;

  const confirmedCount = confirmedSnap.size;

  const breakeven = totalExpenses - (actualGifts + estimatedGifts);
  const rsvpBreakeven = totalExpenses - (actualGifts + averageGiftPerGuest * confirmedCount);

  await db.collection("budget").doc(coupleId).update({
    breakeven,
    rsvpBreakeven,
    totalSpent: totalExpenses,
    giftIncome: actualGifts,
    lastCalculated: FieldValue.serverTimestamp(),
  });
}

// ─── Trigger A: new expense added ────────────────────────────────────────────

export const onExpenseCreated = onDocumentCreated(
  "budgetExpenses/{expenseId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const coupleId = data.coupleId as string;
    if (!coupleId) return;

    // Update the matching budget category allocation
    const budgetRef = db.collection("budget").doc(coupleId);
    const budgetSnap = await budgetRef.get();
    if (budgetSnap.exists) {
      const categories: Array<{ name: string; allocated: number; spent: number }> =
        budgetSnap.data()!.categories ?? [];
      const category = data.category as string;
      const estimatedCost = (data.estimatedCost ?? 0) as number;
      const exists = categories.some((c) => c.name === category);
      const updatedCategories = exists
        ? categories.map((c) =>
          c.name === category ? { ...c, allocated: c.allocated + estimatedCost } : c
        )
        : [...categories, { name: category, allocated: estimatedCost, spent: 0 }];

      await budgetRef.update({ categories: updatedCategories });
    }

    await recalculateBreakeven(coupleId);
  }
);

// ─── Trigger B: RSVP confirmed — add estimated gift ──────────────────────────

export const onGuestRsvpUpdated = onDocumentUpdated(
  "guests/{guestId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    const wasConfirmed = before.rsvpStatus === "confirmed";
    const isNowConfirmed = after.rsvpStatus === "confirmed";
    if (wasConfirmed === isNowConfirmed) return; // no change in confirmation

    const coupleId = after.coupleId as string;
    if (!coupleId) return;

    if (isNowConfirmed) {
      // Get average gift per guest from budget doc
      const budgetSnap = await db.collection("budget").doc(coupleId).get();
      const avgGift = budgetSnap.exists
        ? ((budgetSnap.data()!.averageGiftPerGuest ?? 600) as number)
        : 600;

      // Upsert estimated gift record
      await db
        .collection("guestGifts")
        .doc(`${event.params.guestId}_estimated`)
        .set({
          coupleId,
          guestId: event.params.guestId,
          estimatedAmount: avgGift,
          isEstimate: true,
          createdAt: FieldValue.serverTimestamp(),
        });
    } else {
      // Guest un-confirmed — remove estimated gift
      await db
        .collection("guestGifts")
        .doc(`${event.params.guestId}_estimated`)
        .delete();
    }

    await recalculateBreakeven(coupleId);
  }
);
