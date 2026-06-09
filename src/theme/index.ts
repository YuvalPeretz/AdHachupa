import type { ThemeConfig } from 'antd';

/**
 * Ant Design generates hover/active palette tokens automatically from colorPrimary.
 * For blush rose (#F2C4CE) — a very light pastel — the algorithm produces
 * primary-1 through primary-5 as near-white (#fff0f0–#fff0f3), which makes
 * interactive states unreadable (white text on near-white bg).
 *
 * We keep colorPrimary as blush rose (correct for brand moments, status badges, etc.)
 * but explicitly override the derived interactive tokens so hover/active/focus
 * states darken rather than wash out.
 */
export const appTheme: ThemeConfig = {
  token: {
    // ── Brand colors ────────────────────────────────────────────────────────
    colorPrimary: '#F2C4CE',      // blush rose — brand, badges
    colorBgBase: '#FDF6EC',       // warm ivory — app background
    colorTextBase: '#2D2D2D',     // deep charcoal — all body text
    colorSuccess: '#A8C5A0',      // sage green
    colorWarning: '#FFB74D',      // amber
    colorError: '#E07070',        // soft red
    colorLink: '#C9A97A',         // champagne gold — links, active tab

    // ── Override derived hover/active tokens ─────────────────────────────────
    // Without these, the palette algorithm produces near-white (#fff0f0) for
    // primary-1 through primary-5, causing hover states to look washed out.
    colorPrimaryHover: '#d4a0af',   // darker blush — primary button hover bg
    colorPrimaryActive: '#bc8696',  // even darker — primary button :active bg
    colorPrimaryBorder: '#e8b4be',  // visible border tint
    colorPrimaryBg: 'rgba(242, 196, 206, 0.12)',      // selection / tag bg
    colorPrimaryBgHover: 'rgba(242, 196, 206, 0.22)', // hovered selection bg

    // ── Shape & typography ───────────────────────────────────────────────────
    borderRadius: 12,
    borderRadiusLG: 16,
    fontFamily: "'Rubik', sans-serif",

    // ── Focus ring ───────────────────────────────────────────────────────────
    // Default focus outline uses colorPrimary; override to champagne gold so
    // the ring is visible on both white and blush backgrounds.
    controlOutline: 'rgba(201, 169, 122, 0.25)',
    controlOutlineWidth: 2,
  },

  components: {
    Button: {
      // Primary buttons (CTA — next/save actions)
      // colorPrimaryHover/Active above control the bg; set text to always be white.
      primaryColor: '#fff',

      // Default / ghost buttons
      defaultHoverBg: 'rgba(242, 196, 206, 0.08)',
      defaultHoverColor: '#2D2D2D',
      defaultHoverBorderColor: '#C9A97A',
      defaultActiveBg: 'rgba(242, 196, 206, 0.18)',
      defaultActiveColor: '#2D2D2D',
      defaultActiveBorderColor: '#C9A97A',
    },
  },
};
