/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Material Mobile Drawer 移动端独立抽屉控制器
 * 规范：
 * 1. 默认不显示，点击悬浮按钮或屏幕边缘右滑呼出
 * 2. 点击右侧空白区域(Backdrop)、反向左滑、点击侧边栏内部空白区域立即收回
 * 3. 点击【跳转页面内容】的导航链接时，保持 0.39s (390ms) 延迟后平滑收回
 * 4. 点击【非跳转按钮】(如二级目录展开、设置、关于、调色盘、主题切换) 不收回侧边栏
 */
export class MdcMobileDrawer {
  /**
   * @param {HTMLElement} root
   * @param {Object} [options]
   */
  constructor(root, options = {}) {
    this.root = root;
    this.backdrop = options.backdrop || document.getElementById('mobileDrawerBackdrop') || document.querySelector('.mobile-drawer-backdrop');
    this.floatingBtn = options.floatingBtn || document.getElementById('btnMobileFloatingMenu') || document.querySelector('.mobile-floating-menu-btn');
    this.activeOverlayId = null;
    this.idleTimeoutSeconds = options.idleTimeoutSeconds || 2.9;
    this.closeDelayOnNavigateMs = options.closeDelayOnNavigateMs || 390; // 0.39s
    this.idleTimer = null;
    this.navTimer = null;

    this.init();
  }

  init() {
    this.initIdleTimer();
    this.initTriggers();
    this.initGestures();
    this.initNavClicks();
  }

  open() {
    if (!this.root) return;
    this.root.classList.add('mobile-open', 'is-open');
    if (this.backdrop) this.backdrop.classList.add('is-active');
  }

  close() {
    if (!this.root) return;
    this.root.classList.remove('mobile-open', 'is-open');
    if (this.backdrop) this.backdrop.classList.remove('is-active');
    if (this.activeOverlayId) {
      this.closeOverlay(this.activeOverlayId);
    }
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  isOpen() {
    return this.root && (this.root.classList.contains('mobile-open') || this.root.classList.contains('is-open'));
  }

  openOverlay(panelId, event) {
    const panel = document.getElementById(panelId);
    if (!panel || !this.root) return;

    if (this.root) {
      const rect = this.root.getBoundingClientRect();
      let originX = 36;
      let originY = 80;

      const evt = event || (window.event ? window.event : null);
      if (evt) {
        const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
        const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
        if (clientX !== null && clientY !== null) {
          originX = Math.max(0, Math.min(rect.width, clientX - rect.left));
          originY = Math.max(0, Math.min(rect.height, clientY - rect.top));
        } else if (evt.currentTarget && evt.currentTarget.getBoundingClientRect) {
          const itemRect = evt.currentTarget.getBoundingClientRect();
          originX = (itemRect.left + itemRect.width / 2) - rect.left;
          originY = (itemRect.top + itemRect.height / 2) - rect.top;
        }
      }

      panel.style.setProperty('--ripple-origin-x', `${originX}px`);
      panel.style.setProperty('--ripple-origin-y', `${originY}px`);
    }

    if (this.activeOverlayId && this.activeOverlayId !== panelId) {
      const prev = document.getElementById(this.activeOverlayId);
      if (prev) {
        prev.classList.remove('anim-in');
        prev.style.display = 'none';
      }
    }

    panel.style.display = 'flex';
    panel.classList.remove('anim-out');
    panel.classList.add('anim-in');
    this.activeOverlayId = panelId;
  }

  closeOverlay(panelId, event) {
    const id = panelId || this.activeOverlayId;
    if (!id) return;

    const panel = document.getElementById(id);
    if (!panel) return;

    if (this.root) {
      const rect = this.root.getBoundingClientRect();
      let originX = 36;
      let originY = 36;
      const evt = event || (window.event ? window.event : null);
      if (evt && evt.currentTarget && evt.currentTarget.getBoundingClientRect) {
        const itemRect = evt.currentTarget.getBoundingClientRect();
        originX = (itemRect.left + itemRect.width / 2) - rect.left;
        originY = (itemRect.top + itemRect.height / 2) - rect.top;
        panel.style.setProperty('--ripple-origin-x', `${originX}px`);
        panel.style.setProperty('--ripple-origin-y', `${originY}px`);
      }
    }

    panel.classList.remove('anim-in');
    panel.classList.add('anim-out');

    setTimeout(() => {
      panel.style.display = 'none';
      panel.classList.remove('anim-out');
      if (this.activeOverlayId === id) {
        this.activeOverlayId = null;
      }
    }, 260);
  }

  initIdleTimer() {
    const resetIdle = (e) => {
      if (e && e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('.mobile-floating-menu-btn') || 
            e.target.closest('.mdc-mobile-drawer') || 
            e.target.closest('.mobile-drawer-backdrop') ||
            e.target.closest('#btnMobileFloatingMenu') ||
            e.target.closest('#app-mobile-drawer')) {
          return;
        }
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
  }

  initTriggers() {
    if (this.floatingBtn) {
      this.floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.open();
      });
      this.floatingBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    if (this.backdrop) {
      // 单击右侧空白区域收回
      this.backdrop.addEventListener('click', () => {
        this.close();
      });
    }
  }

  initGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartedInDrawer = false;

    window.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartedInDrawer = !!(e.target && typeof e.target.closest === 'function' && (e.target.closest('.mdc-mobile-drawer') || e.target.closest('#app-mobile-drawer')));
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // 1. 边缘右滑打开 (左边缘 < 35px 向右滑动 > 45px)
      if (!this.isOpen() && touchStartX < 35 && deltaX > 45 && deltaY < 80) {
        this.open();
      }
      // 2. 反向左滑收回 (已打开状态下向左滑动 > 50px)
      else if (this.isOpen() && deltaX < -50 && deltaY < 80) {
        this.close();
      }
    }, { passive: true });
  }

  initNavClicks() {
    if (!this.root) return;

    this.root.addEventListener('click', (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      // 1. 检查是否点击了页面跳转链接 (例如 href="#section-xxx" 或外部链接)
      const navLink = target.closest('a[href]');
      if (navLink) {
        const href = navLink.getAttribute('href');
        // 如果是有效跳转链接 (锚点或网址)
        if (href && (href.startsWith('#') || href.startsWith('http') || href.startsWith('/'))) {
          // 🌟 保持 0.39s (390ms) 延迟后再收回，让用户获得完整的触控波纹与视觉反馈
          if (this.navTimer) clearTimeout(this.navTimer);
          this.navTimer = setTimeout(() => {
            this.close();
            this.navTimer = null;
          }, this.closeDelayOnNavigateMs);
          return;
        }
      }

      // 2. 检查是否点击了非跳转的功能按钮 (例如打开二级菜单、调色盘、暗色切换、返回按钮等)
      const nonNavAction = target.closest(
        'button, .rail-header, .mobile-drawer-header, [onclick*="openOverlay"], [onclick*="closeOverlay"], [onclick*="toggleThemeMode"], [onclick*="setColorPaletteMode"], .segmented-button, input, select'
      );
      if (nonNavAction) {
        // 非跳转功能按钮：不收回侧边栏，直接放行内部事件
        return;
      }

      // 3. 点击侧边栏内的空白区域：收回
      if (this.activeOverlayId) {
        this.closeOverlay(this.activeOverlayId, e);
      } else {
        this.close();
      }
    });
  }

  static attachTo(root, options) {
    return new MdcMobileDrawer(root, options);
  }
}
