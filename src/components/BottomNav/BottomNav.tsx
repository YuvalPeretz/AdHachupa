import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { TAB_ITEMS, TAB_ROUTES, type Tab } from '../nav/navTabs';
import styles from './BottomNav.module.scss';

interface BottomNavProps {
  activeTab: Tab;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <nav className={styles.nav} aria-label="ניווט ראשי" data-testid="bottom-nav">
      <div className={styles.tabList}>
        {TAB_ITEMS.map(({ key, icon, labelKey }) => (
          <button
            key={key}
            type="button"
            className={`${styles.tab}${activeTab === key ? ` ${styles.active}` : ''}`}
            onClick={() => navigate(TAB_ROUTES[key])}
            aria-current={activeTab === key ? 'page' : undefined}
          >
            <span className={styles.icon}>{icon}</span>
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
