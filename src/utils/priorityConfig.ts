import i18n from '../i18n';
import type { TaskPriority } from '../types';

export interface PriorityTagProps {
  /** Background colour at 15 % opacity — pass as antd Tag `color` */
  color: string;
  label: string;
  style?: React.CSSProperties;
}

/**
 * Maps a TaskPriority to antd Tag props.
 * Backgrounds are the design-system tint colours at 15 % opacity.
 *
 * Priority → colour (from CLAUDE.md):
 *  essential  → blush rose   #F2C4CE  (15 % opacity bg)
 *  logistic   → sage green   #A8C5A0  (15 % opacity bg)
 *  aesthetic  → soft purple  #D1C4E9  (15 % opacity bg)
 *  personal   → peach        #FFCCBC  (15 % opacity bg)
 */
export function getPriorityTagProps(priority: TaskPriority): PriorityTagProps {
  switch (priority) {
    case 'essential':
      return {
        color: '#F2C4CE',
        label: i18n.t('priority.essential'),
        style: {
          background: 'rgba(242, 196, 206, 0.15)',
          color: '#2D2D2D',
          borderColor: '#F2C4CE',
        },
      };
    case 'logistic':
      return {
        color: '#A8C5A0',
        label: i18n.t('priority.logistic'),
        style: {
          background: 'rgba(168, 197, 160, 0.15)',
          color: '#2D2D2D',
          borderColor: '#A8C5A0',
        },
      };
    case 'aesthetic':
      return {
        color: '#D1C4E9',
        label: i18n.t('priority.aesthetic'),
        style: {
          background: 'rgba(209, 196, 233, 0.15)',
          color: '#2D2D2D',
          borderColor: '#D1C4E9',
        },
      };
    case 'personal':
      return {
        color: '#FFCCBC',
        label: i18n.t('priority.personal'),
        style: {
          background: 'rgba(255, 204, 188, 0.15)',
          color: '#2D2D2D',
          borderColor: '#FFCCBC',
        },
      };
    default:
      return { color: 'default', label: String(priority) };
  }
}
