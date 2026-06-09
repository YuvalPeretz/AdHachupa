import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

// ─── Levenshtein distance ────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// ─── detectDuplicates ─────────────────────────────────────────────────────────

export const detectDuplicates = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "auth required");

  const { coupleId, guestId } = request.data as { coupleId: string; guestId?: string };
  if (!coupleId) throw new HttpsError("invalid-argument", "coupleId required");
  if (request.auth.uid !== coupleId) throw new HttpsError("permission-denied", "forbidden");

  // Load all guests
  const guestsSnap = await db
    .collection("guests")
    .where("coupleId", "==", coupleId)
    .get();

  // Load dismissed pairs for filtering
  const dismissedSnap = await db
    .collection("dismissedDuplicates")
    .where("coupleId", "==", coupleId)
    .get();

  const dismissed = new Set<string>();
  dismissedSnap.docs.forEach((d) => {
    const data = d.data();
    dismissed.add(`${data.guestId1}__${data.guestId2}`);
    dismissed.add(`${data.guestId2}__${data.guestId1}`);
  });

  type GuestRow = { id: string; name: string; phone?: string };
  const guests: GuestRow[] = guestsSnap.docs.map((d) => ({
    id: d.id,
    name: (d.data().name as string) ?? "",
    phone: (d.data().phone as string | undefined),
  }));

  // If guestId provided, only check that specific guest against all others
  const targets = guestId ? guests.filter((g) => g.id === guestId) : guests;

  interface DuplicatePair {
    id: string;
    guests: [GuestRow, GuestRow];
    similarity: number;
    reason: "phone_match" | "name_match";
  }
  const pairs: DuplicatePair[] = [];
  const seen = new Set<string>();

  for (const a of targets) {
    for (const b of guests) {
      if (a.id === b.id) continue;
      const key = [a.id, b.id].sort().join("__");
      if (seen.has(key)) continue;
      if (dismissed.has(`${a.id}__${b.id}`)) continue;
      seen.add(key);

      // Phone match
      if (a.phone && b.phone && a.phone === b.phone) {
        pairs.push({ id: key, guests: [a, b], similarity: 1.0, reason: "phone_match" });
        continue;
      }

      // Name similarity (Levenshtein ≤ 2)
      const dist = levenshtein(a.name, b.name);
      if (dist <= 2 && dist < Math.min(a.name.length, b.name.length)) {
        const similarity = 1 - dist / Math.max(a.name.length, b.name.length);
        pairs.push({ id: key, guests: [a, b], similarity, reason: "name_match" });
      }
    }
  }

  // If called after adding a specific guest, return the duplicates array format
  if (guestId) {
    const duplicates = pairs.map((p) => {
      const other = p.guests[0].id === guestId ? p.guests[1] : p.guests[0];
      return { id: other.id, name: other.name, phone: other.phone, similarity: p.similarity };
    });
    return { duplicates, count: pairs.length };
  }

  return { pairs, count: pairs.length };
});

// ─── mergeGuests ──────────────────────────────────────────────────────────────

export const mergeGuests = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "auth required");

  const { coupleId, primaryId, secondaryId } = request.data as {
    coupleId: string;
    primaryId: string;
    secondaryId: string;
  };
  if (!coupleId || !primaryId || !secondaryId) {
    throw new HttpsError("invalid-argument", "coupleId, primaryId, secondaryId required");
  }
  if (request.auth.uid !== coupleId) throw new HttpsError("permission-denied", "forbidden");

  const [primarySnap, secondarySnap] = await Promise.all([
    db.collection("guests").doc(primaryId).get(),
    db.collection("guests").doc(secondaryId).get(),
  ]);

  if (!primarySnap.exists || !secondarySnap.exists) {
    throw new HttpsError("not-found", "one or both guests not found");
  }

  const primary = primarySnap.data()!;
  const secondary = secondarySnap.data()!;

  // Union eventIds
  const primaryEventIds: string[] = primary.eventIds ?? [];
  const secondaryEventIds: string[] = secondary.eventIds ?? [];
  const mergedEventIds = [...new Set([...primaryEventIds, ...secondaryEventIds])];

  const batch = db.batch();
  batch.update(db.collection("guests").doc(primaryId), {
    eventIds: mergedEventIds,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.delete(db.collection("guests").doc(secondaryId));
  await batch.commit();

  const updatedSnap = await db.collection("guests").doc(primaryId).get();
  const data = updatedSnap.data()!;

  return {
    guest: {
      id: primaryId,
      name: data.name,
      phone: data.phone,
      rsvpStatus: data.rsvpStatus,
      invitedBy: data.invitedBy,
      plusOnes: data.plusOnes,
      tableNo: data.tableNo,
      eventIds: data.eventIds,
    },
  };
});
