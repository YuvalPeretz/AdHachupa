import i18n from '../i18n';
import type { TaskStatus, VendorStatus, RsvpStatus } from '../types';

export interface StatusTagProps {
  color: string;
  label: string;
  /** For statuses that need explicit text color (antd Tag uses `color` for bg when it's a hex) */
  style?: React.CSSProperties;
}

type AnyStatus = TaskStatus | VendorStatus | RsvpStatus;

/**
 * Maps a task/vendor/RSVP status to antd Tag props.
 * Pass the returned `color` directly to antd <Tag color={...}>.
 * The `label` is the translated Hebrew string.
 *
 * Colour rules (from CLAUDE.md design system):
 *  - closed / selected / confirmed   → sage green  #A8C5A0  (white text)
 *  - inProgress / considering        → amber        #FFB74D  (charcoal text)
 *  - notStarted                      → light gray outline (no fill)
 *  - pending / cancelled / rejected  → soft red / muted gray outline
 */
export function getStatusTagProps(status: AnyStatus): StatusTagProps {
  switch (status) {
    // ── green group ──────────────────────────────────────────────────────────
    case 'closed':
      return {
        color: '#A8C5A0',
        label: i18n.t('status.closed'),
        style: { color: '#ffffff' },
      };
    case 'selected':
      return {
        color: '#A8C5A0',
        label: i18n.t('status.selected'),
        style: { color: '#ffffff' },
      };
    case 'confirmed':
      return {
        color: '#A8C5A0',
        label: i18n.t('status.confirmed'),
        style: { color: '#ffffff' },
      };

    // ── amber group ──────────────────────────────────────────────────────────
    case 'inProgress':
      return {
        color: '#FFB74D',
        label: i18n.t('status.inProgress'),
        style: { color: '#2D2D2D' },
      };
    case 'considering':
      return {
        color: '#FFB74D',
        label: i18n.t('status.considering'),
        style: { color: '#2D2D2D' },
      };

    // ── gray outline group ───────────────────────────────────────────────────
    case 'notStarted':
      return {
        color: 'default',
        label: i18n.t('status.notStarted'),
        style: { color: '#6B6B6B' },
      };
    case 'rejected':
      return {
        color: 'default',
        label: i18n.t('status.rejected'),
        style: { color: '#6B6B6B' },
      };

    // ── red / warning group ──────────────────────────────────────────────────
    case 'pending':
      return {
        color: '#E07070',
        label: i18n.t('status.pending'),
        style: { color: '#E07070', background: 'transparent', borderColor: '#E07070' },
      };
    case 'cancelled':
      return {
        color: '#E07070',
        label: i18n.t('status.cancelled'),
        style: { color: '#E07070', background: 'transparent', borderColor: '#E07070' },
      };

    default:
      return { color: 'default', label: String(status) };
  }
}
