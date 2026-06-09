# MeAndShir — Wedding Management App

A Hebrew-first, RTL, mobile-first web application for couples managing their wedding events. The app handles multiple event types per couple, guest management, task tracking, vendor comparison, and budget planning.

---

## Product Overview

- **Audience:** Israeli couples planning weddings and related celebrations
- **Language:** Hebrew throughout; all UI text, labels, and statuses are in Hebrew
- **Layout direction:** RTL everywhere — text right-aligned, back arrows point right (→), chevrons point left (‹), progress bars fill right-to-left
- **Platform:** Web app, mobile-first responsive (target viewport: iPhone 14 Pro, 393×852pt); no bottom-nav on desktop, full bottom-nav on mobile
- **MVP scope (plan.md):** Onboarding wizard → personalised task list → guest management → budget → dashboard; later phases add calendar, digital invitations, WhatsApp messaging, payment processing

### Supported event types
חתונה · חינה · מסיבת רווקים/ות · שבת חתן · מקווה / הפרשת חלה · קבלת פנים

---

## Architecture — 20 Screens

Described in detail in [architecture.svg](architecture.svg) and [stitch-prompt.md](stitch-prompt.md).

### Onboarding flow (8 screens)
| Screen | Step | Purpose |
|--------|------|---------|
| Splash | 0 | Loading; watercolor floral illustration |
| Welcome | 1 | Entry CTA "בואו נתחיל" + login link |
| Event Selection | 2 | 3×2 card grid, multi-select event types |
| Guest Count & Date | 3 | Per-event guest count stepper + month/year picker |
| Priorities & Vibe | 4 | 1–5 star ratings on 8 categories |
| Budget Range | 5 | 4 selectable budget tier cards |
| Couple Info | 6 | Names, genders, region, kosher toggle |
| Onboarding Success | final | Celebration screen → Dashboard CTA |

Onboarding state is accumulated in client state; a single `POST /onboarding` atomic transaction persists everything and auto-generates the personalised task list.

### Main app (4 tabs via bottom nav)
**Home (בית)** — Dashboard  
**Guests (מוזמנים)** — Guest List + Guest Detail + Parent Share web view  
**Tasks (משימות)** — Task List + 4 Task Detail variants + Add Task modal  
**Budget (תקציב)** — Budget Overview + Add Expense modal  

---

## Design System

Full spec: [stitch/stitch/romantic_elegant_design_system/DESIGN.md](stitch/stitch/romantic_elegant_design_system/DESIGN.md)  
Visual mockups: [stitch/](stitch/)

### Color palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary / blush rose | `#F2C4CE` | Primary actions, essential status, key brand moments |
| Background / warm ivory | `#FDF6EC` | App background; never pure white |
| Accent / champagne gold | `#C9A97A` | Interactive details, headings, active tab, CTA buttons |
| Secondary / sage green | `#A8C5A0` | Success, "סגור" status, logistics tasks |
| Deep charcoal | `#2D2D2D` | All body text |
| Soft red | `#E07070` | Errors, "ביטל" RSVP, overdue dates |
| Amber | `#FFB74D` | "בתהליך" status |

### Typography
- **Playfair Display** — page titles, hero numbers, large headings; bring serif elegance
- **Rubik** — all body text, labels, inputs, Hebrew UI strings; excellent Hebrew legibility
- All text right-aligned (RTL default); tabular figures for numerical lists

### Shape language
- Cards / large containers: `border-radius: 16px`
- Buttons / inputs: `border-radius: 12px`
- Chips / badges: `border-radius: 9999px` (pill)
- Shadows: diffused ambient only (`0px 4px 20px rgba(45,45,45,0.05)`) — no heavy drop shadows

### Status badges (pill-shaped, solid)
| Status (Hebrew) | Color |
|-----------------|-------|
| סגור / הושלם | Sage green `#A8C5A0` + white text |
| בתהליך | Amber `#FFB74D` + charcoal text |
| טרם התחיל | Light gray outline + muted charcoal |
| ממתין / ביטל | Soft red outline + soft red text |
| נבחר (vendor) | Sage green |
| בשיקול (vendor) | Amber |
| נדחה (vendor) | Muted gray |

### Priority chips (filled, 15% opacity background)
| Priority | Color |
|----------|-------|
| הכרחי | Blush rose |
| לוגיסטי | Sage green |
| אסתטי | Soft purple `#D1C4E9` |
| אישי | Peach `#FFCCBC` |

---

## Data Models

Six core models (see [architecture.svg](architecture.svg) data layer for full field lists):

| Model | Key fields |
|-------|-----------|
| **Couple** | id, name1, name2, gender1, gender2, region, isKosher, budgetRange, subscriptionTier |
| **Event** | id, coupleId, type, date, venue, guestCountExpected, status |
| **Guest** | id, coupleId, name, phone, email, rsvpStatus, invitedBy, plusOnes, eventIds[], tableNo |
| **Task/Item** | id, coupleId, eventId, name, type (vendor/payment/decision/reminder), category, priority, status, responsible, estimatedCost, actualCost, billingUnit, closingDate, execDate, dependencies[] |
| **Vendor** | id, taskId, coupleId, name, category, email, phone, paymentTerms, advancePaid, balanceDue, lastPaymentDate, paymentStatus, rating |
| **Budget** | totalBudget, giftIncome, breakeven, categories[{name, allocated, spent}] |

### Task sub-tables (created based on `type` field)
- `task_payments` — estimatedCost, actualCost, billingUnit, advancePaid, balancePaid, deadline
- `task_vendor_configs` — vendorOptions[]
- `task_decisions` — options[], finalDecision
- `task_reminders` — reminderDate, notifyEnabled, linkedTaskId

### Billing units
`per_item` · `per_guest` · `per_hour` — consistent across Task (payment type) and Budget Add Expense. Per-guest costs auto-calculate: `unitPrice × guestCount`.

---

## Task Categories & Items

Full reference list in [דגשי משימות.md](דגשי משימות.md) and [עותק של אקסל חתונה - אקסל חתונה.csv](עותק%20של%20אקסל%20חתונה%20-%20אקסל%20חתונה.csv).

### Main categories
- **אולם ותפעול** — venue (minhah per guest, alcohol, lighting, sound, ACUM rights, after-party, hostess)
- **ספקים** — DJ, event manager, still photographer, albums, video, magnets, band, rabbi, bartending, makeup & hair, social, wedding rings, flower stand, transport
- **הוצאות נוספות** — bar supplies, rabbinate, toiletry baskets, nails, brows, groom haircut, hotel, bride skincare, RSVP system, bridal bouquet, invitations printing, table signs, emergency kit, wedding kiddush cup
- **ביגוד** — bride dresses 1–3, veil, bride shoes ×2, groom shoes ×2, groom suit, jewelry, getting-ready outfit, tallit
- **טיפוח** — facial treatment, brows, nails, makeup, hair, groom haircut
- **אחר** — escort gifts, hotel, massage, bride/groom counselling, QR photo upload
- **Sub-events:** מקווה/הפרשת חלה, חינה, שבת חתן (each with their own item lists)

### Task template generation (auto on onboarding)
See [sequences/onboarding/02-task-template-generation.md](sequences/onboarding/02-task-template-generation.md).  
Logic: all הכרחי tasks always included; לוגיסטי ranked by priority rating; אסתטי only if rating ≥ 3; kosher-specific tasks added when `isKosher = true`.

Suggested deadline rules:
- Venue → event − 12 months
- Photographer → event − 8 months
- Clothing → event − 4 months
- Logistics → event − 2 months

---

## Key User Flows (Sequences)

All flows documented with Mermaid sequence diagrams in [sequences/](sequences/).

### Onboarding
[sequences/onboarding/01-signup-and-onboarding.md](sequences/onboarding/01-signup-and-onboarding.md) — Auth → 6-step wizard → atomic `POST /onboarding` → task generation → dashboard  
[sequences/onboarding/02-task-template-generation.md](sequences/onboarding/02-task-template-generation.md) — Template selection and deadline assignment

### Guests
[sequences/guests/01-add-guest.md](sequences/guests/01-add-guest.md) — FAB → bottom sheet → fuzzy duplicate detection on every add (Levenshtein ≤ 2 or exact phone match)  
[sequences/guests/02-parent-share.md](sequences/guests/02-parent-share.md) — Couple generates share link → parent opens web-only page → submits guest list → push notification to couple  
[sequences/guests/03-rsvp-update.md](sequences/guests/03-rsvp-update.md) — Optimistic UI update; chip reverts on network failure  
[sequences/guests/04-duplicate-detection.md](sequences/guests/04-duplicate-detection.md) — Review list, merge (union eventIds, delete secondary) or dismiss

### Tasks
[sequences/tasks/01-create-task.md](sequences/tasks/01-create-task.md) — FAB → bottom sheet → type determines sub-table created  
[sequences/tasks/02-vendor-comparison.md](sequences/tasks/02-vendor-comparison.md) — Add multiple vendors → select one → atomic status update → budget linked  
[sequences/tasks/03-payment-tracking.md](sequences/tasks/03-payment-tracking.md) — Advance → reminder scheduled → balance → task auto-closes on full payment

### Budget
[sequences/budget/01-add-expense.md](sequences/budget/01-add-expense.md) — Per-guest billing live-calculates total on each keystroke  
[sequences/budget/02-breakeven-calculation.md](sequences/budget/02-breakeven-calculation.md) — Recalculates on expense add, gift logged, or RSVP confirmed; two values: deficit at current state + surplus if all confirmed guests attend

### Dashboard
[sequences/dashboard/01-load-dashboard.md](sequences/dashboard/01-load-dashboard.md) — 5 parallel DB queries assembled into single payload; delta refresh after 5 min idle

---

## Backend — Firebase + Cloud Functions

The backend is **Firebase**: **Firestore** for data, **Firebase Auth** for sign-up/login, **Cloud Functions** for server-side logic and atomic multi-document transactions, and **FCM** for push notifications. All collections are scoped by `coupleId` and protected by Firestore security rules.

### Access pattern
- **Simple reads/writes** go directly to Firestore from the client, wrapped in React Query (`useQuery` / `useMutation`).
- **Operations that must be atomic across multiple documents**, run privileged logic, or fan out are implemented as **callable Cloud Functions** (or Firestore-triggered functions).

### Operations (logical contract from the [sequences/](sequences/) → Firebase implementation)

The sequence diagrams use REST-style names (`POST /onboarding`, etc.) to describe behavior. They map to Firebase as follows — treat the behavior as the contract, not the transport:

| Domain | Operation | Implementation |
|--------|-----------|----------------|
| Auth | Sign up / log in | Firebase Auth (`createUserWithEmailAndPassword`) |
| Onboarding | Persist couple + events + budget + priorities, generate task list | **Cloud Function** `onboarding` — atomic batched write + task-template generation (all-or-nothing) |
| Guests | List / add / update guest | Direct Firestore (`guests` collection, `coupleId`-scoped) |
| Guests | Fuzzy duplicate detection on add | **Cloud Function** / Firestore trigger — exact phone or Levenshtein ≤ 2, returns `duplicates[]` |
| Guests | Merge / dismiss duplicate | **Cloud Function** `mergeGuests` — union `eventIds`, delete secondary (atomic) |
| Tasks | Create task (+ type sub-doc) | Direct Firestore write (task doc + type sub-collection doc) |
| Tasks | Vendor add / compare / select | Direct add; **Cloud Function** `selectVendor` for atomic status update + budget link |
| Tasks | Payment update / auto-close | **Cloud Function** `updatePayment` — updates payment + budget, schedules/cancels reminder |
| Budget | Add expense / gift, recalc breakeven | Direct write + **Cloud Function** / trigger `recalculateBreakeven` |
| Dashboard | Load dashboard | Parallel Firestore reads on the client via React Query (delta refresh by `updatedAt`) |
| Share | Create link / open / submit guests | `shareTokens` collection + **Cloud Function** for token validation & guest insert |
| Notifications | Reminders, parent-share push | Scheduled / triggered Cloud Functions + **FCM** |

---

## UI Patterns & Constraints

- **Bottom sheet modals** for Add Guest, Add Task, Add Expense — slides up ~70–75% screen height, handle bar at top
- **Event pill tabs** appear across Guest List, Task List, and Budget (one tab per couple event)
- **FAB (+)** champagne gold circle, bottom-left on list screens
- **Optimistic updates** on RSVP status — revert to previous on network error, show toast
- **Skeleton loading** on Dashboard initial load; delta merge on subsequent refreshes (no full re-render)
- **Duplicate banner** (blush rose, triangle warning) appears on Guest List when duplicates exist; tapping it opens the review flow
- **Parent Share** page has no bottom nav — it is a standalone web view
- **Illustrations** (watercolor wedding motifs) only on Splash, Welcome, and empty states — not on functional screens
- **Billing unit chip selector** (לפי פריט / לפי אורח / לפי שעה) is a shared reusable component used in both Task Payment Detail and Add Expense modal

---

## Component Library (to extract)

Primary/secondary/ghost buttons · floating-label text inputs · event pill tabs · vendor cards · guest rows · task rows · status badges · priority chips · billing-unit chip selector · progress bars · donut ring · avatar circle · bottom sheet modal frame · 2×2 stats grid · hero card

---

## Development Notes

- **Frontend:** React 19 + TypeScript, built with Vite. UI: Ant Design v6 (RTL `ConfigProvider`). Server state: TanStack React Query; global client state: Redux Toolkit. Routing: react-router v7. Icons: react-icons. i18n: react-i18next (Hebrew-only, future-ready). Styling: SCSS modules. E2E: Playwright. See [development/guidelines.md](development/guidelines.md) for the full how-we-build guide.
- **Backend:** Firebase — Firestore (data), Firebase Auth, Cloud Functions (atomic transactions & server logic), FCM (push notifications)
- The app lives at the **project root** — [src/](src/), [index.html](index.html), and build/lint configs are all at the root
- The app is a **web app** that must be fully functional on mobile browsers — not a native app
- Hebrew date formats: `DD/MM/YYYY`; currency: `₪` prefix
- All screens must be tested in RTL mode
- Each screen should demo with 2–4 representative example items; real data renders dynamically
