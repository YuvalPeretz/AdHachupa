import { FloatButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router';
import { useAppDispatch } from '../../store';
import { openAddSheet, type AddSheet } from '../../store/uiSlice';
import { useIsDesktop } from '../../hooks/useIsDesktop';

interface FabConfig {
  sheet: AddSheet;
  testId: string;
  ariaLabel: string;
}

const FAB_CONFIG: Record<string, FabConfig> = {
  '/guests': { sheet: 'guest',   testId: 'add-guest-fab',   ariaLabel: 'הוספת אורח' },
  '/tasks':  { sheet: 'task',    testId: 'add-task-fab',    ariaLabel: 'הוספת משימה' },
  '/budget': { sheet: 'expense', testId: 'add-expense-fab', ariaLabel: 'הוספת הוצאה' },
};

export function GlobalFAB() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const isDesktop = useIsDesktop();

  const config = FAB_CONFIG[pathname];
  if (!config || isDesktop) return null;

  return (
    <FloatButton
      icon={<PlusOutlined />}
      type="primary"
      style={{
        backgroundColor: '#C9A97A',
        borderColor: '#C9A97A',
        insetInlineStart: 20,
        insetInlineEnd: 'auto',
        bottom: isDesktop ? 20 : 80,
      }}
      onClick={() => dispatch(openAddSheet(config.sheet))}
      data-testid={config.testId}
      aria-label={config.ariaLabel}
    />
  );
}
