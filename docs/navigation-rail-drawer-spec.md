# Navigation Rail & Mobile Drawer Specification & Usage Guide

> **Author**: 安秋 ([github.com/unjal29](https://github.com/unjal29))  
> **Package**: `@material/navigation-rail`, `@material/mobile-drawer`  
> **License**: Apache-2.0

---

## 1. Architectural Overview (架构设计)

M2.9 provides a dual-component responsive navigation system strictly dividing desktop and mobile paradigms:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   M2.9 Responsive Navigation Architecture              │
├───────────────────────────────────┬────────────────────────────────────┤
│ Desktop (Width >= 600px)          │ Mobile (Width < 600px)             │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Component: MdcNavigationRail    │ • Component: MdcMobileDrawer       │
│ • DOM: #app-rail                  │ • DOM: #app-mobile-drawer          │
│ • State: Icon-only rail (80px)    │ • State: Hidden off-canvas by def. │
│ • Expansion: Hover / click sub    │ • Trigger: Edge swipe / Float FAB  │
│ • Overlay Alignment: Centered     │ • Overlay Alignment: Bottom-to-Top │
│ • Target Navigation: Instant      │ • Target Navigation: 0.39s delay   │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Desktop Mode: Navigation Rail (`MdcNavigationRail`)

### 2.1 Structure & States
1. **Collapsed Mode (`width: 80px`)**:
   - Displays icon-only items.
   - Header shows round avatar; bottom footer hosts settings/theme buttons.
2. **Hover Expansion (`width: 256px`)**:
   - Hovering over the rail smoothly expands the container.
   - Labels appear with `opacity: 1; transition: opacity 0.3s cubic-bezier(0, 0, 0.2, 1);`.
   - Moving pointer outside or clicking blank canvas collapses it back.
3. **Secondary Overlay Panels (`.secondary-overlay-panel`)**:
   - Triggered by clicking items such as "Catalog", "Settings", "About", or "Theme Picker".
   - Slides from right with a circular ripple expansion (`clip-path: circle()`).
   - **Vertical Centering**: On desktop, the navigation list (`.rail-nav-list`), custom content (`.secondary-overlay-content`), and theme palette grid (`.theme-grid`) are **vertically centered** (`margin: auto 0; justify-content: center;`).

---

## 3. Mobile Mode: Mobile Drawer (`MdcMobileDrawer`)

### 3.1 Structure & States
1. **Default State**:
   - Hidden off-screen to the left (`transform: translateX(-100%)`).
   - Desktop rail is completely unmounted/hidden (`display: none !important`).
2. **Activation**:
   - Edge right-swipe on the left viewport edge (`touchStartX < 35px, deltaX > 45px`).
   - Clicking the floating action button (`.mobile-floating-menu-btn`) that auto-reveals when the page is idle.
3. **Dismissal**:
   - Left-swipe on drawer.
   - Clicking backdrop or empty space.
   - **0.39s Delayed Auto-Close on Anchor Navigation**: When an anchor link item (`href="#section-..."`) is tapped, the page smoothly scrolls to target while keeping the drawer open for 0.39s, ensuring the user visually confirms their selection before the drawer collapses.
4. **Bottom-Aligned Thumb-Friendly Hierarchy**:
   - Nav list and secondary panels use **Bottom-to-Top alignment** (`justify-content: flex-end; margin-top: auto; margin-bottom: 0;`), placing interactive items closest to thumb reach.

---

## 4. Usage & Initialization (调用示例)

### HTML Markup
```html
<!-- Desktop Rail -->
<nav class="mdc-navigation-rail" id="app-rail">
  <div class="rail-header">
    <div class="rail-header-avatar">M</div>
    <span class="rail-header-text">M2.9 Web</span>
  </div>
  <div class="rail-nav-list">
    <a href="#section-overview" class="rail-nav-item is-active">
      <i class="material-icons rail-item-icon">home</i>
      <span class="rail-item-text">首页</span>
    </a>
  </div>
  <!-- Secondary Overlay Panel -->
  <div class="secondary-overlay-panel" id="catalogSubmenuPanel">
    <div class="secondary-overlay-header">
      <button class="secondary-back-btn"><i class="material-icons">arrow_back</i></button>
      <div class="secondary-overlay-title">组件目录</div>
    </div>
    <div class="rail-nav-list">
      <a href="#section-buttons" class="rail-nav-item">1. 按钮与 FAB</a>
    </div>
  </div>
</nav>

<!-- Mobile Drawer -->
<aside class="mdc-mobile-drawer" id="app-mobile-drawer">
  <!-- Reparented or dedicated mobile items -->
</aside>
<div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop"></div>
<button class="mobile-floating-menu-btn" id="mobileMenuBtn">
  <i class="material-icons">menu</i>
</button>
```

### JavaScript Initialization
```javascript
import { MdcNavigationRail } from '@material/navigation-rail';
import { MdcMobileDrawer } from '@material/mobile-drawer';

// Initialize Desktop Rail
const rail = new MdcNavigationRail(document.getElementById('app-rail'), {
  expandOnHover: true,
  onOverlayOpen: (id) => console.log('Overlay open:', id),
  onOverlayClose: (id) => console.log('Overlay closed:', id)
});

// Initialize Mobile Drawer
const drawer = new MdcMobileDrawer(document.getElementById('app-mobile-drawer'), {
  backdrop: document.getElementById('mobileDrawerBackdrop'),
  floatingBtn: document.getElementById('mobileMenuBtn'),
  navDelayMs: 390
});
```
