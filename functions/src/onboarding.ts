import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventInput {
  type: string;
  label: string;
  date?: string; // YYYY-MM-DD
  guestCount: number;
}

interface OnboardingPayload {
  name1: string;
  name2: string;
  gender1: string;
  gender2: string;
  region: string;
  isKosher: boolean;
  totalBudget: number;
  events: EventInput[];
  priorities?: Record<string, number>;
}

// ─── Task templates ──────────────────────────────────────────────────────────

interface TaskTemplate {
  name: string;
  type: "vendor" | "payment" | "decision" | "reminder";
  category: string;
  priority: "essential" | "logistic" | "aesthetic" | "personal";
  monthsBeforeEvent: number;
  kosherOnly?: boolean;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  { name: "בחירת אולם", type: "vendor", category: "אולם ותפעול", priority: "essential", monthsBeforeEvent: 12 },
  { name: "תשלום מקדמה לאולם", type: "payment", category: "תשלומים", priority: "essential", monthsBeforeEvent: 10 },
  { name: "צלם סטילס", type: "vendor", category: "ספקים", priority: "essential", monthsBeforeEvent: 8 },
  { name: "צלם וידאו", type: "vendor", category: "ספקים", priority: "essential", monthsBeforeEvent: 8 },
  { name: "דיג'יי", type: "vendor", category: "ספקים", priority: "essential", monthsBeforeEvent: 8 },
  { name: "מנהל אירוע", type: "vendor", category: "ספקים", priority: "logistic", monthsBeforeEvent: 6 },
  { name: "מאפר ותסרוקת כלה", type: "vendor", category: "טיפוח", priority: "essential", monthsBeforeEvent: 6 },
  { name: "שמלת כלה", type: "vendor", category: "ביגוד", priority: "essential", monthsBeforeEvent: 6 },
  { name: "חליפת חתן", type: "vendor", category: "ביגוד", priority: "logistic", monthsBeforeEvent: 4 },
  { name: "ענף פרחים", type: "vendor", category: "ספקים", priority: "aesthetic", monthsBeforeEvent: 4 },
  { name: "הדפסת הזמנות", type: "payment", category: "הוצאות נוספות", priority: "logistic", monthsBeforeEvent: 4 },
  { name: "סידורי שולחן", type: "decision", category: "ספקים", priority: "aesthetic", monthsBeforeEvent: 3 },
  { name: "תזכורת תשלום יתרה לאולם", type: "reminder", category: "לוגיסטיקה", priority: "essential", monthsBeforeEvent: 2 },
  { name: "ויתרה לצלם", type: "payment", category: "תשלומים", priority: "essential", monthsBeforeEvent: 2 },
  { name: "כשרות — תיאום עם אולם", type: "reminder", category: "לוגיסטיקה", priority: "essential", monthsBeforeEvent: 3, kosherOnly: true },
  { name: "רב — תיאום טקס", type: "vendor", category: "ספקים", priority: "essential", monthsBeforeEvent: 6 },
];

function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split("T")[0];
}

// ─── Onboarding CF ────────────────────────────────────────────────────────────

export const onboarding = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "auth required");

  const uid = request.auth.uid;
  const data = request.data as OnboardingPayload;

  if (!data.name1 || !data.name2 || !data.events?.length) {
    throw new HttpsError("invalid-argument", "name1, name2, events required");
  }

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  // ── Couple document ────────────────────────────────────────────────────────
  const coupleRef = db.collection("couples").doc(uid);
  batch.set(coupleRef, {
    coupleId: uid,
    name1: data.name1,
    name2: data.name2,
    gender1: data.gender1,
    gender2: data.gender2,
    region: data.region,
    isKosher: data.isKosher,
    createdAt: now,
    updatedAt: now,
  });

  // ── Events ────────────────────────────────────────────────────────────────
  const eventIds: string[] = [];
  const eventRefs = data.events.map((ev) => {
    const ref = db.collection("events").doc();
    eventIds.push(ref.id);
    batch.set(ref, {
      coupleId: uid,
      type: ev.type,
      label: ev.label,
      date: ev.date ?? null,
      guestCountExpected: ev.guestCount,
      createdAt: now,
    });
    return { ref, ev };
  });

  // ── Budget doc ────────────────────────────────────────────────────────────
  const totalBudget = data.totalBudget ?? 0;

  const budgetRef = db.collection("budget").doc(uid);
  batch.set(budgetRef, {
    coupleId: uid,
    totalBudget,
    totalSpent: 0,
    giftIncome: 0,
    breakeven: 0,
    rsvpBreakeven: 0,
    averageGiftPerGuest: 600,
    categories: [],
    updatedAt: now,
  });

  // ── Task list generation ──────────────────────────────────────────────────
  const mainEvent = eventRefs[0]; // Tasks generated for the primary (first) event
  const eventDate = mainEvent.ev.date;
  let taskCount = 0;

  for (const template of TASK_TEMPLATES) {
    if (template.kosherOnly && !data.isKosher) continue;
    if (template.priority === "aesthetic") {
      const aestheticRating = (data.priorities?.["aesthetics"] ?? 3) as number;
      if (aestheticRating < 3) continue;
    }

    const taskRef = db.collection("tasks").doc();
    const closingDate = eventDate ? addMonths(eventDate, template.monthsBeforeEvent) : null;

    batch.set(taskRef, {
      coupleId: uid,
      eventId: mainEvent.ref.id,
      name: template.name,
      type: template.type,
      category: template.category,
      priority: template.priority,
      status: "notStarted",
      closingDate,
      createdAt: now,
      updatedAt: now,
    });

    // Create type-specific detail doc
    if (template.type === "payment") {
      batch.set(db.collection("taskPayments").doc(taskRef.id), {
        coupleId: uid,
        estimatedCost: 0,
        billingUnit: "per_item",
        advancePaid: false,
        balancePaid: false,
        paymentStatus: "unpaid",
      });
    } else if (template.type === "vendor") {
      batch.set(db.collection("taskVendorConfigs").doc(taskRef.id), {
        coupleId: uid,
        vendorOptions: [],
      });
    } else if (template.type === "decision") {
      batch.set(db.collection("taskDecisions").doc(taskRef.id), {
        coupleId: uid,
        options: [],
      });
    } else if (template.type === "reminder") {
      batch.set(db.collection("taskReminders").doc(taskRef.id), {
        coupleId: uid,
        notifyEnabled: false,
      });
    }

    taskCount++;
  }

  await batch.commit();

  return {
    coupleId: uid,
    firstEventId: eventIds[0],
    taskCount,
  };
});
