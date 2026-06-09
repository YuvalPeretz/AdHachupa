# Implementation Plan — MeAndShir

> Build order: App Shell → Global Components → Onboarding → Main App tabs.
> Every phase ends with a visual verification step before moving on.
> Reference: [../CLAUDE.md](../CLAUDE.md) for screens/data, [guidelines.md](guidelines.md) for how-we-build.

---

## ✅ Progress Tracker

### Phase 0 — App Shell ✅
- [x] 0.1 Entry point & providers (`main.tsx`, i18n, QueryClient, Redux, ConfigProvider, Router)
- [x] 0.2 BottomNav
- [x] 0.3 AppShell layout
- [x] 0.4 PageHeader
- [x] 0.5 Firebase Auth — Google Sign-In

### Phase 1 — Global Components (Custom Atoms) ✅
> Most atoms are covered directly by Ant Design v6 (`Button`, `Input`/`Form.Item`, `Avatar`, `FloatButton`, `Progress`, `Tag`, `Segmented`) — see "Using Ant Design directly" below. Only components with no antd equivalent get a wrapper here.
- [x] 1.1 EventPillTab

### Phase 1 — Global Components (Composites) ✅
- [x] 1.2 BottomSheet (wraps antd `Drawer`)
- [x] 1.3 HeroCard
- [x] 1.4 GuestRow
- [x] 1.5 TaskRow
- [x] 1.6 VendorCard
- [x] 1.7 DuplicateBanner

### Phase 2 — Onboarding ✅
- [x] 2.1 Splash Screen
- [x] 2.2 Welcome
- [x] 2.2a Wire Welcome CTA + login link to Google Sign-In (depends on 0.5)
- [x] 2.3 Event Selection
- [x] 2.4 Guest Count & Date
- [x] 2.5 Priorities & Vibe
- [x] 2.6 Budget Range
- [x] 2.7 Couple Info
- [x] 2.8 Onboarding Success

### Phase 3 — Main App ✅
- [x] 3.1 Dashboard
- [x] 3.2 Guest List
- [x] 3.2a Add Guest (Bottom Sheet)
- [x] 3.2b Guest Detail
- [x] 3.2c Duplicate Review
- [x] 3.2d Parent Share (web-only)
- [x] 3.3 Task List
- [x] 3.3a Add Task (Bottom Sheet)
- [x] 3.3b Task Detail — Vendor
- [x] 3.3c Task Detail — Payment
- [x] 3.3d Task Detail — Decision
- [x] 3.3e Task Detail — Reminder
- [x] 3.4 Budget Overview
- [x] 3.4a Add Expense (Bottom Sheet)

### Phase 4 — Integration E2E
- [ ] Onboarding flow (sign up → task list generated)
- [ ] Add guest + duplicate detection + resolve
- [ ] Parent share link → submit → couple notified
- [ ] Breakeven recalculates on RSVP confirm
- [ ] Dashboard load + delta refresh

---

## Testing Strategy

We follow a **visual-first TDD** approach:

1. **Write a Playwright visual test** for the component or page before implementing it (or immediately after stubbing the shell).
2. **Implement** until the test passes.
3. **Screenshot baseline is committed** so regressions are caught automatically on every subsequent change.

### Test conventions
- All tests run at **mobile viewport: 393 × 852** (iPhone 14 Pro).
- All tests assert **RTL layout** — text alignment, icon direction, progress bar fill direction.
- Snapshot baselines live in `tests/snapshots/`.
- Test files mirror the source tree: `tests/components/`, `tests/pages/`, `tests/e2e/`.
- Use Playwright's `expect(page).toHaveScreenshot()` for visual regression.
- Use `page.getByRole` / `page.getByText` for functional assertions (never CSS selectors in tests).
- Re-run visual tests after **every** meaningful UI change and update the baseline intentionally (`--update-snapshots`) only when the change is correct.

### Test levels

| Level | Tool | When |
|-------|------|------|
| Visual snapshot | Playwright screenshot | Per component, per page, per state |
| Functional assertion | Playwright `expect` | User flows (sequences) |
| RTL assertion | Playwright `locator.evaluate` (check `dir`, `textAlign`) | Every layout component |
| Mobile viewport | Playwright `viewport: 393×852` | Every test |

---

## Phase 0 — App Shell

> Foundation every other phase depends on. Must be complete before any page work.

### 0.1 Entry point & providers (`src/main.tsx`, `src/App.tsx`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Wire up in this order (outer → inner):
1. `I18nProvider` — i18next init imported before render
2. `QueryClientProvider` — React Query
3. Redux `<Provider store>`
4. antd `<ConfigProvider direction="rtl" theme={...}>` — RTL + design tokens
5. `<RouterProvider>` — react-router v7

**Files to create:**
- `src/i18n/index.ts` — i18next configuration
- `src/i18n/i18next.d.ts` — TS key augmentation
- `src/lib/queryClient.ts` — QueryClient singleton
- `src/lib/firebase.ts` — Firebase init, export `db`, `auth`
- `src/store/index.ts` — Redux store + typed hooks
- `src/theme/index.ts` — antd token map (colors, radii, typography)
- `src/locales/he/common.json` — shared strings (nav labels, buttons, generic)

**Visual test: `tests/shell/app-shell.spec.ts`**
- [ ] App renders without crash at 393×852
- [ ] `<html>` has `dir="rtl"` and `lang="he"`
- [ ] Background color is warm ivory `#FDF6EC`
- [ ] Screenshot baseline: `shell-empty.png`

---

### 0.2 Bottom Navigation (`src/components/BottomNav/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Persistent on mobile, hidden on desktop. 4 tabs: 🏠 בית · 👥 מוזמנים · ✅ משימות · 💰 תקציב.

```
BottomNav/
  ├── BottomNav.tsx
  └── BottomNav.module.scss
```

**Props:** `activeTab: 'home' | 'guests' | 'tasks' | 'budget'`

**Visual tests: `tests/components/BottomNav.spec.ts`**
- [ ] All 4 tabs render with Hebrew labels
- [ ] Active tab icon + label render in champagne gold `#C9A97A`
- [ ] Inactive tabs render in muted charcoal
- [ ] Tab bar hidden at viewport ≥ 768px (desktop breakpoint)
- [ ] Screenshot each active-tab variant: `bottom-nav-home.png`, `…-guests.png`, `…-tasks.png`, `…-budget.png`

---

### 0.3 App Shell Layout (`src/components/AppShell/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Persistent layout wrapping the 4 main-tab routes. Renders `<Outlet>` + `<BottomNav>`.

```
AppShell/
  ├── AppShell.tsx
  └── AppShell.module.scss
```

**Visual test: `tests/shell/layout.spec.ts`**
- [ ] Content area fills viewport above the nav bar
- [ ] No horizontal scroll at 393px wide
- [ ] Screenshot: `app-shell-layout.png`

---

### 0.4 Page Header (`src/components/PageHeader/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Reused by every main-app screen (not onboarding). RTL: title centred, back arrow on the **right**, action icons on the **left**.

```
PageHeader/
  ├── PageHeader.tsx
  └── PageHeader.module.scss
```

**Props:** `title: string`, `onBack?: () => void`, `actions?: ReactNode`

**Visual tests: `tests/components/PageHeader.spec.ts`**
- [ ] Back arrow appears on the right side (RTL)
- [ ] Title is centred
- [ ] Action slot renders on the left side
- [ ] Screenshot: `page-header-with-back.png`, `page-header-no-back.png`

---

### 0.5 Firebase Auth — Google Sign-In (`src/lib/firebase.ts`, `src/features/auth/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Google is the **only** sign-in method (no email/password, no other providers). Wraps Firebase Auth's `GoogleAuthProvider`, exposes the current-user state app-wide via Redux, and gates which routes an (un)authenticated visitor may land on. This is foundational — Phase 2's Welcome screen and every Phase 3 main-app route depend on it.

**Files to create / extend:**
- `src/lib/firebase.ts` — extend with `googleProvider = new GoogleAuthProvider()` and exported helpers `signInWithGoogle()` (wraps `signInWithPopup`) / `signOutUser()`
- `src/features/auth/authSlice.ts` — Redux slice holding `{ uid, displayName, email, photoURL, status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' }`; populated by an `onAuthStateChanged` listener wired up once in `App.tsx` (alongside the provider stack from 0.1)
- `src/features/auth/RequireAuth.tsx` / `src/features/auth/RedirectIfAuthed.tsx` — route-guard wrapper components used in `router.tsx`

**Routing contract** (decided after `onAuthStateChanged` resolves, using a direct Firestore read `useCoupleByUid(uid)` — simple read, not a Cloud Function, per the existing access-pattern table):

| Auth state | `Couple` doc for `uid`? | Landing |
|------------|------------------------|---------|
| Not authenticated | — | Splash → Welcome (sign-in entry point) |
| Authenticated | No | Onboarding wizard (`/onboarding/events`) |
| Authenticated | Yes | `/dashboard` |

`RequireAuth` protects `/onboarding/*` and the main-app routes (`/dashboard`, `/guests`, `/tasks`, `/budget`), redirecting unauthenticated visitors to `/onboarding/welcome`. `RedirectIfAuthed` protects `/` and `/onboarding/welcome`, sending an already-authenticated-and-onboarded couple straight to `/dashboard` so they never see Splash/Welcome again on return visits.

**Visual / behavioral tests: `tests/auth/google-signin.spec.ts`**
- [x] Tapping the Welcome CTA or login link calls `signInWithGoogle()`
- [x] Authenticated + already-onboarded user is redirected from `/` and `/onboarding/welcome` straight to `/dashboard`
- [x] Unauthenticated visitor hitting any main-app route is redirected to `/onboarding/welcome`
- [x] New (authenticated, not yet onboarded) user is routed into the wizard at `/onboarding/events`
- [x] Auth-resolving state shows a loading skeleton, never a flash of the wrong screen

> Mock `signInWithPopup`/`onAuthStateChanged` in tests (or use the Firebase Auth emulator) — never trigger a real Google OAuth popup in CI.

---

## Phase 1 — Global / Shared Components

Build all reusable atoms and composites before any page. Pages assemble from these.

### Using Ant Design directly

Ant Design v6 already covers most basic atoms — wrapping them in our own components added redundant API surface without real value. Use these antd components **directly** in pages and composites instead of custom wrappers:

| Need | Use directly | Notes |
|------|-------------|-------|
| Buttons (primary/secondary/ghost/danger) | `Button` — `type="primary"` / `type="default"` / `type="text"` / `danger` | Brand colors come from the `theme/index.ts` token map, not per-component CSS |
| Text inputs + labels | `Input`, `Form.Item label=` | `Form.Item` gives the label/error/required pattern natively — no floating-label wrapper needed |
| Avatars with initials | `Avatar` | Extract initials with a small `getInitials(name)` helper in `src/utils/` |
| Floating action button | `FloatButton` (`shape="circle"`) | Style via theme tokens for the champagne-gold fill |
| Progress bars / rings | `Progress` (`type="line"` / `type="circle"`) | The `format` prop renders custom center content for donut-style rings |
| Status pills (task/vendor/RSVP) | `Tag` + `getStatusTagProps(status)` | Util returns `{ color, label }` from the CLAUDE.md status→color table — single source of truth |
| Priority pills | `Tag` + `getPriorityTagProps(priority)` | Util returns `{ color, label }` from the priority→color table (15% opacity tints) |
| Billing-unit selector | `Segmented<BillingUnit>` | Typed `options` array with translated labels; shared between Task Payment Detail and Add Expense |
| Bottom-sheet modals | `Drawer placement="bottom"` | Wrapped once by the `BottomSheet` composite below for the handle bar + ~72% height |
| Banners / alerts | `Alert` | `DuplicateBanner` wraps it with domain copy, icon placement, and `onReview` |
| Stat numbers (2×2 grids) | `Statistic` inside `Row`/`Col` | Composed inline where needed (e.g. Guest List header) — not worth a dedicated component |

Status/priority color-map utilities live in `src/utils/statusConfig.ts` and `src/utils/priorityConfig.ts`.

### Custom Atoms

Only atoms with **no antd equivalent** or genuine domain-specific visual behavior get their own component.

---

#### 1.1 EventPillTab (`src/components/EventPillTab/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Horizontal scrollable pill tabs, one per couple event. Used on Guest List, Task List, Budget. No antd component matches this shape (pill buttons + horizontal scroll + RTL order) — `Tabs` and `Segmented` both render visually differently from the design.

```
EventPillTab/
  ├── EventPillTab.tsx
  └── EventPillTab.module.scss
```

**Props:** `events: WeddingEvent[]`, `activeEventId: string`, `onChange`

**Visual tests: `tests/components/EventPillTab.spec.ts`**
- [ ] Active tab: blush rose fill
- [ ] Inactive tabs: outline
- [ ] Horizontal scroll when tabs overflow viewport
- [ ] Tab order reads right-to-left (RTL)
- [ ] Screenshot: `event-pill-tab.png`

---

### Composites

Composites combine antd primitives with domain data shapes (`Guest`, `Task`, `Vendor`) and CLAUDE.md-specific visuals. These earn their place as components.

---

#### 1.2 BottomSheet (`src/components/BottomSheet/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Thin wrapper around antd `Drawer placement="bottom"` — adds the handle bar, ~70–75% viewport height, and our title/close styling. Used for Add Guest, Add Task, Add Expense.

```
BottomSheet/
  ├── BottomSheet.tsx
  └── BottomSheet.module.scss
```

**Props:** `open: boolean`, `onClose`, `title: string`, `children`

**Visual tests: `tests/components/BottomSheet.spec.ts`**
- [x] Sheet occupies ~72% viewport height when open
- [x] Handle bar visible at top centre
- [x] Backdrop dims the content behind
- [x] Closed state: sheet not visible
- [x] Screenshot: `bottom-sheet-open.png`, `bottom-sheet-closed.png`

---

#### 1.3 HeroCard (`src/components/HeroCard/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Blush gradient card. Used on Dashboard for upcoming event. Shows event name, countdown, date/venue, task progress (antd `Progress`).

```
HeroCard/
  ├── HeroCard.tsx
  └── HeroCard.module.scss
```

**Props:** `eventType`, `eventName`, `daysLeft`, `date`, `venue`, `tasksCompleted`, `tasksTotal`

**Visual tests: `tests/components/HeroCard.spec.ts`**
- [x] Blush rose gradient background
- [x] Countdown number prominent (Playfair Display)
- [x] Progress bar fills right-to-left
- [x] Screenshot: `hero-card.png`

---

#### 1.4 GuestRow (`src/components/GuestRow/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Single row in Guest List. RTL: name on the right, table/RSVP badge on the left. Badge rendered via antd `Tag` + `getStatusTagProps`.

```
GuestRow/
  └── GuestRow.tsx
  └── GuestRow.module.scss
```

**Props:** `guest: Guest`, `onClick`

States: confirmed (sage green dot) · pending (amber) · cancelled (strikethrough, soft red)

**Visual tests: `tests/components/GuestRow.spec.ts`**
- [x] Name right-aligned, metadata left-aligned (RTL)
- [x] Correct badge per RSVP status
- [x] Cancelled state shows strikethrough text in soft red
- [x] Screenshot: `guest-row-confirmed.png`, `guest-row-pending.png`, `guest-row-cancelled.png`

---

#### 1.5 TaskRow (`src/components/TaskRow/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Single row in Task List. Checkbox on the right (RTL), chevron on the left. Status/priority badges via antd `Tag` + the color-map utils.

```
TaskRow/
  └── TaskRow.tsx
  └── TaskRow.module.scss
```

**Props:** `task: Task`, `onClick`

**Visual tests: `tests/components/TaskRow.spec.ts`**
- [x] Checkbox on the right (RTL)
- [x] Category icon, task name, status badge, due date
- [x] Overdue date renders in soft red
- [x] Completed task shows strikethrough + sage green badge
- [x] Chevron (‹) on the left
- [x] Screenshot: `task-row-not-started.png`, `task-row-in-progress.png`, `task-row-closed.png`, `task-row-overdue.png`

---

#### 1.6 VendorCard (`src/components/VendorCard/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Used in Task Detail (Vendor type). Shows vendor name, status badge (`Tag`), price range, star rating (antd `Rate`), contact, payment row.

```
VendorCard/
  ├── VendorCard.tsx
  └── VendorCard.module.scss
```

**Props:** `vendor: Vendor`, `onSelect`, `onEdit`

**Visual tests: `tests/components/VendorCard.spec.ts`**
- [x] Selected vendor: sage green "נבחר" badge
- [x] Considering vendor: amber "בשיקול" badge + "הגדר כנבחר" button
- [x] Rejected vendor: muted "נדחה" badge
- [x] Payment row visible
- [x] Screenshot: `vendor-card-selected.png`, `vendor-card-considering.png`, `vendor-card-rejected.png`

---

#### 1.7 DuplicateBanner (`src/components/DuplicateBanner/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Wraps antd `Alert` with blush rose styling, warning-triangle icon placement, and Hebrew copy with an interpolated count. Appears at top of Guest List when duplicates exist.

```
DuplicateBanner/
  └── DuplicateBanner.tsx
  └── DuplicateBanner.module.scss
```

**Props:** `count: number`, `onReview`

**Visual tests: `tests/components/DuplicateBanner.spec.ts`**
- [x] Blush rose background, warning triangle icon (on right, RTL)
- [x] Hebrew text with count interpolated correctly
- [x] Tapping triggers `onReview`
- [x] Screenshot: `duplicate-banner.png`

---

## Phase 2 — Onboarding Flow

Route: `/onboarding/*`. Wizard state lives in Redux (`onboardingSlice`). No bottom nav.

**Shared onboarding shell:**
- `src/features/onboarding/OnboardingShell.tsx` — progress indicator + back/next nav
- `src/locales/he/onboarding.json`

---

#### 2.1 Splash Screen (`/`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Full-screen warm ivory. Watercolor floral illustration. Logo + tagline. 3-dot pulsing loader.

**File:** `src/pages/Splash/Splash.tsx`

**Visual tests: `tests/pages/Splash.spec.ts`**
- [x] Full viewport warm ivory background
- [x] Pulsing loader visible
- [x] Logo and tagline centered
- [x] Auto-navigates to Welcome after timeout
- [x] Screenshot: `splash.png`

---

#### 2.2 Welcome (`/onboarding/welcome`)

- [x] Built · - [x] Tests pass · - [x] RTL verified · - [x] Google Sign-In wired (depends on [0.5](#05-firebase-auth--google-sign-in))

Couple silhouette illustration. "ברוכים הבאים! 🎉" heading. CTA button "בואו נתחיל" and the secondary login link ("כבר יש לי חשבון? התחברות") **both** trigger `signInWithGoogle()` — Google is the single sign-in entry point for new and returning couples alike. Where the user lands after a successful sign-in is decided by the [0.5 routing contract](#05-firebase-auth--google-sign-in) (new → onboarding wizard, returning → dashboard), not by which of the two elements was tapped.

**File:** `src/pages/Welcome/Welcome.tsx`

**Visual tests: `tests/pages/Welcome.spec.ts`**
- [x] Heading in Playfair Display, right-aligned
- [x] CTA button full-width, champagne gold
- [x] Login link below CTA
- [x] No bottom nav
- [x] Screenshot: `welcome.png`
- [x] CTA and login link both call `signInWithGoogle()` (mocked in test)
- [x] Post-sign-in routing: new user → `/onboarding/events`, returning user → `/dashboard`

---

#### 2.3 Event Selection (`/onboarding/events`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Step 2 of 6. 3×2 card grid (RTL — reads right-to-left). Multi-select with gold checkmark. "הוסף אירוע אחר" link. "הבא" button disabled until ≥ 1 selection.

**File:** `src/pages/EventSelection/EventSelection.tsx`

**Components used:** antd `Button`, `OnboardingShell`

**Visual tests: `tests/pages/EventSelection.spec.ts`**
- [x] 3×2 grid reads right-to-left (first card is top-right)
- [x] Unselected card: white, subtle shadow
- [x] Selected card: blush rose border + gold checkmark
- [x] "הבא" disabled with 0 selections; enabled with ≥ 1
- [x] Screenshot: `event-selection-empty.png`, `event-selection-one-selected.png`, `event-selection-multi-selected.png`

---

#### 2.4 Guest Count & Date (`/onboarding/guest-count`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Step 3 of 6. One card per selected event. Numeric stepper + month/year picker per card. "Skip date" checkbox.

**File:** `src/pages/GuestCountDate/GuestCountDate.tsx`

**Components used:** antd `Button`, `OnboardingShell`

**Visual tests: `tests/pages/GuestCountDate.spec.ts`**
- [x] One card rendered per selected event
- [x] Stepper −/+, number updates
- [x] Month/year picker opens on tap
- [x] "Skip date" checkbox disables the date picker
- [x] Screenshot: `guest-count-one-event.png`, `guest-count-two-events.png`

---

#### 2.5 Priorities & Vibe (`/onboarding/priorities`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Step 4 of 6. 8 category rows. 1–5 star tap rating. RTL star row (right-to-left order).

**File:** `src/pages/Priorities/Priorities.tsx`

**Components used:** antd `Button`, `OnboardingShell`

**Visual tests: `tests/pages/Priorities.spec.ts`**
- [x] 8 rows rendered
- [x] Stars fill right-to-left (RTL) after tap
- [x] Selecting a star updates that row's rating
- [x] Screenshot: `priorities-unrated.png`, `priorities-rated.png`

---

#### 2.6 Budget Range (`/onboarding/budget`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Step 5 of 6. 4 selectable tier cards (full-width). Selected: blush rose fill + gold border.

**File:** `src/pages/BudgetRange/BudgetRange.tsx`

**Components used:** antd `Button`, `OnboardingShell`

**Visual tests: `tests/pages/BudgetRange.spec.ts`**
- [x] 4 cards stacked full-width
- [x] Only one selectable at a time
- [x] Selected state: blush rose fill + champagne gold border
- [x] Helper text visible below cards
- [x] Screenshot: `budget-range-none.png`, `budget-range-selected.png`

---

#### 2.7 Couple Info (`/onboarding/couple-info`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Step 6 of 6. Two name fields side-by-side (RTL). Gender chip selector per partner. Region dropdown. Kosher toggle (champagne gold thumb).

**File:** `src/pages/CoupleInfo/CoupleInfo.tsx`

**Components used:** antd `Input`/`Form.Item`, antd `Button`, `OnboardingShell`

**Visual tests: `tests/pages/CoupleInfo.spec.ts`**
- [x] Two name fields side-by-side, RTL
- [x] Gender chips (♂ / ♀ / אחר): selected chip in champagne gold
- [x] Region dropdown opens in Hebrew
- [x] Kosher toggle: ON state gold thumb (not browser-default blue)
- [x] "סיום ✓" button full-width, champagne gold
- [x] Screenshot: `couple-info-empty.png`, `couple-info-filled.png`

---

#### 2.8 Onboarding Success (`/onboarding/success`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

Full-screen celebration. Gold checkmark circle. "הכל מוכן! 🎉". "קדימה לדשבורד" CTA.

**File:** `src/pages/OnboardingSuccess/OnboardingSuccess.tsx`

**Components used:** antd `Button`

**Visual tests: `tests/pages/OnboardingSuccess.spec.ts`**
- [x] Warm ivory background, watercolor illustration
- [x] Gold checkmark circle centred
- [x] Title in Playfair Display
- [x] CTA navigates to `/dashboard`
- [x] Screenshot: `onboarding-success.png`

---

## Phase 3 — Main App

All pages wrapped in `AppShell` (bottom nav + `PageHeader`).

---

#### 3.1 Dashboard (`/dashboard`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/Dashboard/Dashboard.tsx`
**Hook:** `src/pages/Dashboard/useDashboard.tsx` (5 parallel React Query reads + delta refresh)
**Locale:** `src/locales/he/dashboard.json`

**Sub-sections:**
- Greeting header (Playfair Display)
- `HeroCard` — upcoming event
- Budget summary card (progress bar, gift income, breakeven delta)
- Vendor chips — horizontal scroll, up to 6 selected vendors
- Other events — compact card list

**Visual tests: `tests/pages/Dashboard.spec.ts`**
- [x] Skeleton cards visible during load
- [x] All 5 sections render after data loads
- [x] Vendor chips scroll horizontally (RTL, right-to-left)
- [x] Budget progress bar fills right-to-left
- [x] Breakeven positive: sage green; negative: soft red
- [x] Screenshot: `dashboard-loading.png`, `dashboard-loaded.png`

**E2E test: `tests/e2e/dashboard-load.spec.ts`**
- [x] Delta refresh triggers after 5 min idle (mock timer)
- [x] Updated counts merge without full re-render

---

#### 3.2 Guest List (`/guests`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/GuestList/GuestList.tsx`
**Hook:** `src/pages/GuestList/useGuestList.tsx`
**Locale:** `src/locales/he/guests.json`

**Sub-sections:**
- `EventPillTab` — one tab per event
- antd `Statistic` 2×2 grid (`Row`/`Col`) — total / confirmed / cancelled / pending
- `DuplicateBanner` — conditional
- Guest list grouped by "מי הזמין" (section headers)
- `GuestRow` items
- antd `FloatButton` → opens Add Guest `BottomSheet`

**Visual tests: `tests/pages/GuestList.spec.ts`**
- [x] Section headers right-aligned
- [x] Guest rows RTL (name right, metadata left)
- [x] `DuplicateBanner` visible when duplicates exist; hidden otherwise
- [x] Switching event tab updates stats + list
- [x] FloatButton at bottom-left
- [x] Screenshot: `guest-list-no-duplicates.png`, `guest-list-with-duplicates.png`

---

#### 3.2a Add Guest (Bottom Sheet)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/features/guests/AddGuestSheet/AddGuestSheet.tsx`

**Fields:** שם · טלפון · מייל · מספר אורחים (stepper) · מי הזמין (dropdown) · אירועים (multi-select chips)

**Visual tests: `tests/features/AddGuestSheet.spec.ts`**
- [x] Sheet slides up to ~72% height
- [x] "שמור" disabled until name is filled
- [x] Duplicate warning banner appears inline after save when duplicates returned
- [x] Screenshot: `add-guest-sheet-empty.png`, `add-guest-sheet-filled.png`, `add-guest-sheet-duplicate-warning.png`

**E2E test: `tests/e2e/add-guest.spec.ts`**
- [x] Fill form → save → guest appears in correct section
- [x] Duplicate detection banner appears when similar name/phone exists

---

#### 3.2b Guest Detail (`/guests/:guestId`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/GuestDetail/GuestDetail.tsx`
**Hook:** `src/pages/GuestDetail/useGuestDetail.tsx`

**5 cards:** פרטי קשר · פרטי הגעה (RSVP chips + stepper) · אירועים (event chips) · שיוך (dropdown + table no.) · הערות

**Visual tests: `tests/pages/GuestDetail.spec.ts`**
- [x] PageHeader with back arrow on the right
- [x] antd `Avatar` (80px, initials via `getInitials`, Playfair Display)
- [x] RSVP chips: אישר (sage green) / ממתין (amber) / ביטל (soft red)
- [x] Optimistic update: chip color changes instantly on tap
- [x] Delete section: thin soft-red border card
- [x] Screenshot: `guest-detail-pending.png`, `guest-detail-confirmed.png`, `guest-detail-cancelled.png`

**E2E test: `tests/e2e/rsvp-update.spec.ts`**
- [x] Tap RSVP chip → optimistic color change → save → stats grid updates
- [x] Network failure → chip reverts + toast appears

---

#### 3.2c Duplicate Review (`/guests/duplicates`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/DuplicateReview/DuplicateReview.tsx`

List of duplicate pairs. Each pair: two guest cards side-by-side, reason label, "מזג" / "שמור בנפרד" actions.

**Visual tests: `tests/pages/DuplicateReview.spec.ts`**
- [x] Each pair shows both guests with similarity reason
- [x] "מזג" removes the secondary row
- [x] "שמור בנפרד" removes the pair from the list
- [x] Empty state when all resolved: "כל הכפילויות טופלו ✓"
- [x] Screenshot: `duplicate-review.png`, `duplicate-review-empty.png`

---

#### 3.2d Parent Share (`/share/:token`) — web-only, no bottom nav

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/ParentShare/ParentShare.tsx`
**Hook:** `src/pages/ParentShare/useParentShare.tsx`

No bottom nav, no app header. Token loaded from URL. Add-guest form with session list below.

**Visual tests: `tests/pages/ParentShare.spec.ts`**
- [x] No bottom nav rendered
- [x] Couple names as subtitle
- [x] Guest added → appears in session list below form
- [x] "שלח רשימה" → success message
- [x] Screenshot: `parent-share-empty.png`, `parent-share-with-guests.png`, `parent-share-submitted.png`

---

#### 3.3 Task List (`/tasks`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/TaskList/TaskList.tsx`
**Hook:** `src/pages/TaskList/useTaskList.tsx`
**Locale:** `src/locales/he/tasks.json`

**Sub-sections:**
- `EventPillTab`
- Category filter chips (horizontal scroll): כל המשימות · ספקים · תשלומים · ביגוד · טיפוח · לוגיסטיקה · שונות
- `TaskRow` items (grouped by category)
- antd `FloatButton` → opens Add Task `BottomSheet`

**Visual tests: `tests/pages/TaskList.spec.ts`**
- [x] Category chips scroll horizontally right-to-left
- [x] Active category chip: blush rose fill
- [x] Overdue task rows show red date tag
- [x] Completed tasks: strikethrough + sage green badge
- [x] Empty state illustration when no tasks
- [x] Screenshot: `task-list-all.png`, `task-list-category-filtered.png`, `task-list-empty.png`

---

#### 3.3a Add Task (Bottom Sheet)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/features/tasks/AddTaskSheet/AddTaskSheet.tsx`

**Fields:** שם · סוג (icon segment: Vendor/Payment/Decision/Reminder) · קטגוריה (chips) · עדיפות (chips) · אירוע · תאריך יעד · מי אחראי (avatar chips) · הערות

**Visual tests: `tests/features/AddTaskSheet.spec.ts`**
- [x] Type segmented selector: 4 icons, selected state highlighted
- [x] Priority chips: 4 options with correct tinted colors
- [x] "הוסף משימה" disabled until name filled
- [x] Screenshot: `add-task-sheet.png`

---

#### 3.3b Task Detail — Vendor (`/tasks/:taskId` where `type=vendor`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/TaskDetail/TaskDetailVendor.tsx`
**Hook:** `src/pages/TaskDetail/useTaskDetail.tsx`

Status selector · PriorityChip · responsible avatar · `VendorCard` list · "+ הוסף ספק" dashed card · notes · save button.

**Visual tests: `tests/pages/TaskDetailVendor.spec.ts`**
- [x] Status selector: 3 states, selected highlighted
- [x] Vendor cards stack vertically
- [x] "+ הוסף ספק" dashed border card at the bottom
- [x] Screenshot: `task-detail-vendor-no-vendors.png`, `task-detail-vendor-with-vendors.png`

**E2E test: `tests/e2e/vendor-comparison.spec.ts`**
- [x] Add 2 vendors → select one → other marked "נדחה" → task status → "בתהליך"

---

#### 3.3c Task Detail — Payment (`/tasks/:taskId` where `type=payment`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/TaskDetail/TaskDetailPayment.tsx`

Total amount · billing unit chip selector · advance/balance rows · deadline · "סמן כשולם" toggle · linked vendor compact card.

**Visual tests: `tests/pages/TaskDetailPayment.spec.ts`**
- [x] `BillingUnitChip` renders and updates total
- [x] Advance paid: ✅ + sage green; unpaid: 🔴 + soft red
- [x] Overdue deadline in soft red
- [x] Screenshot: `task-detail-payment-unpaid.png`, `task-detail-payment-advance-paid.png`, `task-detail-payment-fully-paid.png`

**E2E test: `tests/e2e/payment-tracking.spec.ts`**
- [x] Mark advance paid → balance updates → task auto-closes on full payment

---

#### 3.3d Task Detail — Decision (`/tasks/:taskId` where `type=decision`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/TaskDetail/TaskDetailDecision.tsx`

2 option cards side-by-side (RTL). Pros/cons columns. "+ הוסף אפשרות" dashed card. Final decision input (gold highlight when filled).

**Visual tests: `tests/pages/TaskDetailDecision.spec.ts`**
- [x] Two option cards side-by-side, right card first (RTL)
- [x] Pros column (✓) / Cons column (✗)
- [x] Final decision input highlights gold when text entered
- [x] Screenshot: `task-detail-decision.png`

---

#### 3.3e Task Detail — Reminder (`/tasks/:taskId` where `type=reminder`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/TaskDetail/TaskDetailReminder.tsx`

Date + time picker · push notification toggle (champagne gold ON) · linked task chip · dependency chip.

**Visual tests: `tests/pages/TaskDetailReminder.spec.ts`**
- [x] Toggle ON state: champagne gold (not default browser blue)
- [x] Linked task chip shows event + task name
- [x] Screenshot: `task-detail-reminder.png`

---

#### 3.4 Budget Overview (`/budget`)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/pages/Budget/Budget.tsx`
**Hook:** `src/pages/Budget/useBudget.tsx`
**Locale:** `src/locales/he/budget.json`

**Sub-sections:**
- Context chips (confirmed guests, days left)
- antd `Progress type="circle"` hero (donut ring, custom center via `format`) — % spent
- Gifts & breakeven card
- Scrollable category rows (icon · name · spent/budget · antd `Progress`)
- antd `FloatButton` → opens Add Expense `BottomSheet`

**Visual tests: `tests/pages/Budget.spec.ts`**
- [x] Donut ring fills proportionally
- [x] Breakeven positive: sage green chip; negative: soft red chip
- [x] Category progress bars fill right-to-left
- [x] "ערוך תקציב כולל" link visible below donut
- [x] Screenshot: `budget-overview.png`

---

#### 3.4a Add Expense (Bottom Sheet)

- [x] Built · - [x] Tests pass · - [x] RTL verified

**File:** `src/features/budget/AddExpenseSheet/AddExpenseSheet.tsx`

**Fields:** שם פריט · קטגוריה (chips) · עלות מוערכת · עלות בפועל · `BillingUnitChip` · חובה/רשות · אירוע · ספק מקושר · מי אחראי · הערות

**Visual tests: `tests/features/AddExpenseSheet.spec.ts`**
- [x] Selecting "per guest" billing unit shows live total hint (`₪X × N אורחים`)
- [x] Total field updates on each unit-price keystroke
- [x] `BillingUnitChip` and Task Payment Detail use visually identical component
- [x] Screenshot: `add-expense-sheet-per-item.png`, `add-expense-sheet-per-guest.png`

**E2E test: `tests/e2e/add-expense.spec.ts`**
- [x] Add per-guest expense → donut ring + category bar update
- [x] Breakeven chip updates after save

---

## Phase 4 — Integration E2E

Full end-to-end flows, run after all pages are implemented.

| Flow | Sequence doc | Test file | Status |
|------|-------------|-----------|--------|
| Sign up → onboarding → task list generated | [../sequences/onboarding/01-signup-and-onboarding.md](../sequences/onboarding/01-signup-and-onboarding.md) | `tests/e2e/onboarding.spec.ts` | - [ ] |
| Add guest + duplicate detection + resolve | [../sequences/guests/04-duplicate-detection.md](../sequences/guests/04-duplicate-detection.md) | `tests/e2e/duplicate-detection.spec.ts` | - [ ] |
| Parent share link → submit guests → couple notified | [../sequences/guests/02-parent-share.md](../sequences/guests/02-parent-share.md) | `tests/e2e/parent-share.spec.ts` | - [ ] |
| Breakeven recalculates on RSVP confirm | [../sequences/budget/02-breakeven-calculation.md](../sequences/budget/02-breakeven-calculation.md) | `tests/e2e/breakeven.spec.ts` | - [ ] |
| Dashboard load + delta refresh | [../sequences/dashboard/01-load-dashboard.md](../sequences/dashboard/01-load-dashboard.md) | `tests/e2e/dashboard-load.spec.ts` | - [ ] |

---

## Summary — Build Order

```
Phase 0   App Shell (providers, BottomNav, PageHeader, AppShell layout)
    ↓
Phase 1   Global components (1 custom atom + 6 composites — antd used directly elsewhere)
    ↓
Phase 2   Onboarding pages (2.1 → 2.8)
    ↓
Phase 3   Main app pages:
          3.1 Dashboard
          3.2 Guests (list → detail → duplicate review → parent share)
          3.3 Tasks (list → add sheet → 4 detail variants)
          3.4 Budget (overview → add expense sheet)
    ↓
Phase 4   Integration E2E tests
```

**Never start a phase until the previous phase's visual tests pass.** Global components are the dependency of everything — investing in them fully (correct RTL, correct colors, correct shapes) before touching pages means page work is fast and compositional.

---

_Last updated: 2026-06-05_
