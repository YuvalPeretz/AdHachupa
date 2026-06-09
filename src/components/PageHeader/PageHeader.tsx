import type { ReactNode } from 'react';
import { Flex } from 'antd';
import { MdArrowForward } from 'react-icons/md';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export function PageHeader({ title, onBack, actions }: PageHeaderProps) {
  return (
    <Flex component="header" align="center" className={styles.header}>
      {/* In RTL: inline-start = right side — back arrow lives here */}
      <Flex align="center" justify="flex-end" className={styles.side}>
        {onBack && (
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            aria-label="חזרה"
          >
            <MdArrowForward />
          </button>
        )}
      </Flex>

      <h1 className={styles.title}>{title}</h1>

      {/* In RTL: inline-end = left side — actions slot lives here */}
      <Flex align="center" justify="flex-start" className={styles.side}>
        {actions}
      </Flex>
    </Flex>
  );
}
