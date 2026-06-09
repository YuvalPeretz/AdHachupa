import { MdHome, MdPeople, MdCheckCircle, MdAccountBalanceWallet } from 'react-icons/md';

export type Tab = 'home' | 'guests' | 'tasks' | 'budget';

export const TAB_ROUTES: Record<Tab, string> = {
  home: '/dashboard',
  guests: '/guests',
  tasks: '/tasks',
  budget: '/budget',
};

export type NavLabelKey = 'nav.home' | 'nav.guests' | 'nav.tasks' | 'nav.budget';

export interface NavTabItem {
  key: Tab;
  icon: React.ReactNode;
  labelKey: NavLabelKey;
}

export const TAB_ITEMS: NavTabItem[] = [
  { key: 'home', icon: <MdHome />, labelKey: 'nav.home' },
  { key: 'guests', icon: <MdPeople />, labelKey: 'nav.guests' },
  { key: 'tasks', icon: <MdCheckCircle />, labelKey: 'nav.tasks' },
  { key: 'budget', icon: <MdAccountBalanceWallet />, labelKey: 'nav.budget' },
];

export function resolveActiveTab(pathname: string): Tab {
  if (pathname.startsWith('/guests')) return 'guests';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/budget')) return 'budget';
  return 'home';
}
