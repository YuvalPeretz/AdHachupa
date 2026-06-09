# Development Guidelines — MeAndShir

> Companion to the project spec in [../CLAUDE.md](../CLAUDE.md). CLAUDE.md describes **what** we build (screens, data models, flows); this file describes **how** we build it (stack, patterns, conventions).

## 🔄 Meta Instruction

**The agent MUST read these guidelines before starting work** to ensure consistency and adherence to project standards.

**At the end of a session where new decisions, patterns, or architectural changes were made, the agent MUST update this file** to reflect them. This is a living document.

---

## 🧱 Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | **React 19** + **TypeScript** |
| Build / dev | **Vite** |
| UI library | **Ant Design v6** (`antd`) |
| Icons | **react-icons** |
| Routing | **react-router v7** |
| Server state / data fetching | **TanStack React Query v5** (`@tanstack/react-query`) |
| Global client state | **Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) |
| Backend | **Firebase** (Firestore + Auth) |
| Styling | antd `ConfigProvider` → SCSS Modules (`sass`) → inline |
| Internationalization | **react-i18next** (`i18next` + `react-i18next` + `i18next-browser-languagedetector`) |
| E2E testing | **Playwright** |
| Linting | ESLint 9+ flat config (`typescript-eslint`, `react-hooks`, `react-refresh`) |

The app is a **mobile-first, RTL, Hebrew web app** (not native, not Electron). It must be fully functional in mobile browsers. See [../CLAUDE.md](../CLAUDE.md) for the product spec.

> **Note on the repo layout:** the runnable Vite app lives at the **project root** — [../src/](../src/), [../index.html](../index.html), and the build/lint configs all sit at the root, governed by a single [../package.json](../package.json). All application code goes under [../src/](../src/).

---

## 📁 Project Structure & Component Organization

### Component File Structure

All components follow this standardized structure:

```
componentName/
  ├── componentName.tsx          # Main component file (always)
  ├── useComponentName.tsx       # Custom hook (conditional)
  └── componentName.module.scss  # Component styles (conditional)
```

**Rules:**

- **Main Component File**: Always required (`componentName.tsx`)
- **Custom Hook File**: Create `useComponentName.tsx` ONLY when the component has substantial state/effect/data-fetching logic that would clutter the main component file (e.g. React Query hooks, multi-field form state)
- **Style Module**: Create `componentName.module.scss` ONLY when component-specific styling is needed beyond what the antd `ConfigProvider` theme and `<Flex>` layout already give you

### Suggested folder layout (under `src/`)

```
src/
  components/        # Reusable presentational components (see CLAUDE.md "Component Library")
  features/          # Feature slices: onboarding/, guests/, tasks/, budget/, dashboard/
  hooks/             # Cross-feature hooks (queries, mutations, utilities)
  store/             # Redux Toolkit store + slices
  i18n/              # i18next init + TS key augmentation
  locales/           # Translation catalogs — locales/he/<namespace>.json
  lib/               # firebase.ts init, query client, shared utils
  theme/             # antd ConfigProvider theme tokens (design system)
  pages/ or routes/  # Route-level screens
```

---

## 🌐 RTL & Hebrew-First (Non-Negotiable)

This is the single most important constraint of the project. Everything is **RTL and Hebrew-first**.

- `index.html` root must declare `<html lang="he" dir="rtl">`
- Wrap the app in antd `<ConfigProvider direction="rtl">` so all antd components mirror correctly
- **Use CSS logical properties** in SCSS — `margin-inline-start`, `padding-inline-end`, `inset-inline-start` — never hard-coded `left`/`right`
- Back arrows point right (→), chevrons point left (‹), progress bars fill right-to-left
- Reading order starts top-right
- Dates: `DD/MM/YYYY`; currency: `₪` prefix; use tabular figures for numeric lists
- **Every screen must be verified in RTL** before it is considered done

---

## 🌍 Internationalization (i18n)

The app uses **`i18next` + `react-i18next`** (with `i18next-browser-languagedetector`). **Hebrew (`he`) is currently the only locale**, but the setup is structured so additional locales drop in without refactoring.

> Do **not** use the server-side `i18n` (node-i18n) package — it is Node/Express-oriented and unsuitable for a React SPA. `react-i18next` is the standard here.

### Golden rule

**No hard-coded user-facing strings in components.** Every visible string — labels, buttons, statuses, validation messages, empty states, toasts — comes from a locale catalog via `t()`. This holds even while we are Hebrew-only: it gives one source of truth for the domain's Hebrew terminology (the status / priority / RSVP / event-type labels in [../CLAUDE.md](../CLAUDE.md)), prevents drift and typos, and makes future localization a non-event.

> Data **from Firebase** — guest names, vendor names, notes — is user content and is **never** translated. i18n covers UI chrome only.

### Files & structure

```
src/
  i18n/
    index.ts          # i18next init: config, resource registration, detector, fallbackLng: 'he'
    i18next.d.ts      # TS module augmentation → type-safe, autocompleted t() keys
  locales/
    he/
      common.json     # shared: buttons, nav, generic labels
      validation.json # form / validation messages
      onboarding.json
      guests.json
      tasks.json
      budget.json
      dashboard.json
```

- **One namespace per feature** (plus `common` and `validation`). Keeps catalogs small and enables lazy-loading later.
- Initialize i18n **before** the app renders: `import './i18n'` at the top of `main.tsx`, above `<App/>`.
- With static JSON imports (Hebrew-only) no `Suspense` is required; if we later lazy-load locales, wrap the app in `<Suspense>`.

### Type safety (required)

Augment i18next so `t()` keys are checked at compile time and autocompleted:

```ts
// src/i18n/i18next.d.ts
import 'i18next';
import type common from '../locales/he/common.json';
import type guests from '../locales/he/guests.json';
// …one import per namespace

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      guests: typeof guests;
      // …
    };
  }
}
```

`he` is the **source of truth** for key types — every locale added later must mirror its shape.

### Usage conventions

- Use the hook: `const { t } = useTranslation('guests'); t('rsvp.confirmed')`
- In non-component code, import the configured `i18n` instance directly (`i18n.t(...)`)
- **Semantic, nested keys** (`tasks.status.inProgress`) — never the Hebrew sentence as the key; keys stay stable across translation and refactors
- **Never concatenate translated fragments.** Use interpolation (`t('dashboard.countdown', { days })`) and i18next plurals for counts
- Centralize **domain enum → key** mappings (RSVP status, task/vendor status, priority, event type, billing unit) in one module so the Hebrew labels from CLAUDE.md render from the catalog, not inline literals
- Numbers / dates / currency go through a shared formatter util — `DD/MM/YYYY`, `₪` prefix, tabular figures

### Relationship to RTL

Today `dir="rtl"` is fixed (see the RTL section). When a second locale is added, derive direction from the active language — `i18n.dir()` → feed into both `<html dir>` and antd `<ConfigProvider direction>` — and introduce a language switcher then. No switcher UI for now.

---

## 🔧 State Management

Three tiers — pick the lowest tier that fits:

### 1. Local state — `useState`
For simple, component-local UI state (toggles, input focus, a single field). Do **not** use `useReducer`; if local logic grows complex, lift it into a Redux slice or a custom hook.

### 2. Server state — **React Query** (`@tanstack/react-query`)
All data that lives in Firebase is **server state** and belongs in React Query, never in Redux.

- Reads → `useQuery`; writes → `useMutation` with explicit cache invalidation (`queryClient.invalidateQueries`)
- **Never call Firestore directly inside a component.** Wrap every read/write in a query/mutation hook (in `hooks/` or the component's `useComponentName.tsx`)
- Use stable, structured query keys (e.g. `['guests', coupleId]`, `['tasks', { coupleId, eventId }]`)
- Apply **optimistic updates** for instant-feeling actions like RSVP changes — and roll back on error (see [../sequences/guests/03-rsvp-update.md](../sequences/guests/03-rsvp-update.md))

### 3. Global client state — **Redux Toolkit** (`@reduxjs/toolkit`)
For cross-cutting client-only state that is **not** server data. Good fits in this app:

- The onboarding wizard's accumulated answers across the 6 steps (persisted in one atomic write at the end — see [../sequences/onboarding/01-signup-and-onboarding.md](../sequences/onboarding/01-signup-and-onboarding.md))
- Active event pill tab shared across Guests / Tasks / Budget
- Session/auth user info, app-wide UI preferences

**Conventions:**
- Use `createSlice`; configure the store in `store/`
- Export and use **typed hooks** (`useAppSelector`, `useAppDispatch`) — never the untyped versions
- One slice per feature; keep reducers pure and serializable
- If you find yourself prop-drilling 2+ levels for client state, reach for a slice

> ⚠️ Don't duplicate server data into Redux. Firebase data → React Query. Client/UI state → Redux. Local-only → `useState`.

---

## 🔥 Data Layer (Firebase)

- Initialize Firebase **once** in `lib/firebase.ts` and export typed accessors (Firestore `db`, `auth`)
- Keep Firestore reads/writes behind React Query hooks (see above) so caching, loading, and error states are consistent
- Match the data models in [../CLAUDE.md](../CLAUDE.md): Couple, Event, Guest, Task/Item (+ sub-tables), Vendor, Budget
- The Mermaid diagrams in [../sequences/](../sequences/) describe the **logical** flows and use REST-style endpoint names (`POST /onboarding`, `PATCH /guests/{id}`, …). Treat those as the contract/behavior to implement; the concrete implementation is Firestore operations (and Cloud Functions for atomic multi-document transactions like onboarding, vendor selection, and merge).
- Never commit Firebase secrets — use Vite env vars (`import.meta.env.VITE_*`) and keep them out of git

---

## 🎨 Styling Guidelines

### ⚠️ ABSOLUTE PROHIBITION

**You MAY NOT use any TailwindCSS classes or configuration under any circumstances.**

### Styling Hierarchy (strict order of priority)

1. **Ant Design `ConfigProvider`** *(first)*
   - Drive the design system through theme tokens: colors, typography, radii, component defaults, and `direction="rtl"`
   - Map the [../CLAUDE.md](../CLAUDE.md) design tokens here (blush rose `#F2C4CE`, warm ivory `#FDF6EC`, champagne gold `#C9A97A`, sage green `#A8C5A0`, etc.) and centralize them in `theme/`
   - Use for: colors, fonts (Playfair Display headings / Rubik body), spacing, radii, default component props

2. **Component-Specific SCSS Modules** *(second)*
   - Create `componentName.module.scss` for component-specific styling not expressible via tokens
   - CSS Modules ensure encapsulation; use **logical properties** for RTL safety
   - Use for: complex layouts, bespoke patterns, hover states, animations

3. **Inline styling** *(last resort)*
   - ONLY for dynamic values or one-off adjustments (calculated positions, prop-driven colors)

### Layout Components

**Prefer Ant Design's `<Flex>` over plain `<div>` for layouts:**
- Use `<Flex>` props (`justify`, `align`, `gap`, `vertical`, `wrap`) instead of hand-written flexbox CSS
- Use `<div>` only when semantic HTML requires it or `<Flex>` doesn't fit
- Benefits: consistent token-based spacing, readability, built-in responsiveness, less custom CSS

### Responsive Design

- **Mobile-first.** Target viewport is iPhone 14 Pro (393×852pt); the layout must also work on tablet and desktop
- No bottom-nav on desktop; full bottom-nav on mobile (see CLAUDE.md)
- Prefer relative units (`rem`, `%`, `vw/vh`) over fixed pixels where appropriate

### Design Aesthetic

Romantic & elegant, modern, simplistic, consistent — "quiet luxury." Warm ivory over pure white, generous whitespace, soft rounded corners (12–16px), diffused ambient shadows. See [../stitch/stitch/romantic_elegant_design_system/DESIGN.md](../stitch/stitch/romantic_elegant_design_system/DESIGN.md).

---

## 💻 Code Quality & Best Practices

### Component Design Principles
- **Single Responsibility**: each component does one thing well
- **Composition over inheritance**: build complex UIs from small, reusable components (see CLAUDE.md "Component Library to extract")
- **DRY**: extract shared logic into hooks or utilities
- **Separation of concerns**: keep business/data logic (hooks, slices, queries) out of presentation

### Code Organization
- Break large components into smaller pieces
- Extract complex logic into custom hooks
- Use TypeScript types/interfaces consistently; model domain types after the CLAUDE.md data models
- Write self-documenting code with clear naming

### Function & Variable Declaration Conventions

**Prefer `function` declarations for:**
- **React components**: `function ComponentName()`
- **Regular functions**: `function functionName()` for utilities/helpers
- **Custom hooks**: `function useHookName()`

**Use `const` for:**
- **Constants**: immutable values, config objects, literals
- **Arrow functions**: inline callbacks / when lexical `this` is needed
- **Variables**: anything not reassigned

### Deprecation Management

After every code change, actively check for and remove deprecated code:
- **Unused imports** — rely on TS `noUnusedLocals`/`noUnusedParameters` (already enabled) and ESLint
- **Dead code** — delete commented-out code, unused functions, unreachable paths
- **Outdated patterns** — refactor to current project standards
- **Orphaned files** — remove components/hooks/utilities no longer referenced
- **Debug `console.log`** — remove before considering work done

**How to check:** run `npm run lint` and `tsc -b`; address TODO/FIXME; review for orphaned files.

---

## 🧭 Routing

- Use **react-router v7**. Define routes at the app shell level
- Map routes to the screens in CLAUDE.md (onboarding wizard steps, the 4 main tabs, detail screens, and the standalone **Parent Share** web view which has **no bottom nav**)
- Keep the bottom navigation (Home / Guests / Tasks / Budget) as a persistent layout around the 4 main tabs on mobile

---

## 🧪 Testing

- **Playwright** for end-to-end flows. Prioritize the critical journeys in [../sequences/](../sequences/): onboarding → task generation, add guest + duplicate detection, vendor comparison, payment tracking, add expense, dashboard load
- **Always run tests in RTL** and at the mobile viewport
- Only mark a feature/todo complete after it has been tested

---

## 📦 Package Management

**⚠️ CRITICAL: Do NOT install any npm package without explicit user consent.**

Before installing any package:
1. Ask the user for permission
2. Explain why it's needed
3. Wait for approval before installing

---

## 📝 Project Tracking

Maintain `development/todo.md` with checkable tasks:
- Mark tasks `- [x]` only after they're built **and tested**
- Keep a "Current Sprint" section reflecting active work
- Break large tasks into smaller trackable subtasks
- Note blockers in context
- Reference it before starting work to understand scope and priorities

---

## 📋 Development Workflow

1. **Read guidelines** (this file) and the relevant [../CLAUDE.md](../CLAUDE.md) / [../sequences/](../sequences/) docs
2. **Plan architecture** — component structure, which state tier, which query/mutation hooks
3. **Implement** following the established patterns (RTL, antd ConfigProvider, React Query, Redux Toolkit)
4. **Review** against these guidelines
5. **Check for deprecated code** — run lint + typecheck, remove dead code, unused imports, stray console logs
6. **Verify in RTL + mobile viewport**
7. **Update guidelines** if new patterns or decisions emerged

---

## 🔄 Maintenance Reminder

This is a living document. Update it whenever:
- New architectural patterns are established
- Important technical decisions are made
- Common issues and their solutions are discovered
- Project requirements evolve

---

## 🎯 Project Overview

**MeAndShir** — a Hebrew-first, RTL, mobile-first **web application** for Israeli couples managing their wedding and related events (חתונה, חינה, מסיבת רווקים/ות, שבת חתן, מקווה/הפרשת חלה, קבלת פנים).

**Core Goal:** Take a couple from sign-up through a short onboarding wizard to a personalised, auto-generated task list, then give them ongoing tools to manage guests, tasks, vendors, and budget — all in elegant Hebrew RTL on their phone.

Full product spec, screens, data models, and flows: [../CLAUDE.md](../CLAUDE.md).

---

## ✨ Core Features (MVP)

- **Onboarding wizard** — 6-step flow (events → guest count & date → priorities → budget range → couple info → success), accumulated client-side and persisted in one atomic write that auto-generates the task list
- **Personalised task list** — templated tasks per event type with priority filtering and suggested deadlines; 4 task-type detail variants (Vendor / Payment / Decision / Reminder)
- **Guest management** — add guests with fuzzy duplicate detection, RSVP tracking with optimistic updates, parent-share web link, grouping by "מי הזמין"
- **Vendor comparison** — add and compare vendor options per task, select one (links to budget)
- **Budget** — overview with donut ring + category breakdown, add-expense modal with per-item / per-guest / per-hour billing units, breakeven & gift-income tracking
- **Dashboard** — upcoming-event hero card, budget summary, selected vendors, other events

**Later phases:** calendar with date/price recommendations, WhatsApp/SMS messaging, payment processing (סליקה), digital invitations.

---

## 📅 Project Status

**Current Phase:** Phase 0 — Foundation / scaffolding.

**In place:**
- ✅ Vite + React 19 + TypeScript scaffold (project root)
- ✅ ESLint flat config, strict TS (`noUnusedLocals`/`noUnusedParameters`)
- ✅ Core dependencies selected: antd v6, React Query, Redux Toolkit, react-router v7, react-icons, Firebase, react-i18next, Playwright
- ✅ Product spec, screen architecture, design system, and sequence diagrams documented

**Next:**
- 📅 Replace the Vite starter `App.tsx` with the app shell (RTL `ConfigProvider`, router, React Query provider, Redux store, i18n init)
- 📅 Set up `lib/firebase.ts`, theme tokens, `i18n/` + `locales/he/`, and the bottom-nav layout
- 📅 Build the onboarding wizard and task generation
- 📅 Build guests, tasks, budget, and dashboard screens
- 📅 Establish `development/todo.md` and Playwright e2e coverage

---

_Last updated: 2026-06-05 — migrated from the Stremio Addon Manager guidelines and adapted to the MeAndShir stack (React Query + Redux Toolkit, antd v6 + SCSS modules, RTL/Hebrew-first, Firebase, react-i18next). App consolidated to the project root (no `wedding-app/` subfolder)._
