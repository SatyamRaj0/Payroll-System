# Payroll System Design System (DESIGN.md)

## Brand & Visual Identity
- **Brand Name:** PayrollOS
- **Primary Colors:**
  - Accent: #4F8CFF (blue)
  - Surface: #181C24 (dark background)
  - Border: #23283A (border/lines)
  - Text Primary: #F5F7FA (main text)
  - Text Secondary: #A3B1C6 (secondary text)
  - Success: #22C55E (green)
  - Warning: #FACC15 (amber)
  - Error: #EF4444 (red)
- **Typography:**
  - Headings: Inter, bold, 1.2–2.2rem
  - Body: Inter, regular, 1rem
  - Mono: JetBrains Mono, for numbers/codes
- **Border Radius:** 10–14px for cards, 6–8px for inputs/buttons
- **Shadow:** Subtle, for elevation on cards and modals

## Layout & Spacing
- **Sidebar:** Fixed, dark, with clear section separation
- **Header:** Sticky, with page title and actions
- **Cards:** Used for grouping content, with padding 20–28px
- **Grid:** Responsive, 2–3 columns for main content
- **Spacing:** 16–28px between sections, 8–16px between elements

## Components
- **Button:**
  - Primary: Accent background, white text, bold
  - Secondary: Transparent/outlined, accent text
  - Rounded, with hover/active states
- **Input:**
  - Filled or outlined, rounded, clear focus state
  - Placeholder text in secondary color
- **Table/List:**
  - Zebra striping, hover highlight, clear headers
- **Modal:**
  - Centered, with shadow, clear close action
- **Toast/Notification:**
  - Top-right, colored by type (success, error, info)

## Iconography
- Use simple, consistent icons (e.g., Lucide, Tabler, Heroicons)
- Sidebar and action buttons should have icons

## Animation & Feedback
- Smooth transitions for modals, dropdowns, and button states
- Loading spinners for async actions
- Success/error toasts for feedback

## Accessibility
- Sufficient color contrast
- Keyboard navigation for all interactive elements
- ARIA labels for icons and important controls

---

## Page Templates

### 1. Login
- Centered card, brand logo, large input fields, clear error feedback

### 2. Dashboard
- Quick stats cards, recent activity, navigation to core modules

### 3. Employees
- Table with search/filter, add/edit modal, status badges

### 4. Payroll Engine
- Stepper for process, summary cards, run/simulate actions

### 5. Payslips
- List/grid of payslips, download/view actions

### 6. Tax Management
- Tax slab table, calculator card, add/edit modal

### 7. Audit Logs
- Timeline or table, filter by user/date/action

---

## Atmosphere
- Modern, clean, enterprise-grade
- Friendly but professional
- Focus on clarity, usability, and speed

---

**Use this DESIGN.md as the source of truth for all future UI/UX improvements and component generation.**
