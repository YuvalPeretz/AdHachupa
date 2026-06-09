import { Drawer, Modal } from 'antd';
import type { ReactNode } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import styles from './BottomSheet.module.scss';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        title={title}
        footer={null}
        centered
        width={560}
        destroyOnClose
        className={styles.modal}
        classNames={{ header: styles.modalHeader, body: styles.modalBody }}
      >
        {children}
      </Modal>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      style={{ height: '72vh' }}
      title={title}
      className={styles.drawer}
      classNames={{ header: styles.header, body: styles.body }}
      closeIcon={null}
    >
      {/* Handle bar */}
      <div className={styles.handle} aria-hidden="true" />
      {children}
    </Drawer>
  );
}
