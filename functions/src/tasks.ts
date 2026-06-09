import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

// ─── selectVendor — atomic: mark chosen, reject others, update task, update budget ───

export const selectVendor = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "auth required");

  const { coupleId, taskId, vendorId } = request.data as {
    coupleId: string;
    taskId: string;
    vendorId: string;
  };
  if (!coupleId || !taskId || !vendorId) {
    throw new HttpsError("invalid-argument", "coupleId, taskId, vendorId required");
  }
  if (request.auth.uid !== coupleId) throw new HttpsError("permission-denied", "forbidden");

  // Load all vendors for this task
  const vendorsSnap = await db
    .collection("vendors")
    .where("taskId", "==", taskId)
    .get();

  const selectedVendorSnap = vendorsSnap.docs.find((d) => d.id === vendorId);
  if (!selectedVendorSnap) throw new HttpsError("not-found", "vendor not found");

  const selectedVendorData = selectedVendorSnap.data();
  const priceMin: number = selectedVendorData.priceMin ?? 0;

  // Load task for the category
  const taskSnap = await db.collection("tasks").doc(taskId).get();
  if (!taskSnap.exists) throw new HttpsError("not-found", "task not found");
  const taskData = taskSnap.data()!;
  const category: string = taskData.category ?? "";

  const batch = db.batch();

  // Update vendor statuses
  vendorsSnap.docs.forEach((vDoc) => {
    batch.update(vDoc.ref, {
      status: vDoc.id === vendorId ? "selected" : "rejected",
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  // Update task
  batch.update(db.collection("tasks").doc(taskId), {
    status: "inProgress",
    selectedVendorId: vendorId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update budget category allocated amount
  const budgetRef = db.collection("budget").doc(coupleId);
  const budgetSnap = await budgetRef.get();
  if (budgetSnap.exists) {
    const budgetData = budgetSnap.data()!;
    const categories: Array<{ name: string; allocated: number; spent: number }> =
      budgetData.categories ?? [];
    const updatedCategories = categories.map((cat) =>
      cat.name === category
        ? { ...cat, allocated: cat.allocated + priceMin }
        : cat
    );
    batch.update(budgetRef, {
      categories: updatedCategories,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  // Return updated task + vendors
  const [updatedTaskSnap, updatedVendorsSnap] = await Promise.all([
    db.collection("tasks").doc(taskId).get(),
    db.collection("vendors").where("taskId", "==", taskId).get(),
  ]);

  const td = updatedTaskSnap.data()!;
  const task = {
    id: taskId,
    name: td.name,
    type: td.type,
    category: td.category,
    priority: td.priority,
    status: td.status,
    responsible: td.responsible,
    dueDate: td.closingDate,
    isOverdue: false,
    eventId: td.eventId,
    notes: td.notes,
    selectedVendorId: td.selectedVendorId,
  };

  const vendors = updatedVendorsSnap.docs.map((d) => {
    const v = d.data();
    return {
      id: d.id,
      name: v.name,
      status: v.status,
      priceMin: v.priceMin,
      priceMax: v.priceMax,
      email: v.email,
      phone: v.phone,
      rating: v.rating,
      notes: v.notes,
    };
  });

  return { task, vendors };
});

// ─── updatePayment — atomic: update payment doc, update budget actual, auto-close task ───

export const updatePayment = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "auth required");

  const { coupleId, taskId, updates } = request.data as {
    coupleId: string;
    taskId: string;
    updates: {
      advancePaid?: boolean;
      advanceAmount?: number;
      balancePaid?: boolean;
      balanceAmount?: number;
    };
  };
  if (!coupleId || !taskId) throw new HttpsError("invalid-argument", "coupleId, taskId required");
  if (request.auth.uid !== coupleId) throw new HttpsError("permission-denied", "forbidden");

  const paymentRef = db.collection("taskPayments").doc(taskId);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists) throw new HttpsError("not-found", "payment doc not found");

  const current = paymentSnap.data()!;
  const merged = { ...current, ...updates };

  // Derive paymentStatus
  let paymentStatus: "unpaid" | "advance_paid" | "fully_paid" = "unpaid";
  if (merged.advancePaid && merged.balancePaid) {
    paymentStatus = "fully_paid";
  } else if (merged.advancePaid) {
    paymentStatus = "advance_paid";
  }

  const batch = db.batch();
  batch.update(paymentRef, {
    ...updates,
    paymentStatus,
  });

  // Auto-close task on full payment
  const taskRef = db.collection("tasks").doc(taskId);
  if (paymentStatus === "fully_paid") {
    batch.update(taskRef, {
      status: "closed",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Update budget actual cost for the task's category
  const taskSnap = await taskRef.get();
  if (taskSnap.exists && paymentStatus === "fully_paid" && updates.balanceAmount != null) {
    const taskData = taskSnap.data()!;
    const category: string = taskData.category ?? "";
    const budgetRef = db.collection("budget").doc(coupleId);
    const budgetSnap = await budgetRef.get();
    if (budgetSnap.exists) {
      const budgetData = budgetSnap.data()!;
      const categories: Array<{ name: string; allocated: number; spent: number }> =
        budgetData.categories ?? [];
      const amount = (merged.advanceAmount ?? 0) + (merged.balanceAmount ?? 0);
      const updatedCategories = categories.map((cat) =>
        cat.name === category ? { ...cat, spent: cat.spent + amount } : cat
      );
      const newTotalSpent = budgetData.totalSpent + amount;
      batch.update(budgetRef, {
        categories: updatedCategories,
        totalSpent: newTotalSpent,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();

  const [updatedPaymentSnap, updatedTaskSnap] = await Promise.all([
    paymentRef.get(),
    taskRef.get(),
  ]);

  const pd = updatedPaymentSnap.data()!;
  const td = updatedTaskSnap.data()!;

  const payment = {
    taskId,
    estimatedCost: pd.estimatedCost,
    actualCost: pd.actualCost,
    billingUnit: pd.billingUnit,
    advancePaid: pd.advancePaid,
    advanceAmount: pd.advanceAmount,
    balancePaid: pd.balancePaid,
    balanceAmount: pd.balanceAmount,
    deadline: pd.deadline,
    paymentStatus: pd.paymentStatus,
    linkedVendorId: pd.linkedVendorId,
  };

  const task = {
    id: taskId,
    name: td.name,
    type: td.type,
    category: td.category,
    priority: td.priority,
    status: td.status,
    responsible: td.responsible,
    dueDate: td.closingDate,
    isOverdue: false,
    eventId: td.eventId,
    notes: td.notes,
    selectedVendorId: td.selectedVendorId,
  };

  return { payment, task };
});
