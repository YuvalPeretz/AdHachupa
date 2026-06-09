import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

const db = getFirestore();

// ─── addShareGuest — validate token, add guest (Admin SDK bypasses rules) ────

export const addShareGuest = onCall(async (request) => {
  const { token, name, phone, plusOnes } = request.data as {
    token: string;
    name: string;
    phone?: string;
    plusOnes: number;
  };
  if (!token || !name) throw new HttpsError("invalid-argument", "token and name required");

  // Validate token
  const tokenSnap = await db.collection("shareTokens").doc(token).get();
  if (!tokenSnap.exists) throw new HttpsError("not-found", "token not found");

  const tokenData = tokenSnap.data()!;
  const expiresAt = tokenData.expiresAt as Timestamp;
  if (expiresAt.toMillis() < Date.now()) {
    throw new HttpsError("deadline-exceeded", "token expired");
  }
  if (tokenData.submitted) {
    throw new HttpsError("failed-precondition", "token already submitted");
  }

  const coupleId = tokenData.coupleId as string;
  const eventIds: string[] = tokenData.eventIds ?? [];

  // Add guest
  const guestRef = await db.collection("guests").add({
    coupleId,
    name: name.trim(),
    phone: phone?.trim() ?? null,
    rsvpStatus: "pending",
    invitedBy: tokenData.label ?? "הורים",
    plusOnes: plusOnes ?? 0,
    eventIds,
    sourceToken: token,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    guest: {
      id: guestRef.id,
      name: name.trim(),
      phone: phone?.trim(),
      rsvpStatus: "pending",
      invitedBy: tokenData.label ?? "הורים",
      plusOnes: plusOnes ?? 0,
      eventIds,
    },
  };
});

// ─── submitShareList — mark token submitted, send FCM to couple ───────────────

export const submitShareList = onCall(async (request) => {
  const { token } = request.data as { token: string };
  if (!token) throw new HttpsError("invalid-argument", "token required");

  const tokenSnap = await db.collection("shareTokens").doc(token).get();
  if (!tokenSnap.exists) throw new HttpsError("not-found", "token not found");

  const tokenData = tokenSnap.data()!;
  if (tokenData.submitted) {
    throw new HttpsError("failed-precondition", "already submitted");
  }

  await db.collection("shareTokens").doc(token).update({
    submitted: true,
    submittedAt: FieldValue.serverTimestamp(),
  });

  // FCM push notification to couple would go here — skipped for MVP
  // (requires storing FCM tokens in the couples collection)

  return { success: true };
});
