# Stitch Prompt — Wedding Management App

Design a mobile app (Hebrew-first, RTL layout throughout) for marrying couples to manage their wedding events. The app supports multiple event types per couple: חתונה, חינה, מסיבת רווקים/ות, שבת חתן, מקווה/הפרשת חלה, קבלת פנים. Design all screens in Hebrew with RTL text direction and layout mirroring. Use a Romantic & Elegant visual style.

> **IMPORTANT — Design Principle**: Each screen should demonstrate the UI pattern with 2–4 representative example items only. Do not try to render all possible data. The goal is to establish the visual language and component design; real content will be rendered dynamically later.

---

## COLOR THEME

Primary: #F2C4CE (blush rose)
Background: #FDF6EC (warm ivory)
Accent: #C9A97A (champagne gold)
Text: #2D2D2D (deep charcoal)
Secondary / supporting: #A8C5A0 (sage green)
White: #FFFFFF
Error/Alert: #E07070 (soft red)
Success: #7DB87D (soft green)

Typography:
- Headings: Playfair Display (serif), champagne gold or deep charcoal
- Body: Rubik (sans-serif), deep charcoal on ivory
- Labels/captions: Rubik lighter weight, sage green or muted charcoal

UI Components tone: Soft rounded corners (12–16px), light drop shadows, subtle dividers, minimal borders.

---

## NAVIGATION

Bottom navigation bar (mobile) with 4 tabs:
- 🏠 בית (Home / Dashboard)
- 👥 מוזמנים (Guest List)
- ✅ משימות (Tasks)
- 💰 תקציב (Budget)

Each tab has an icon + Hebrew label. Active tab uses champagne gold fill. Inactive tabs use muted charcoal.

---

## SCREENS

### 1. SPLASH SCREEN
- Full-screen warm ivory background with a soft watercolor floral illustration (roses, peonies) framing top and bottom edges
- Diamond ring icon centered in a blush rose circle
- App name in Playfair Display below the icon
- Tagline: "הכל במקום אחד, ליום המיוחד שלכם"
- Three pulsing dots as a loading indicator

---

### 2. ONBOARDING — SCREEN 1: Welcome
- Warm greeting header: "ברוכים הבאים! 🎉"
- Subtext: "בואו נכיר אתכם ואת האירועים המיוחדים שלכם"
- Watercolor illustration: couple silhouette or floral ring motif
- Large CTA button: "בואו נתחיל" (champagne gold, full-width, rounded)
- Small secondary link: "כבר יש לי חשבון — התחברות"

---

### 3. ONBOARDING — SCREEN 2: Event Selection
- Progress indicator at top (step 1 of 6)
- Title: "אילו אירועים אתם מתכננים?"
- Subtitle: "ניתן לבחור יותר מאחד"
- Selectable event cards in a 3×2 grid (RTL), each with illustrated icon + Hebrew label:
  - 💍 חתונה
  - 🌿 חינה
  - 🎉 מסיבת רווקים/ות
  - 🕍 שבת חתן
  - 🛁 מקווה / הפרשת חלה
  - 🥂 קבלת פנים
- Selected card: blush rose border + champagne gold checkmark in corner
- Unselected card: white background, subtle shadow, charcoal text
- "הוסף אירוע אחר" text link at bottom
- "הבא" button (disabled until ≥ 1 selection; champagne gold when active)

---

### 4. ONBOARDING — SCREEN 3: Guest Count & Date
- Progress indicator (step 2 of 6)
- Title: "ספרו לנו קצת על האירועים"
- Show 2 example event cards (representing however many events were selected):
  - Card header: event name + icon
  - "כמה אורחים אתם מצפים?" — numeric stepper (−/number/+) or text input
  - "מתי בערך?" — month/year picker with calendar icon
- Checkbox at bottom: "עדיין לא יודעים? לא נורא, אפשר לעדכן מאוחר יותר"
- "הבא" button

---

### 5. ONBOARDING — SCREEN 4: Priorities & Vibe
- Progress indicator (step 3 of 6)
- Title: "מה הכי חשוב לכם?"
- Subtitle: "דרגו לפי חשיבות (1–5)"
- Show 4 example priority rows (RTL), each: icon | label | 5-star tap rating:
  - 🎵 מוזיקה / דיג'יי
  - 📸 צילום ווידאו
  - 🍽️ קייטרינג ואוכל
  - 🏛️ מקום האירוע
- Small note below: "תוכלו לדרג את כל הפריטים לאחר ההרשמה"
- "הבא" button

---

### 6. ONBOARDING — SCREEN 5: Budget Range
- Progress indicator (step 4 of 6)
- Title: "מה הטווח התקציבי הכולל שלכם?"
- Subtitle: "כולל כל האירועים"
- Four full-width selectable cards (one selected — blush rose fill + gold border):
  - עד ₪50,000
  - ₪50,000 – ₪100,000
  - ₪100,000 – ₪200,000
  - מעל ₪200,000
- Small helper text: "ניתן לשנות בכל עת מהגדרות התקציב"
- "הבא" button

---

### 7. ONBOARDING — SCREEN 6: Couple Info
- Progress indicator (step 5 of 6) [step 6 = success screen]
- Title: "ספרו לנו עליכם"
- Two name fields side by side (RTL): "שם בן/בת הזוג 1" | "שם בן/בת הזוג 2"
- Gender selector per person: icon chips ♂ / ♀ / אחר (champagne gold when selected)
- Region/city selector: "באיזה אזור מתוכנן האירוע?" — styled dropdown (not native)
- Toggle row: "האם האירוע כשר?" — ON state uses champagne gold thumb, not blue
- "סיום ✓" button (champagne gold fill, full-width) → leads to Success screen

---

### 8. ONBOARDING — SUCCESS SCREEN
- Full-screen warm ivory with confetti or watercolor celebration illustration
- Large checkmark in champagne gold circle
- Title: "הכל מוכן! 🎉" in Playfair Display
- Subtext: "בנינו לכם רשימת משימות מותאמת אישית"
- Single button: "קדימה לדשבורד" (champagne gold, full-width)

---

### 9. DASHBOARD / HOME
- Top bar: App name right (RTL), bell icon + settings icon left (RTL)
- Greeting: "שלום עדי ורועי! 👋" in Playfair Display
- **Upcoming Event hero card** — blush gradient background, rounded 16px:
  - Event emoji + name: "💍 החתונה שלנו"
  - Countdown: "נותרו 87 ימים"
  - Date + venue
  - Task progress bar: "הושלמו 12 מתוך 48 משימות"
- **Budget summary card** — white, shadow:
  - Champagne gold progress bar
  - "₪48,000 מתוך ₪100,000"
  - Small row: "מתנות: ₪22,000 | יתרה: ₪30,000" (shows gift income vs remaining budget)
- **ספקים נבחרים** — horizontal scroll row of vendor chips:
  - Each chip: category icon + vendor name + status badge (סגור / בתהליך / ממתין)
  - Show 3 example vendors: דיג'יי — DJ Alexander — סגור | צלם — עדיין פתוח — ממתין | אולם — גן הוורדים — סגור
- **אירועים נוספים** — compact card list (show 2 examples: חינה / שבת חתן)
- Bottom navigation bar

---

### 10. GUEST LIST — MAIN LIST VIEW
- Top bar: "רשימת מוזמנים" centered, filter icon (right/RTL), search icon (left/RTL)
- Event tabs: horizontal pills — חתונה (selected) / חינה / מסיבת רווקים
- **Stats 2×2 grid** (large numbers, colored):
  - 180 סה"כ | 102 אישרו (green) | 20 ביטלו (red) | 58 ממתינים (amber)
- Duplicate detection banner (if applicable): blush rose background, triangle warning icon: "⚠️ זוהו 3 כפילויות אפשריות — בדוק"
- Guest list grouped by "מי הזמין":
  - Section header: 👫 הזוג — 80 אורחים
  - Guest row example: "יעל ודוד לוי" | שולחן 12 | 🟢 אישר | +2
  - Guest row example: "רון כהן" | שולחן — | 🟡 ממתין | +0
  - Section header: 👨‍👩‍👧 הורי עדי — 50 אורחים
  - Guest row example: strikethrough red text (ביטל state)
- FAB (+) bottom-left: champagne gold circle
- Bottom navigation bar

---

### 11. GUEST LIST — GUEST DETAIL / EDIT
- Top bar: "→" back arrow (top-right, RTL), "פרטי מוזמן" title centered, "⋮" menu (top-left, RTL)
- Avatar circle (80px, blush rose), initials "יל" in Playfair Display champagne gold
- Guest name below avatar in bold; RSVP status badge below name (color-coded)

**Card 1 — פרטי קשר:**
- Label header: "פרטי קשר" in small champagne gold uppercase
- Styled text inputs with floating labels: שם מלא | טלפון | מייל

**Card 2 — פרטי הגעה:**
- Label: "פרטי הגעה"
- Numeric stepper: "מספר אורחים" (−/2/+)
- RSVP chips (3 options, one selected):
  - אישר — sage green fill + ✓ + white text
  - ממתין — amber outline + charcoal text
  - ביטל — soft red fill + ✗ + white text

**Card 3 — אירועים:**
- Label: "לאילו אירועים מוזמן/ת?"
- Multi-select event chips (RTL wrap): 💍 חתונה ✓ | 🌿 חינה ✓ | 🎉 מסיבה | 🕍 שבת חתן

**Card 4 — שיוך:**
- Label: "שיוך"
- Styled dropdown: "מי הזמין" (shows: הזוג / הורי כלה / הורי חתן / אחר)
- Text input: "מספר שולחן" with table icon (RTL)

**Card 5 — הערות:**
- Textarea, placeholder: "הוסף הערה...", min 3 lines

**Bottom actions:**
- "שמור שינויים" — champagne gold fill, full-width, white bold text
- "מחק מוזמן 🗑" — inside a thin soft-red border card, soft-red text

---

### 12. GUEST LIST — PARENT SHARE SCREEN (Web view)
- No bottom navigation (web-only)
- Header: "הזמנה להוספת אורחים", couple's names as subtitle
- Info text: "הוסיפו את שמות האורחים שלכם לרשימה"
- Add-guest form:
  - שם מלא (required)
  - טלפון (optional)
  - מספר אורחים (stepper)
  - "+ הוסף אורח נוסף" link
- List of guests added this session (2 example rows)
- "שלח רשימה" button (champagne gold, full-width)
- Footer: "הרשימה תועבר ישירות לזוג"

---

### 13. TASKS — LIST VIEW
- Top bar: App name right, settings + bell icons left
- "משימות" as large page title (Playfair Display)
- Event pill tabs: חתונה (active) / חינה / שבת חתן
- **Category filter chips** (horizontal scroll, all visible):
  - כל המשימות (selected — blush rose fill) | ספקים | תשלומים | ביגוד | טיפוח | לוגיסטיקה | שונות
- Task rows (show 4 representative examples, each from a different category):
  - Row 1: ☐ 🎵 **בחירת דיג'יי** | badge: "טרם התחיל" | due date tag | ‹ chevron
  - Row 2: ☑ 🍽️ ~~סגירת תפריט קייטרינג~~ | badge: "סגור" (sage green) | ‹ chevron
  - Row 3: ☐ 💳 **תשלום מקדמה לאולם** | badge: "בתהליך" (amber) | overdue date (red) | ‹ chevron
  - Row 4: ☐ 👗 **מדידות שמלה שנייה** | badge: "טרם התחיל" | ‹ chevron
- FAB (+) champagne gold circle: "הוספת משימה"
- Bottom navigation bar

---

### 14. TASKS — ITEM DETAIL: VENDOR TYPE
**Example: "בחירת דיג'יי"**

- Top bar: "→" back (RTL), task name centered, category icon badge
- Status pill selector: טרם התחיל | **בתהליך** (selected) | סגור
- Priority chip: "🏷 הכרחי לאירוע" (one of: הכרחי / לוגיסטי / אסתטי / אישי)
- Responsible party: "מי אחראי — עדי" (avatar chip, tappable)
- Notes textarea

**Section: "אפשרויות ספקים"**
Show 2 vendor option cards + 1 "add" card:

Vendor card (selected):
- Vendor name: "DJ Alexander" | status badge: "נבחר" (sage green)
- Price: "₪3,500–₪5,000"
- Rating: ★★★★★ (5/5, manual)
- Sub-row: 📧 dj@example.com | 📞 054-000-0000
- Payment row: "מקדמה: ₪1,500 ✓ | יתרה: ₪3,500 | תשלום אחרון: 15/08"
- Expandable: "הערות" text

Vendor card (under consideration):
- Vendor name: "Muzika Olam" | status badge: "בשיקול" (amber)
- Price: "₪2,800–₪4,000"
- Rating: ★★★★☆ (4/5)
- "הגדר כנבחר" button (outlined, champagne gold)

"+ הוסף ספק" — dashed-border card

- "שמור שינויים" button (champagne gold, full-width)

---

### 15. TASKS — ITEM DETAIL: PAYMENT TYPE
**Example: "תשלום מקדמה לאולם"**

- Top bar + status selector (same pattern as screen 14)
- Priority chip + responsible party

**Payment tracking card:**
- "סכום כולל": ₪35,000 (large, champagne gold)
- Billing unit selector: per item ✓ / per guest / per hour (small chip selector)
- Row: "מקדמה ששולמה" | ₪10,000 | ✅ שולם
- Row: "יתרה לתשלום" | ₪25,000 | 🔴 ממתין
- Row: "מועד תשלום אחרון" | 15 ספטמבר 2025 | calendar icon
- "סמן כשולם" toggle button (sage green when paid)

**Linked vendor card** (compact):
- Vendor name + phone + email in one small card with a "→" to vendor detail

- Notes textarea
- "שמור שינויים" button

---

### 16. TASKS — ITEM DETAIL: DECISION TYPE
**Example: "בחירת קונספט עיצובי"**

- Top bar + status selector + priority chip + responsible party

**Decision card:**
- Title: "האפשרויות שלנו"
- 2 example option cards side by side (RTL):
  - Card A: "רומנטי ופרחוני" | ✓ יתרונות list (2 items) | ✗ חסרונות list (1 item)
  - Card B: "מודרני ומינימליסט" | ✓ יתרונות list | ✗ חסרונות list
- "הוסף אפשרות" dashed card
- "ההחלטה שלנו:" text input row (highlights in champagne gold once filled)

- Notes textarea
- "שמור שינויים" button

---

### 17. TASKS — ITEM DETAIL: REMINDER TYPE
**Example: "לרשום לרבנות"**

- Top bar + status selector + priority chip + responsible party

**Reminder card:**
- "תזכורת ל:" date + time picker row
- Notification toggle: "קבל התראה" (champagne gold ON state)
- "קישור למשימה קשורה:" — linked task chip (e.g., "💍 חתונה > הגדרת תאריך")
- Dependency row: "תלוי ב:" small chip showing the blocking task

- Notes textarea
- "שמור שינויים" button

---

### 18. TASKS — ADD NEW TASK (Bottom Sheet Modal)
- Slides up from bottom, handle bar at top, 70% screen height
- Title: "משימה חדשה"
- Fields:
  - שם המשימה (text input, required)
  - **סוג** — segmented icon row: 🏪 ספק | 💳 תשלום | 🤔 החלטה | 🔔 תזכורת
  - **קטגוריה** — horizontal scroll chips: ספקים | ביגוד | טיפוח | לוגיסטיקה | שונות
  - **עדיפות** — chip selector: הכרחי | לוגיסטי | אסתטי | אישי
  - אירוע: styled dropdown
  - תאריך יעד: date picker (optional)
  - מי אחראי: avatar chip selector (both partners shown)
  - הערות: textarea (optional)
- "הוסף משימה" button (champagne gold)
- "ביטול" text link

---

### 19. BUDGET OVERVIEW
- Top bar: App name right, settings + bell left
- "תקציב" large title (Playfair Display)
- Context chips: "150 מוזמנים אישרו" | "נותרו 45 ימים"

**Donut ring hero:**
- Large champagne gold circular progress ring (showing ~48% filled)
- Center: "הוצאה עד כה" label + "₪48,500" large + "מתוך ₪100,000" small
- Below ring: blush rose chip: "נותרו ₪51,500 לתקציב ℹ️"
- "ערוך תקציב כולל" underlined link

**מתנות וסגירה (Gifts & Breakeven) card:**
- Row: "💝 מתנות שהתקבלו" | ₪22,000 (sage green)
- Row: "💰 הפרש (רווח/הפסד)" | ₪–26,500 (soft red if negative)
- Small note: "הסכום מחושב לפי: הוצאות – מתנות"

**פירוט הוצאות** (scrollable category list, show 4 representative rows):
- 🏛️ אולם וקייטרינג | ₪35,000 / ₪50,000 | progress bar (70%)
- 📸 צלם וידאו | ₪8,500 / ₪12,000 | progress bar (71%)
- 👗 ביגוד ותכשיטים | ₪5,000 / ₪15,000 | progress bar (33%)
- 🎵 דיג'יי ומוזיקה | ₪3,200 / ₪8,000 | progress bar (40%)
- Each row: icon + name (right/RTL) | spent amount | budget | bar fills right-to-left

- FAB (+): "הוסף הוצאה" (champagne gold)
- Bottom navigation bar

---

### 20. BUDGET — ADD EXPENSE (Bottom Sheet Modal)
- Slides up 75% screen height, handle bar at top
- Title: "הוצאה חדשה"
- Fields:
  - שם הפריט (text input): e.g., "תשלום מקדמה לצלם"
  - **קטגוריה** — horizontal scroll chips: אולם | ספקים | ביגוד | טיפוח | לוגיסטיקה | שונות
  - **עלות מוערכת** — number input with ₪ prefix
  - **עלות בפועל** — number input with ₪ prefix (optional, fill later)
  - **יחידת חיוב** — 3-chip selector:
    - 🧾 לפי פריט (one-time item)
    - 👤 לפי אורח (per-guest × count)
    - ⏱ לפי שעה
  - **חובה / רשות** — 2-chip toggle: חובה | רשות
  - אירוע: dropdown selector
  - **ספק מקושר** — optional: search or select existing vendor
  - מי אחראי: avatar chip
  - הערות: textarea
- "הוסף הוצאה" button (champagne gold)
- "ביטול" link

---

## DESIGN NOTES FOR STITCH

1. **RTL layout**: All screens fully mirrored — text right-aligned, back arrows point right (→), chevrons point left (‹), progress bars fill right-to-left, tab order reads right-to-left.
2. **Fonts**: Playfair Display for all page titles and hero numbers; Rubik for all body, labels, and inputs.
3. **Illustrations**: Soft watercolor wedding motifs (roses, rings, candles) on onboarding and empty states only — not on functional screens.
4. **Status badge colors**:
   - סגור / הושלם: sage green background (#A8C5A0), white text
   - בתהליך: amber/tertiary-container, charcoal text
   - טרם התחיל: light gray outline, muted charcoal text
   - ממתין: soft red outline, soft red text
5. **Billing unit**: the יחידת חיוב chip selector (לפי פריט / לפי אורח / לפי שעה) appears in both task payment detail and add-expense modal — make it a consistent reusable component.
6. **Priority chips**: הכרחי (blush rose) | לוגיסטי (sage green) | אסתטי (lavender/soft purple) | אישי (peach) — each has a distinct subtle color.
7. **Mobile frame**: iPhone 14 Pro (393×852pt). All scrollable content should suggest scroll via clipped bottom card edges.
8. **Component library to extract**: primary/secondary/ghost buttons, floating text inputs with labels, event pill tabs, vendor cards, guest rows, task rows, status badges, priority chips, billing-unit chip selector, progress bars, donut ring, avatar circle, bottom sheet modal frame.
