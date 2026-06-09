import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { TAB_ITEMS, TAB_ROUTES, type Tab } from '../nav/navTabs';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  activeTab: Tab;
}

export function Sidebar({ activeTab }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <nav className={styles.sidebar} aria-label="ניווט ראשי" data-testid="sidebar-nav">
      <div className={styles.brand}>
        <img src="/android-chrome-512x512.png" alt="עד החופה" className={styles.brandIcon} />
      </div>
      <div className={styles.tabList}>
        {TAB_ITEMS.map(({ key, icon, labelKey }) => (
          <button
            key={key}
            type="button"
            className={`${styles.tab}${activeTab === key ? ` ${styles.active}` : ''}`}
            onClick={() => navigate(TAB_ROUTES[key])}
            aria-current={activeTab === key ? 'page' : undefined}
            data-testid={`sidebar-tab-${key}`}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
