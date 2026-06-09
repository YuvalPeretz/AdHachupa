---
name: Romantic & Elegant Design System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4f4446'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#817476'
  outline-variant: '#d3c3c5'
  surface-tint: '#78555d'
  primary: '#78555d'
  on-primary: '#ffffff'
  primary-container: '#f2c4ce'
  on-primary-container: '#724f58'
  inverse-primary: '#e8bbc5'
  secondary: '#4b6546'
  on-secondary: '#ffffff'
  secondary-container: '#cdebc4'
  on-secondary-container: '#516b4c'
  tertiary: '#745a32'
  on-tertiary: '#ffffff'
  tertiary-container: '#edcb99'
  on-tertiary-container: '#6d552d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#e8bbc5'
  on-primary-fixed: '#2d131b'
  on-primary-fixed-variant: '#5e3e46'
  secondary-fixed: '#cdebc4'
  secondary-fixed-dim: '#b1cfa9'
  on-secondary-fixed: '#092008'
  on-secondary-fixed-variant: '#344d30'
  tertiary-fixed: '#ffdeae'
  tertiary-fixed-dim: '#e3c191'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#5a431d'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

This design system is built to evoke a sense of romance, calm, and meticulous organization. It serves as a digital companion for one of life's most significant milestones, balancing high-end editorial aesthetics with the practical functionality required for event management.

The visual direction combines **Modern Minimalism** with **Sophisticated Tonal Layering**. By utilizing a warm, ivory-based palette instead of sterile whites, the UI feels approachable and soft. The style is characterized by generous whitespace, fine-lined dividers, and a focus on high-quality typography to ensure the planning process feels like a curated experience rather than a chore. 

The emotional response should be one of "quiet luxury"—sophisticated enough for a high-end wedding, but clear and organized enough to reduce the stress of logistics.

## Colors

The color palette is rooted in nature and classical elegance. 

- **Primary (Blush Rose):** Used for primary actions, key brand moments, and "Essential" status indicators. It provides a warm, romantic focal point.
- **Background (Warm Ivory):** The foundation of the system. It replaces pure white to reduce eye strain and provide a "stationery" feel.
- **Accent (Champagne Gold):** Reserved for interactive details, decorative borders, and high-level headings to denote premium quality.
- **Secondary (Sage Green):** A calming botanical tone used for success states, logistics-related tasks, and secondary navigational elements.
- **Neutral (Deep Charcoal):** Provides high-contrast legibility for all body text and labels, ensuring the interface remains grounded and professional.

## Typography

The typography strategy is dual-layered to support the Hebrew-first requirement. 

**Playfair Display** is used for large headlines, numbers, and Latin-character accents. Its high-contrast serifs bring a literary and celebratory feel to the UI. For Hebrew headlines and all body/UI text, **Rubik** is the workhorse. Its slightly rounded terminals and excellent legibility in Hebrew ensure that dense information (like guest lists or budget sheets) remains readable and friendly.

All typography must be mirrored for RTL (Right-to-Left) layouts. Headlines should be right-aligned by default. For numerical data (budgets, dates), use tabular figures where available in the font files to maintain alignment in lists.

## Layout & Spacing

This design system employs a **Fluid Grid** model with an 8px base unit. The layout is strictly RTL-first, meaning the entry point of the eye starts at the top-right.

- **Desktop:** A 12-column grid with a maximum container width of 1200px. Gutters are set to 24px to allow the elegant ivory background to breathe between content cards.
- **Tablet:** An 8-column grid with 16px margins.
- **Mobile:** A 4-column grid with 16px horizontal margins. 

The vertical rhythm should favor "airy" compositions. Section headers should use `lg` (48px) or `xl` (80px) top margins to clearly demarcate different phases of the wedding planning process.

## Elevation & Depth

Depth in this design system is created through **Tonal Layering** and **Ambient Shadows**. We avoid heavy, dark shadows in favor of light, diffused lifts that mimic paper stacked on a desk.

- **Level 0 (Floor):** The Warm Ivory (`#FDF6EC`) background.
- **Level 1 (Cards/Surface):** Pure White (`#FFFFFF`) surfaces. These use a very soft, high-blur shadow with low opacity (e.g., `0px 4px 20px rgba(45, 45, 45, 0.05)`).
- **Level 2 (Modals/Popovers):** Pure White surfaces with a slightly more defined shadow to suggest immediate interaction.

Dividers are used sparingly and should be styled as 1px solid lines in the Champagne Gold (`#C9A97A`) at 20% opacity, or simple 1px gaps in layout.

## Shapes

The shape language is soft and organic. A consistent roundedness of 12px to 16px is applied to all primary containers, cards, and input fields. This softens the "technical" nature of a management app, making it feel more like a personal planner.

- **Buttons & Inputs:** `rounded-md` (12px).
- **Large Cards & Sections:** `rounded-lg` (16px).
- **Chips & Badges:** `rounded-full` (Pill-shaped) to distinguish them from interactive buttons.
- **Images:** Should always feature rounded corners to match the UI, preventing sharp edges from breaking the romantic aesthetic.

## Components

### Buttons
Primary buttons use the Blush Rose (`#F2C4CE`) background with Charcoal text. Secondary buttons should use a Champagne Gold outline with Charcoal text. All buttons have a subtle hover state where the background color deepens slightly.

### Input Fields
Inputs feature **Floating Labels** to keep the interface clean. The border is a minimal 1px stroke in a lightened Charcoal, which transitions to Champagne Gold on focus. In RTL mode, the label and icon are right-aligned.

### Chips & Badges
- **Priority Chips:** Use specific color fills with 15% opacity and 100% opacity text for the label.
    - *Essential:* Blush Rose
    - *Logistic:* Sage Green
    - *Aesthetic:* Soft Purple (#D1C4E9)
    - *Personal:* Peach (#FFCCBC)
- **Status Badges:** Use a solid pill-shaped background.
    - *Success/Closed:* Sage Green
    - *In Progress:* Amber (#FFB74D)
    - *Pending/Canceled:* Soft Red

### Cards
Cards are the primary container for information. They are White (`#FFFFFF`) on the Ivory background, featuring 16px rounded corners and an ambient shadow. Ensure padding inside cards is generous (minimum 24px) to maintain the "Elegant" brand pillar.

### Lists
Lists use subtle dividers between items. In Hebrew-first views, the primary text is right-aligned, and the "trailing" metadata or chevron is left-aligned.