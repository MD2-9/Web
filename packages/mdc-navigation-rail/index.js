/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Material Navigation Rail & Secondary Overlay Panels 核心控制器
 */
export class MdcNavigationRail {
  /**
   * @param {HTMLElement} root
   * @param {Object} [options]
   */
  constructor(root, options = {}) {
    this.root = root;
    this.navSection = root.querySelector('#drawerNavSection') || root.querySelector('.drawer-nav-section');
    this.backdrop = document.getElementById('mobileDrawerBackdrop') || document.querySelector('.mobile-drawer-backdrop');
    this.floatingBtn = document.getElementById('btnMobileFloatingMenu') || document.querySelector('.mobile-floating-menu-btn');
    this.activeOverlayId = null;
    this.idleTimeoutSeconds = options.idleTimeoutSeconds || 2.9;
    this.idleTimer = null;

    this.titleTop = document.getElementById('railVerticalTitleTop') || root.querySelector('#railVerticalTitleTop');
    this.titleBottom = document.getElementById('railVerticalTitleBottom') || root.querySelector('#railVerticalTitleBottom');

    this.init();
  }

  init() {
    this.initMobileEvents();
    this.initOverlayEvents();
  }

  openOverlay(panelId) {
    const panel = document.getElementById(panelId);
    if (!this.navSection || !panel) return;

    this.root.classList.add('is-expanded');
    this.root.classList.add('has-overlay');
    this.navSection.classList.remove('anim-in');
    this.navSection.classList.add('anim-out');

    panel.style.display = 'flex';
    panel.classList.remove('anim-out');
    panel.classList.add('anim-in');
    this.activeOverlayId = panelId;
  }

  closeOverlay(panelId) {
    const id = panelId || this.activeOverlayId;
    if (!id) return;

    const panel = document.getElementById(id);
    if (!this.navSection || !panel) return;

    panel.classList.remove('anim-in');
    panel.classList.add('anim-out');

    setTimeout(() => {
      panel.style.display = 'none';
      this.navSection.classList.remove('anim-out');
      this.navSection.classList.add('anim-in');
      this.root.classList.remove('is-expanded');
      this.root.classList.remove('has-overlay');
      this.activeOverlayId = null;
    }, 220);
  }

  openMobileDrawer() {
    this.root.classList.add('mobile-open');
    if (this.backdrop) this.backdrop.classList.add('is-active');
  }

  closeMobileDrawer() {
    this.root.classList.remove('mobile-open');
    if (this.backdrop) this.backdrop.classList.remove('is-active');
    if (this.activeOverlayId) this.closeOverlay(this.activeOverlayId);
  }

  setTitles(topText, bottomText) {
    if (this.titleTop && topText) this.titleTop.textContent = topText;
    if (this.titleBottom && bottomText) this.titleBottom.textContent = bottomText;
  }

  initMobileEvents() {
    const resetIdle = (e) => {
      if (e && e.target && typeof e.target.closest === 'function' && (e.target.closest('#btnMobileFloatingMenu') || e.target.closest('.mobile-floating-menu-btn') || e.target.closest('.mdc-navigation-rail') || e.target.closest('.mobile-drawer-backdrop'))) {
        return;
      }
      document.body.classList.remove('page-is-idle');
      if (this.idleTimer) clearTimeout(this.idleTimer);

      this.idleTimer = setTimeout(() => {
        document.body.classList.add('page-is-idle');
      }, this.idleTimeoutSeconds * 1000);
    };

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'scroll', 'wheel'].forEach(evt => {
      window.addEventListener(evt, resetIdle, { passive: true });
    });
    resetIdle();

    if (this.floatingBtn) {
      this.floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openMobileDrawer();
      });
      this.floatingBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.closeMobileDrawer());
    }

    // 边缘手势滑动唤出
    let touchStartX = 0;
    let touchStartY = 0;

      let touchStartedInRail = false;
      window.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartedInRail = !!(e.target && typeof e.target.closest === 'function' && e.target.closest('.mdc-navigation-rail'));
      }, { passive: true });

      window.addEventListener('touchend', (e) => {
        if (touchStartedInRail || (e.target && typeof e.target.closest === 'function' && e.target.closest('.mdc-navigation-rail'))) {
          return;
        }
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        if (touchStartX < 35 && deltaX > 45 && deltaY < 80) {
          this.openMobileDrawer();
        } else if (touchStartX > 40 && deltaX < -50 && deltaY < 80) {
          if (this.root.classList.contains('mobile-open')) {
            this.closeMobileDrawer();
          }
        }
      }, { passive: true });
    }

    initOverlayEvents() {
      if (this.navSection) {
        this.navSection.addEventListener('click', (e) => {
          if (!e.target || typeof e.target.closest !== 'function' || !e.target.closest('.rail-nav-item, .rail-header, button, a, input, .mdc-button')) {
            if (this.activeOverlayId) {
              this.closeOverlay(this.activeOverlayId);
            } else if (window.innerWidth < 600) {
              this.closeMobileDrawer();
            }
          }
        });
      }
    }

  static attachTo(root, options) {
    return new MdcNavigationRail(root, options);
  }
}
