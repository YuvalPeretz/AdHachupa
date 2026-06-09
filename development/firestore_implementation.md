# Firestore Implementation — MeAndShir

Technical reference for the data layer: collection schemas, repository API, hook wiring, Cloud Function contracts, and Playwright seam conventions.

---

## Architecture Overview

```
src/lib/firestore/
  types.ts          ← Firestore document interfaces + payload types
  converters.ts     ← doc-to-UI mappers, date string helpers
  couples.ts        ← getCouple, setCouple
  events.ts         ← getEvents, updateEvent
  guests.ts         ← fetchGuests, fetchGuestById, addGuest, updateGuest, deleteGuest
                       fetchDuplicates, mergeGuests, dismissDuplicate
                       fetchShareToken, addShareGuest, submitShareList
  tasks.ts          ← fetchTasks, fetchTaskById, addTask, updateTask
                       fetchTaskPayment, updateTaskPayment (CF)
                       fetchTaskDecision, updateTaskDecision
                       fetchTaskReminder, updateTaskReminder
  vendors.ts        ← fetchVendors, addVendor, updateVendor, deleteVendor, selectVendor (CF)
  budget.ts         ← fetchBudget, addExpense
  shareTokens.ts    ← createShareToken (re-exports share fns from guests.ts)

functions/src/
  index.ts          ← exports all CFs; sets region europe-west1
  onboarding.ts     ← onboarding CF (atomic batch: couple + events + budget + tasks)
  guests.ts         ← detectDuplicates CF, mergeGuests CF
  tasks.ts          ← selectVendor CF, updatePayment CF
  budget.ts         ← onExpenseCreated trigger, onGuestRsvpUpdated trigger
  share.ts          ← addShareGuest CF, submitShareList CF
```

All repository functions are pure async functions — no React hooks, no side effects.
Hooks get `coupleId` from `useAppSelector(selectAuthUid)` and pass it as a parameter.

---

## Firestore Collections

### `couples/{uid}` (doc id == Firebase Auth uid)
```typescript
{ name1, name2, gender1, gender2, region, isKosher, budgetTier, createdAt, updatedAt }
```

### `events/{eventId}`
```typescript
{ coupleId, type: EventType, label, date?: string /*ISO YYYY-MM-DD*/, venue?, guestCountExpected, createdAt }
```

### `guests/{guestId}`
```typescript
{ coupleId, name, phone?, email?, rsvpStatus, invitedBy, plusOnes, tableNo?,
  eventIds: string[], sourceToken?, updatedAt }
```

### `tasks/{taskId}`
```typescript
{ coupleId, eventId, name, type, category, priority, status, responsible?,
  closingDate? /*ISO*/, selectedVendorId?, notes?, createdAt, updatedAt }
```

### `taskPayments/{taskId}` (doc id == taskId)
```typescript
{ coupleId, estimatedCost, actualCost?, billingUnit, advancePaid, advanceAmount?,
  balancePaid, balanceAmount?, paymentStatus, deadline? /*ISO*/ }
```

### `taskVendorConfigs/{taskId}`, `taskDecisions/{taskId}`, `taskReminders/{taskId}`
Keyed by taskId; hold vendor options, decision options, and reminder configuration respectively.

### `vendors/{vendorId}`
```typescript
{ coupleId, taskId, name, status: VendorStatus, priceMin?, priceMax?,
  email?, phone?, rating?, notes?, updatedAt }
```

### `budget/{coupleId}` (doc id == coupleId)
```typescript
{ totalBudget, totalSpent, giftIncome, breakeven, rsvpBreakeven,
  averageGiftPerGuest, categories: BudgetCategory[], updatedAt }
```

### `budgetExpenses/{expenseId}`
```typescript
{ coupleId, name, category, estimatedCost?, actualCost?, billingUnit,
  unitPrice?, guestCount?, priority?, eventId?, notes?, createdAt }
```

### `shareTokens/{token}`
```typescript
{ coupleId, coupleNames, label, eventIds: string[], expiresAt: Timestamp, submitted, submittedAt? }
```

### `dismissedDuplicates/{id}`
```typescript
{ coupleId, guestId1, guestId2, createdAt }
```

---

## Date Handling

Firestore stores dates as ISO strings (`YYYY-MM-DD`). UI uses `DD/MM/YYYY`.

```typescript
// converters.ts
toDisplay('2026-11-14')  // → '14/11/2026'
fromDisplay('14/11/2026') // → '2026-11-14'
parseDisplayDate('14/11/2026') // → Date object
daysUntil(date: Date) // → integer days from today
```

`serverTimestamp()` is used only for `createdAt` / `updatedAt` audit fields.

---

## Cloud Functions

Region: `europe-west1`. Deployed via `functions/src/index.ts`.

### `onboarding` — callable
Creates couple, events, budget, and task list atomically in one Firestore batch.
Input: `OnboardingPayload` (name1, name2, events[], isKosher, budgetTier, priorities).
Returns: `{ coupleId, firstEventId, taskCount }`.

Task templates are bundled statically; kosher-specific tasks added when `isKosher = true`.
Deadline: computed as `eventDate − N months` per template.

### `detectDuplicates` — callable
Input: `{ coupleId, guestId? }`.
Returns: `{ pairs, count }` (all pairs) or `{ duplicates, count }` (for a specific guest).
Algorithm: exact phone match OR Levenshtein distance ≤ 2 on names, filtered by `dismissedDuplicates`.

### `mergeGuests` — callable
Input: `{ coupleId, primaryId, secondaryId }`.
Atomically: union `eventIds` on primary, delete secondary.

### `selectVendor` — callable
Input: `{ coupleId, taskId, vendorId }`.
Atomically: mark chosen vendor `selected`, all others `rejected`, update task status + `selectedVendorId`, update budget category `allocated`.

### `updatePayment` — callable
Input: `{ coupleId, taskId, updates: { advancePaid?, advanceAmount?, balancePaid?, balanceAmount? } }`.
Atomically: update `taskPayments/{taskId}`, update budget `actualCost`. Auto-closes task when `balancePaid = true`.

### `onExpenseCreated` — Firestore trigger on `budgetExpenses/{expenseId}`
Updates budget category `allocated` and calls `recalculateBreakeven`.

### `onGuestRsvpUpdated` — Firestore trigger on `guests/{guestId}`
When `rsvpStatus` changes to/from `confirmed`: upserts/deletes estimated gift amount, calls `recalculateBreakeven`.

### `addShareGuest` — callable
Input: `{ token, name, phone?, plusOnes }`.
Validates token expiry, adds guest via Admin SDK.

### `submitShareList` — callable
Input: `{ token }`.
Marks token submitted; FCM push to couple (future).

---

## Playwright Seam Conventions

Every repository function follows this guard pattern:

```typescript
// 1. Specific seams (loading, empty, error states set by addInitScript)
if (window.__PLAYWRIGHT_TASKS_LOADING__) return new Promise(() => {});
if (window.__PLAYWRIGHT_TASKS_EMPTY__) return { tasks: [], ... };

// 2. Catch-all seam (any authenticated Playwright context)
if (inPlaywright()) return { tasks: mutableTasks, ... };

// 3. Real Firebase
```

`inPlaywright()` checks `'__PLAYWRIGHT_AUTH_MOCK__' in window`.

For unauthenticated pages (ParentShare), `inAnyPlaywright()` also checks `navigator.webdriver`.

**Mutable seam state**: module-level `let mutable* = [...BASE_*]`. Mutations update it; reads return from it. Resets on each page load. This exactly mirrors the old `*Mock.ts` mutable state.

**E2E mutation tests**: `useAddExpense` skips the 800ms CF-settle `setTimeout` in Playwright so the budget query invalidates immediately after `addExpense` returns.

---

## React Query Keys

| Domain    | Key pattern                  |
|-----------|------------------------------|
| Guests    | `['guests', coupleId]`       |
| Guest     | `['guest', guestId]`         |
| Duplicates| `['duplicates', coupleId]`   |
| ShareToken| `['shareToken', token]`      |
| Tasks     | `['tasks', coupleId]`        |
| Task      | `['task', taskId]`           |
| Vendors   | `['vendors', taskId]`        |
| Budget    | `['budget', coupleId]`       |
| Dashboard | `['dashboard', coupleId]`    |

All queries are enabled only when `coupleId` is non-empty (`enabled: Boolean(coupleId)`).
`staleTime: 5 * 60 * 1000` on Budget and Dashboard; default (0) on all others.

---

## Hook Migration Map

| Hook / Component           | Old import          | New import                        |
|---------------------------|---------------------|-----------------------------------|
| `useGuestList.tsx`        | `fetchGuestsMock`   | `fetchGuests(coupleId)`           |
| `useGuestDetail.tsx`      | `fetchGuestByIdMock`| `fetchGuestById(guestId)`         |
| `AddGuestSheet.tsx`       | `addGuestMock`      | `addGuest(coupleId, data)`        |
| `DuplicateReview.tsx`     | `fetchDuplicatesMock`| `fetchDuplicates(coupleId)`      |
| `useParentShare.tsx`      | `fetchShareTokenMock`| `fetchShareToken(token)`         |
| `useTaskList.tsx`         | `fetchTasksMock`    | `fetchTasks(coupleId)`            |
| `TaskDetailVendor.tsx`    | `fetchVendorsMock`  | `fetchVendors(taskId)`            |
| `TaskDetailPayment.tsx`   | `updatePaymentMock` | `updateTaskPayment(coupleId, ...)` |
| `TaskDetailDecision.tsx`  | `fetchDecisionMock` | `fetchTaskDecision(taskId)`       |
| `TaskDetailReminder.tsx`  | `fetchReminderMock` | `fetchTaskReminder(taskId)`       |
| `useBudget.tsx`           | `fetchBudgetMock`   | `fetchBudget(coupleId)`           |
| `useDashboard.tsx`        | `fetchDashboardMock`| inline `fetchDashboard(coupleId)` |
