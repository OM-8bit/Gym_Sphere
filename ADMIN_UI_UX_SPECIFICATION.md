# GymSphere Admin Portal - Complete UI/UX Specification

**Version:** 2.5.0  
**Last Updated:** December 8, 2025  
**Purpose:** Complete design system documentation for Member Portal replication

---

## 📋 Table of Contents
1. [Design System Overview](#design-system-overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Layout Structure](#layout-structure)
5. [Component Styles](#component-styles)
6. [Animations & Transitions](#animations--transitions)
7. [Responsive Design](#responsive-design)
8. [Key UI Patterns](#key-ui-patterns)
9. [Special Effects](#special-effects)
10. [Implementation Guidelines](#implementation-guidelines)

---

## 🎨 Design System Overview

### Core Philosophy
- **Theme:** Professional Dark Theme with Orange Accents
- **Approach:** Modern, Minimal, Performance-Focused
- **Target:** Gym Management with Emphasis on Readability
- **Frameworks:** React 18 + Tailwind CSS + DaisyUI
- **Icons:** Lucide React (consistent, modern icon set)

### Design Principles
1. **Consistency:** Uniform spacing, colors, and typography across all pages
2. **Hierarchy:** Clear visual hierarchy with color and size
3. **Accessibility:** High contrast ratios, focus states, ARIA labels
4. **Performance:** Smooth 60fps animations, optimized renders
5. **Responsiveness:** Mobile-first approach with 3 breakpoints

---

## 🎨 Color Palette

### Primary Colors
```css
/* Primary Brand Color */
--primary-orange: #ff6b35;           /* Main CTA, active states */
--primary-orange-hover: #e55a2b;     /* Hover states */
--primary-orange-light: rgba(255, 107, 53, 0.1);  /* Subtle backgrounds */

/* Background Colors */
--bg-primary: #1a1a1a;               /* Main background */
--bg-secondary: #2d2d2d;             /* Sidebar, header */
--bg-tertiary: #3a3a3a;              /* Input backgrounds, hover states */
--bg-card: #404040;                  /* Card backgrounds */

/* Text Colors */
--text-primary: #ffffff;             /* Headings, important text */
--text-secondary: #f0f0f0;           /* Body text */
--text-muted: #a0a0a0;               /* Secondary information */
--text-disabled: #666666;            /* Disabled states */

/* Border Colors */
--border-primary: #4a4a4a;           /* Card borders, dividers */
--border-secondary: #555555;         /* Hover borders */
```

### Semantic Colors
```css
/* Status Colors */
--success: #16a34a;                  /* Active members, success states */
--danger: #ef4444;                   /* Expired, delete actions */
--warning: #f59e0b;                  /* Near expiry, warnings */
--info: #3b82f6;                     /* Information, neutral actions */

/* Success Variants */
--success-light: #4ade80;
--success-bg: rgba(22, 163, 74, 0.2);
--success-border: #16a34a;

/* Danger Variants */
--danger-light: #f87171;
--danger-bg: rgba(239, 68, 68, 0.2);
--danger-border: #ef4444;
```

### Tailwind Custom Colors
```javascript
// tailwind.config.js
colors: {
  'energy': {
    '500': '#f97316',  // Orange accent
    '600': '#ea580c',
    '700': '#c2410c',
  },
  'strength': {
    '500': '#0ea5e9',  // Blue accent
    '600': '#0284c7',
  },
  'vitality': {
    '500': '#22c55e',  // Green accent
    '600': '#16a34a',
  },
}
```

### Usage Guidelines
- **Primary Orange (#ff6b35):** CTAs, active navigation, primary buttons
- **Success Green (#16a34a):** Active status badges, success messages
- **Danger Red (#ef4444):** Delete buttons, expired status, errors
- **Warning Yellow (#f59e0b):** Near expiry, warnings
- **Dark Backgrounds:** Create depth with layered grays (#1a1a1a → #404040)

---

## 📝 Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Font Sizes & Weights
```css
/* Headings */
h1 { 
  font-size: 2.5rem;      /* 40px */
  font-weight: 700; 
  color: #ffffff;
  margin-bottom: 16px;
}

h2 { 
  font-size: 2rem;        /* 32px */
  font-weight: 700;
  color: #ffffff;
}

h3 { 
  font-size: 1.5rem;      /* 24px */
  font-weight: 700;
  color: #ffffff;
}

h4 { 
  font-size: 1.25rem;     /* 20px */
  font-weight: 600;
}

/* Body Text */
p, body {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Small Text */
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }

/* Labels */
.label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Badges */
.badge {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### Responsive Typography
```css
/* Mobile */
@media (max-width: 768px) {
  html { font-size: 15px; }
  h1 { font-size: 1.75rem !important; }
  h2 { font-size: 1.5rem !important; }
  h3 { font-size: 1.25rem !important; }
}
```

### Typography Classes
- `.metric-value`: Large numbers (2.5rem, 800 weight)
- `.metric-title`: Small caps labels (0.875rem, 600 weight, uppercase)
- `.text-muted`: Secondary information (#a0a0a0)
- `.text-disabled`: Disabled states (#666666)

---

## 🏗️ Layout Structure

### Grid System
```css
/* Main App Container */
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  position: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;  /* Sidebar width */
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Header */
.header {
  height: 60px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Content Area */
.content-area {
  padding: 32px;
  max-width: 1400px;
}
```

### Responsive Breakpoints
```css
/* Desktop: >= 1024px (default) */
/* Tablet: 768px - 1023px */
/* Mobile: < 768px */

:root {
  --header-height: 60px;
  --sidebar-width: 280px;
  --sidebar-mobile-width: 250px;
}
```

### Grid Patterns
```css
/* Stats Grid (Dashboard) */
.dashboard-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* Responsive Grid */
.responsive-grid {
  display: grid;
  gap: 20px;
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tablet: 2 columns */
@media (min-width: 768px) and (max-width: 1023px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 column */
@media (max-width: 767px) {
  .responsive-grid {
    grid-template-columns: 1fr;
  }
}
```

### Spacing System
```css
/* Consistent Spacing Scale */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Gap Utilities */
.gap-20 { gap: 20px; }
.gap-16 { gap: 16px; }
.gap-12 { gap: 12px; }
```

---

## 🧩 Component Styles

### 1. Cards
```css
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

/* Metric Cards (Dashboard) */
.metric-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-orange);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover::before {
  opacity: 1;
}

.metric-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-4px);
}

/* Card Content */
.metric-value {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.metric-title {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

### 2. Buttons
```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Primary Button */
.btn-primary {
  background: var(--primary-orange);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-orange-hover);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: var(--bg-card);
  border-color: var(--border-secondary);
}

/* Danger Button */
.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Icon-Only Buttons */
.btn-circle {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Button States:**
- Default: Neutral background, subtle border
- Hover: Slight lift, deeper shadow, color intensifies
- Active: Pressed down appearance
- Disabled: 50% opacity, no cursor pointer

### 3. Inputs
```css
.input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-orange);
  box-shadow: 0 0 0 3px var(--primary-orange-light);
}

.input::placeholder {
  color: var(--text-muted);
}

/* Select Dropdown */
select.input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml...");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

/* Input with Icon */
.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.input-with-icon {
  padding-left: 40px;
}
```

### 4. Badges
```css
/* Base Badge */
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Status Badges */
.badge-ok {
  background: rgba(22, 163, 74, 0.2);
  color: #4ade80;
  border: 1px solid #16a34a;
}

.badge-bad {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid #ef4444;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid #f59e0b;
}

/* Pill Badges */
.badge-pill {
  padding: 6px 14px;
  border-radius: 25px;
}
```

**Badge Color System:**
- Green: Active, Success, Available
- Yellow: Warning, Near Expiry
- Red: Expired, Danger, Error
- Blue: Info, Neutral
- Gray: Disabled, Inactive

### 5. Modals
```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

/* Modal Container */
.modal {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-primary);
  animation: slideUp 0.3s ease-out;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-primary);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}
```

### 6. Tables
```css
.table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.table th,
.table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-primary);
}

.table th {
  background: var(--bg-tertiary);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tr:hover {
  background: var(--bg-tertiary);
}

.table td {
  color: var(--text-secondary);
}

/* Table Actions */
.table-actions {
  display: flex;
  gap: 8px;
}
```

### 7. Navigation (Sidebar)
```css
/* Sidebar Link Base */
.sidebar-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

/* Inactive State */
.sidebar-nav-link {
  color: #a0a0a0;
  background: transparent;
}

.sidebar-nav-link:hover {
  background: #3a3a3a;
  color: #ffffff;
  transform: translateX(2px);
}

/* Active State */
.sidebar-nav-link.active {
  color: #ffffff;
  background: #ff6b35;
  font-weight: 600;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Sidebar Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #404040;
  min-height: 60px;
  padding: 16px;
}

.sidebar-logo img {
  max-width: 200px;
  width: auto;
  object-fit: contain;
  filter: invert(1) brightness(1.2) contrast(1.1);
}
```

### 8. Icons
**Icon Library:** Lucide React

**Common Icons:**
- `Home` - Dashboard
- `Users` - Members/Customers
- `UserPlus` - Add Member
- `ScanLine` - Access Control/Scanner
- `FileText` - Logs/Reports
- `Settings` - Settings
- `LogOut` - Logout
- `Menu` - Mobile menu
- `X` - Close
- `Search` - Search bar
- `Bell` - Notifications
- `ChevronDown` - Dropdowns/Accordions
- `Eye` / `EyeOff` - Password toggle

**Icon Sizing:**
- Small: 16px
- Medium: 20px (default)
- Large: 24px
- XLarge: 28px

```jsx
import { Home, Users, Settings } from 'lucide-react';

<Home size={20} color="#ff6b35" />
```

### 9. Accordion
```css
.accordion-item {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  margin-bottom: 8px;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-header:hover {
  background: var(--bg-tertiary);
}

.accordion-icon {
  transition: transform 0.3s ease;
}

.accordion-icon.expanded {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-content.expanded {
  max-height: 1000px; /* Adjust based on content */
  padding: 0 20px 20px 20px;
}
```

### 10. Toast Notifications
```css
/* Toast Container */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Toast */
.toast {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  border-left: 4px solid var(--success);
}

.toast-error {
  border-left: 4px solid var(--danger);
}

.toast-warning {
  border-left: 4px solid var(--warning);
}

.toast-info {
  border-left: 4px solid var(--info);
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

---

## ✨ Animations & Transitions

### Global Transitions
```css
/* Default Transition */
* {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease;
}

/* Component Transitions */
.card, .btn, .input, .badge {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Keyframe Animations
```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Slide Up */
@keyframes slideUp {
  0% { 
    transform: translateY(100%); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

/* Slide Down */
@keyframes slideDown {
  0% { 
    transform: translateY(-100%); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse (for notifications) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Hover Effects
```css
/* Card Hover */
.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

/* Button Hover */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Icon Rotation on Hover */
.icon-rotate:hover {
  transform: rotate(90deg);
}

/* Glow Effect on Hover */
.glow:hover {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
}
```

### Loading States
```css
/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  border: 3px solid var(--border-primary);
  border-top-color: var(--primary-orange);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.6s linear infinite;
}

/* Skeleton Loader */
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}

.skeleton {
  background: linear-gradient(
    to right,
    var(--bg-tertiary) 0%,
    var(--bg-card) 20%,
    var(--bg-tertiary) 40%,
    var(--bg-tertiary) 100%
  );
  background-size: 800px 104px;
  animation: shimmer 1s linear infinite;
  border-radius: 8px;
}

/* Pulse Loading */
.loading-pulse {
  opacity: 0.6;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Transition Timing Functions
```css
/* Standard Ease */
transition: all 0.3s ease;

/* Smooth Cubic Bezier */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce Effect */
transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Quick Snap */
transition: all 0.15s ease-in-out;
```

---

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */

/* Base (Mobile): < 768px */
/* Default styles apply */

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet-specific styles */
}

/* Desktop: >= 1024px */
@media (min-width: 1024px) {
  /* Desktop-specific styles */
}
```

### Layout Adaptations

#### Mobile (< 768px)
```css
/* Sidebar becomes overlay */
.sidebar {
  position: fixed;
  transform: translateX(-100%);
  width: 250px;
  z-index: 1100;
  transition: transform 0.3s ease;
}

.sidebar.mobile-open {
  transform: translateX(0);
}

/* Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.sidebar-overlay.active {
  display: block;
}

/* Main content full width */
.main-content {
  margin-left: 0;
  width: 100%;
}

/* Header fixed */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* Content padding for fixed header */
.main-content {
  padding-top: 70px;
}

/* Stats grid 2x2 */
.dashboard-stats-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Hide search on mobile */
.header-search {
  display: none;
}

/* Show mobile menu button */
.menu-toggle {
  display: flex;
}

/* Tables become cards */
.responsive-table {
  display: none;
}

.responsive-card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

#### Tablet (768px - 1023px)
```css
/* Same as mobile - overlay sidebar */
.sidebar {
  width: 250px;
  transform: translateX(-100%);
  position: fixed;
}

.sidebar.tablet-open {
  transform: translateX(0);
}

/* Stats grid 2x2 */
.dashboard-stats-grid {
  grid-template-columns: repeat(2, 1fr);
}

/* Hide search */
.header-search {
  display: none;
}

/* Cards instead of tables */
.responsive-table {
  display: none;
}
```

#### Desktop (>= 1024px)
```css
/* Sidebar always visible */
.sidebar {
  position: fixed;
  transform: translateX(0);
  width: 280px;
}

/* Main content with sidebar offset */
.main-content {
  margin-left: 280px;
}

/* Header not fixed */
.header {
  position: relative;
}

/* Stats grid auto-fit */
.dashboard-stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Show search */
.header-search {
  display: flex;
}

/* Hide mobile menu */
.menu-toggle {
  display: none;
}

/* Tables visible */
.responsive-table {
  display: table;
}

.responsive-card-list {
  display: none;
}
```

### Touch Targets
```css
/* Minimum 44px for mobile */
@media (max-width: 768px) {
  .btn, button, a {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Font Size Scaling
```css
/* Responsive font sizes with clamp() */
h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
}

p {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

/* Button text */
.btn {
  font-size: clamp(13px, 2.5vw, 14px);
  padding: clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px);
}
```

---

## 🎯 Key UI Patterns

### 1. Page Header Pattern
```jsx
<div style={{ marginBottom: '32px' }}>
  <h1 style={{ 
    color: '#ffffff', 
    fontSize: '32px', 
    fontWeight: 700,
    marginBottom: '8px'
  }}>
    Page Title
  </h1>
  <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
    Page subtitle or description
  </p>
</div>
```

### 2. Stat Card Pattern
```jsx
<div className="metric-card">
  <div style={{
    display:'flex', 
    alignItems:'center', 
    justifyContent:'space-between', 
    marginBottom: '16px'
  }}>
    <div>
      <div className="metric-title">TITLE</div>
      <div className="metric-value" style={{color: '#ff6b35'}}>
        {value}
      </div>
      <div style={{color: '#a0a0a0', fontSize: '13px', marginTop: '4px'}}>
        Subtitle
      </div>
    </div>
    <div style={{
      background: 'rgba(255, 107, 53, 0.2)',
      padding: '16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={28} color="#ff6b35"/>
    </div>
  </div>
</div>
```

### 3. Form Layout Pattern
```jsx
<form>
  <div style={{ marginBottom: '20px' }}>
    <label className="label">Field Label</label>
    <input 
      type="text" 
      className="input" 
      placeholder="Placeholder text"
    />
  </div>
  
  <div style={{ marginBottom: '20px' }}>
    <label className="label">Another Field</label>
    <select className="input">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  </div>
  
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'flex-end',
    marginTop: '24px' 
  }}>
    <button type="button" className="btn btn-secondary">
      Cancel
    </button>
    <button type="submit" className="btn btn-primary">
      Submit
    </button>
  </div>
</form>
```

### 4. Action Bar Pattern
```jsx
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  marginBottom: '24px'
}}>
  {/* Left side - Search/Filter */}
  <div style={{ display: 'flex', gap: '12px' }}>
    <input 
      type="text" 
      className="input" 
      placeholder="Search..."
      style={{ width: '300px' }}
    />
    <select className="input" style={{ width: '150px' }}>
      <option>All Status</option>
      <option>Active</option>
      <option>Expired</option>
    </select>
  </div>
  
  {/* Right side - Actions */}
  <div style={{ display: 'flex', gap: '12px' }}>
    <button className="btn btn-secondary">
      <Icon size={16} /> Export
    </button>
    <button className="btn btn-primary">
      <Icon size={16} /> Add New
    </button>
  </div>
</div>
```

### 5. Empty State Pattern
```jsx
<div style={{ 
  display: 'flex', 
  flexDirection: 'column',
  alignItems: 'center', 
  justifyContent: 'center',
  padding: '60px 20px',
  textAlign: 'center'
}}>
  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
    📭
  </div>
  <h3 style={{ 
    color: '#ffffff', 
    marginBottom: '8px',
    fontSize: '24px',
    fontWeight: 600
  }}>
    No Data Found
  </h3>
  <p style={{ 
    color: '#a0a0a0', 
    fontSize: '16px',
    marginBottom: '24px'
  }}>
    Get started by adding your first item.
  </p>
  <button className="btn btn-primary">
    <Icon size={16} /> Add New
  </button>
</div>
```

### 6. Loading State Pattern
```jsx
{loading ? (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: '40px'
  }}>
    <div className="spinner"></div>
  </div>
) : (
  /* Actual content */
)}
```

---

## ✨ Special Effects

### 1. Glassmorphism
```css
.glass {
  background: rgba(64, 64, 64, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 2. Gradient Overlays
```css
.gradient-overlay {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 53, 0.2) 0%,
    transparent 100%
  );
}
```

### 3. Custom Scrollbar
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-orange);
}
```

### 4. Focus Ring
```css
button:focus,
.btn:focus,
.input:focus,
a:focus {
  outline: 2px solid var(--primary-orange);
  outline-offset: 2px;
}
```

### 5. Hover Glow
```css
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
}
```

### 6. Image Filters
```css
/* Logo Invert for Dark Theme */
.logo {
  filter: invert(1) brightness(1.2) contrast(1.1);
  image-rendering: crisp-edges;
  -webkit-image-rendering: crisp-edges;
}
```

---

## 🛠️ Implementation Guidelines

### CSS Architecture
```
styles/
├── global.css           # Base styles, variables, resets
├── responsive.css       # All responsive styles
├── laptop.css           # Laptop-specific styles (deprecated, merged)
├── member-cards.css     # Member card specific styles
└── index.css            # Tailwind imports, utility classes
```

### Component Structure
```jsx
// Typical Component Pattern
import React, { useState, useEffect } from 'react';
import { Icon1, Icon2 } from 'lucide-react';

export default function ComponentName() {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="container">
      <div className="card">
        {/* Content */}
      </div>
    </div>
  );
}
```

### Naming Conventions
- **Classes:** kebab-case (`.metric-card`, `.btn-primary`)
- **Components:** PascalCase (`Dashboard`, `MemberCard`)
- **Functions:** camelCase (`handleSubmit`, `fetchMembers`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)

### State Management
- **Local State:** `useState` for component-specific state
- **Context:** `AuthContext` for user authentication
- **API Calls:** Centralized in `services/api.js`

### Best Practices
1. **Performance:**
   - Use `React.memo` for expensive renders
   - Lazy load routes and components
   - Optimize images (use WebP when possible)

2. **Accessibility:**
   - Always include `aria-label` on icon-only buttons
   - Maintain proper heading hierarchy (h1 → h2 → h3)
   - Ensure 4.5:1 contrast ratio minimum

3. **Responsive:**
   - Mobile-first approach
   - Test on 3 breakpoints (mobile, tablet, desktop)
   - Use `clamp()` for responsive typography

4. **Code Quality:**
   - Keep components under 300 lines
   - Extract reusable logic to custom hooks
   - Use descriptive variable names

### File Organization
```
src/
├── components/           # Reusable components
│   ├── Layout.jsx
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── MemberCard.jsx
│   ├── ConfirmationModal.jsx
│   └── ...
├── pages/               # Route pages
│   ├── Dashboard.jsx
│   ├── Members.jsx
│   ├── AddMember.jsx
│   ├── AccessControl.jsx
│   └── ...
├── context/             # React Context
│   └── AuthContext.jsx
├── services/            # API services
│   └── api.js
├── styles/              # Global styles
│   ├── global.css
│   └── responsive.css
└── App.jsx              # Main app component
```

---

## 📦 Dependencies

### Core
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0"
}
```

### UI/Styling
```json
{
  "tailwindcss": "^3.0.0",
  "daisyui": "^4.0.0",
  "lucide-react": "^0.index.0"
}
```

### HTTP/API
```json
{
  "axios": "^1.0.0"
}
```

### Utilities
```json
{
  "react-hot-toast": "^2.0.0"
}
```

---

## 🚀 Quick Start for Member Portal

### 1. Copy Base Files
```bash
# Copy these files to Member Portal
- tailwind.config.js
- src/styles/global.css
- src/styles/responsive.css
- src/index.css
```

### 2. Install Dependencies
```bash
npm install react-router-dom axios lucide-react react-hot-toast
npm install -D tailwindcss daisyui
```

### 3. Configure Tailwind
```javascript
// tailwind.config.js - Already configured
// Just copy from Admin Portal
```

### 4. Create Base Layout
```jsx
// Follow Layout.jsx structure but adapt for Member Portal needs:
// - Remove admin-specific nav items
// - Add member-specific menu items
// - Keep same color scheme and styling
```

### 5. Reuse Components
Copy these components (they're theme-agnostic):
- `ConfirmationModal.jsx`
- `ToastContainer.jsx`
- `LoadingSkeleton.jsx`

### 6. Apply Color Variables
All CSS variables from `global.css` should work as-is. Just reference them:
```css
background: var(--bg-card);
color: var(--text-primary);
border: 1px solid var(--border-primary);
```

---

## 📝 Notes

### Login/Signup Pages
- **Background:** Custom gym image (`/login-page-side-image.jpg`)
- **Layout:** Split screen (50/50) - image left, form right
- **Form Background:** `#2a2a2a`
- **Input Style:** Transparent with bottom border
- **Logo:** Inverted and brightened for dark bg
- **Mobile:** Hide left image, full-width form

### Special Considerations
1. **Icon Import:** Always use named imports from `lucide-react`
2. **Colors:** Reference CSS variables, not hard-coded colors
3. **Spacing:** Use consistent spacing scale (8px, 16px, 24px, 32px)
4. **Borders:** Always `1px solid var(--border-primary)`
5. **Shadows:** Layer shadows for depth (0 4px 6px, 0 8px 16px, etc.)

### Common Pitfalls to Avoid
- ❌ Don't hard-code colors
- ❌ Don't use inline styles for theme-dependent properties
- ❌ Don't forget mobile menu overlay on tablet
- ❌ Don't skip hover states on interactive elements
- ❌ Don't use tables on mobile (use cards instead)

---

## 🎯 Summary

This Admin Portal uses a **professional dark theme** with **orange accents (#ff6b35)**, **smooth animations**, and **comprehensive responsive design**. The color palette is carefully chosen for gym/fitness aesthetics while maintaining excellent readability.

**Key Takeaways for Member Portal:**
1. Copy `global.css` and `responsive.css` exactly
2. Use Lucide React for all icons
3. Maintain the same spacing scale (16px, 24px, 32px)
4. Keep card hover effects (translateY + shadow)
5. Use overlay sidebar on mobile AND tablet
6. Apply same color variables throughout
7. Follow component patterns for consistency

**Result:** A cohesive design system that works seamlessly across both Admin and Member portals with consistent branding, UX patterns, and visual language.

---

**Document Version:** 1.0.0  
**Created:** December 8, 2025  
**For:** GymSphere Member Portal Development  
**Contact:** GitHub Copilot / Admin Portal Team
