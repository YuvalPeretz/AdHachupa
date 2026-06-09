import { createBrowserRouter } from 'react-router';
import { AppShell } from './components/AppShell/AppShell';
import { Splash } from './pages/Splash/Splash';
import { Welcome } from './pages/Welcome/Welcome';
import { EventSelection } from './pages/EventSelection/EventSelection';
import { GuestCountDate } from './pages/GuestCountDate/GuestCountDate';
import { BudgetRange } from './pages/BudgetRange/BudgetRange';
import { CoupleInfo } from './pages/CoupleInfo/CoupleInfo';
import { OnboardingSuccess } from './pages/OnboardingSuccess/OnboardingSuccess';
import { RequireAuth } from './features/auth/RequireAuth';
import { RedirectIfAuthed } from './features/auth/RedirectIfAuthed';
import { RequireOnboarding } from './features/auth/RequireOnboarding';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { GuestList } from './pages/GuestList/GuestList';
import { GuestDetail } from './pages/GuestDetail/GuestDetail';
import { DuplicateReview } from './pages/DuplicateReview/DuplicateReview';
import { ParentShare } from './pages/ParentShare/ParentShare';
import { TaskList } from './pages/TaskList/TaskList';
import { TaskDetail } from './pages/TaskDetail/TaskDetail';
import { Budget } from './pages/Budget/Budget';
import { Settings } from './pages/Settings/Settings';
// TEST ONLY - remove after Phase 0
import { PageHeaderWithBackPage } from './components/PageHeader/PageHeaderWithBackPage';
// TEST ONLY - remove after Phase 0
import { PageHeaderNoBackPage } from './components/PageHeader/PageHeaderNoBackPage';
// TEST ONLY - remove after Phase 1
import { EventPillTabPage } from './components/EventPillTab/EventPillTabPage';
// TEST ONLY - remove after Phase 1
import { BottomSheetPage } from './components/BottomSheet/BottomSheetPage';
// TEST ONLY - remove after Phase 1
import { HeroCardPage } from './components/HeroCard/HeroCardPage';
// TEST ONLY - remove after Phase 1
import { GuestRowPage } from './components/GuestRow/GuestRowPage';
// TEST ONLY - remove after Phase 1
import { TaskRowPage } from './components/TaskRow/TaskRowPage';
// TEST ONLY - remove after Phase 1
import { VendorCardPage } from './components/VendorCard/VendorCardPage';
// TEST ONLY - remove after Phase 1
import { DuplicateBannerPage } from './components/DuplicateBanner/DuplicateBannerPage';

export const router = createBrowserRouter([
  // Splash — true entry point; redirects authenticated users away immediately
  {
    path: '/',
    element: (
      <RedirectIfAuthed>
        <Splash />
      </RedirectIfAuthed>
    ),
  },
  // Onboarding flow — no bottom nav
  {
    path: '/onboarding/welcome',
    element: (
      <RedirectIfAuthed>
        <Welcome />
      </RedirectIfAuthed>
    ),
  },
  {
    path: '/onboarding/events',
    element: (
      <RequireOnboarding>
        <EventSelection />
      </RequireOnboarding>
    ),
  },
  {
    path: '/onboarding/guest-count',
    element: (
      <RequireOnboarding>
        <GuestCountDate />
      </RequireOnboarding>
    ),
  },
  {
    path: '/onboarding/budget',
    element: (
      <RequireOnboarding>
        <BudgetRange />
      </RequireOnboarding>
    ),
  },
  {
    path: '/onboarding/couple-info',
    element: (
      <RequireOnboarding>
        <CoupleInfo />
      </RequireOnboarding>
    ),
  },
  {
    path: '/onboarding/success',
    element: (
      <RequireAuth>
        <OnboardingSuccess />
      </RequireAuth>
    ),
  },
  // Main app — AppShell with bottom nav
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [{ index: true, element: <Dashboard /> }],
  },
  {
    path: '/guests',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <GuestList /> },
      { path: 'duplicates', element: <DuplicateReview /> },
      { path: ':guestId', element: <GuestDetail /> },
    ],
  },
  // Parent Share — standalone web view; NOT behind RequireAuth (parents aren't authenticated)
  {
    path: '/share/:token',
    element: <ParentShare />,
  },
  {
    path: '/tasks',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <TaskList /> },
      { path: ':taskId', element: <TaskDetail /> },
    ],
  },
  {
    path: '/budget',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [{ index: true, element: <Budget /> }],
  },
  {
    path: '/settings',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [{ index: true, element: <Settings /> }],
  },
  // TEST ONLY - remove after Phase 0
  {
    path: '/test/page-header-with-back',
    element: <PageHeaderWithBackPage />,
  },
  // TEST ONLY - remove after Phase 0
  {
    path: '/test/page-header-no-back',
    element: <PageHeaderNoBackPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/event-pill-tab',
    element: <EventPillTabPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/bottom-sheet',
    element: <BottomSheetPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/hero-card',
    element: <HeroCardPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/guest-row',
    element: <GuestRowPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/task-row',
    element: <TaskRowPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/vendor-card',
    element: <VendorCardPage />,
  },
  // TEST ONLY - remove after Phase 1
  {
    path: '/test/duplicate-banner',
    element: <DuplicateBannerPage />,
  },
]);
