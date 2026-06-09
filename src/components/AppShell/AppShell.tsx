import { Outlet, useLocation } from "react-router";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { resolveActiveTab } from "../nav/navTabs";
import { BottomNav } from "../BottomNav/BottomNav";
import { Sidebar } from "../Sidebar/Sidebar";
import { GlobalFAB } from "../GlobalFAB/GlobalFAB";
import styles from "./AppShell.module.scss";

export function AppShell() {
  const { pathname } = useLocation();
  const activeTab = resolveActiveTab(pathname);
  const isDesktop = useIsDesktop();

  return (
    <div className={styles.shell}>
      {isDesktop && <Sidebar activeTab={activeTab} />}
      <main className={styles.content}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
      {!isDesktop && <BottomNav activeTab={activeTab} />}
      <GlobalFAB />
    </div>
  );
}
