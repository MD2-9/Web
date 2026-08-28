//
// Copyright 2026 unjal <unjal29@outlook.com>
// Licensed under the Apache License, Version 2.0
//
// Material Design (Android 5.0 - 11.0 Lollipop ~ R) Universal Overscroll Edge Glow / Ripple Controller
// Supports window and all nested scrollable containers.
//

export class MduiOverscrollGlow {
  constructor(options = {}) {
    this.rootGlowTop = null;
    this.rootGlowBottom = null;
    this.containerMap = new WeakMap();
    this.activeTimeouts = new WeakMap();
    this.touchStartY = 0;
    this.touchTarget = null;

    this.initRootGlows();
    this.bindGlobalEvents();
  }

  initRootGlows() {
    this.rootGlowTop = document.querySelector('.md1-overscroll-glow--top.md1-overscroll-glow--fixed');
    if (!this.rootGlowTop) {
      this.rootGlowTop = document.createElement('div');
      this.rootGlowTop.className = 'md1-overscroll-glow md1-overscroll-glow--top md1-overscroll-glow--fixed';
      this.rootGlowTop.innerHTML = '<div class="md1-overscroll-glow__arc"></div>';
      document.body.appendChild(this.rootGlowTop);
    }

    this.rootGlowBottom = document.querySelector('.md1-overscroll-glow--bottom.md1-overscroll-glow--fixed');
    if (!this.rootGlowBottom) {
      this.rootGlowBottom = document.createElement('div');
      this.rootGlowBottom.className = 'md1-overscroll-glow md1-overscroll-glow--bottom md1-overscroll-glow--fixed';
      this.rootGlowBottom.innerHTML = '<div class="md1-overscroll-glow__arc"></div>';
      document.body.appendChild(this.rootGlowBottom);
    }
  }

  getOrCreateContainerGlow(container) {
    if (!container || container === document.body || container === document.documentElement || container === window) {
      return { top: this.rootGlowTop, bottom: this.rootGlowBottom };
    }

    if (this.containerMap.has(container)) {
      return this.containerMap.get(container);
    }

    const computedPos = window.getComputedStyle(container).position;
    if (computedPos === 'static') {
      container.style.position = 'relative';
    }

    let topEl = container.querySelector(':scope > .md1-overscroll-glow--top');
    if (!topEl) {
      topEl = document.createElement('div');
      topEl.className = 'md1-overscroll-glow md1-overscroll-glow--top';
      topEl.innerHTML = '<div class="md1-overscroll-glow__arc"></div>';
      container.insertBefore(topEl, container.firstChild);
    }

    let bottomEl = container.querySelector(':scope > .md1-overscroll-glow--bottom');
    if (!bottomEl) {
      bottomEl = document.createElement('div');
      bottomEl.className = 'md1-overscroll-glow md1-overscroll-glow--bottom';
      bottomEl.innerHTML = '<div class="md1-overscroll-glow__arc"></div>';
      container.appendChild(bottomEl);
    }

    const pair = { top: topEl, bottom: bottomEl };
    this.containerMap.set(container, pair);
    return pair;
  }

  triggerGlow(element, isTop, intensity = 1) {
    if (!element) return;
    const key = `${isTop ? 't' : 'b'}`;
    let timeouts = this.activeTimeouts.get(element) || {};
    clearTimeout(timeouts[key]);

    element.classList.add('is-active');
    element.style.opacity = `${Math.min(0.9, 0.45 + intensity * 0.45)}`;
    const arc = element.querySelector('.md1-overscroll-glow__arc');
    if (arc) arc.style.transform = `scaleY(${Math.min(1.5, 0.7 + intensity * 0.5)})`;

    timeouts[key] = setTimeout(() => {
      element.classList.remove('is-active');
      element.style.opacity = '';
      if (arc) arc.style.transform = '';
    }, 280);
    this.activeTimeouts.set(element, timeouts);
  }

  findScrollableAncestor(target) {
    let el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      if (isScrollable) return el;
      el = el.parentElement;
    }
    return null;
  }

  bindGlobalEvents() {
    // 1. 鼠标滚轮滚到头/滚到底水波纹响应 (Wheel)
    window.addEventListener('wheel', (e) => {
      const scrollable = this.findScrollableAncestor(e.target);
      if (scrollable) {
        const scrollTop = scrollable.scrollTop;
        const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
        const pair = this.getOrCreateContainerGlow(scrollable);

        if (scrollTop <= 1 && e.deltaY < 0) {
          this.triggerGlow(pair.top, true, Math.min(1, Math.abs(e.deltaY) / 100));
        } else if (scrollTop >= maxScroll - 2 && e.deltaY > 0) {
          this.triggerGlow(pair.bottom, false, Math.min(1, Math.abs(e.deltaY) / 100));
        }
      } else {
        // 全局页面视口触顶/触底
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollY <= 1 && e.deltaY < 0) {
          this.triggerGlow(this.rootGlowTop, true, Math.min(1, Math.abs(e.deltaY) / 100));
        } else if (scrollY >= maxScrollY - 2 && e.deltaY > 0) {
          this.triggerGlow(this.rootGlowBottom, false, Math.min(1, Math.abs(e.deltaY) / 100));
        }
      }
    }, { passive: true });

    // 2. 移动端触摸拖拽触顶/触底响应 (Touch)
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.touchStartY = e.touches[0].clientY;
        this.touchTarget = e.target;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - this.touchStartY;
      const scrollable = this.findScrollableAncestor(this.touchTarget || e.target);

      if (scrollable) {
        const scrollTop = scrollable.scrollTop;
        const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
        const pair = this.getOrCreateContainerGlow(scrollable);

        if (scrollTop <= 0 && deltaY > 10) {
          this.triggerGlow(pair.top, true, Math.min(1, deltaY / 150));
        } else if (scrollTop >= maxScroll - 2 && deltaY < -10) {
          this.triggerGlow(pair.bottom, false, Math.min(1, Math.abs(deltaY) / 150));
        }
      } else {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollY <= 0 && deltaY > 10) {
          this.triggerGlow(this.rootGlowTop, true, Math.min(1, deltaY / 150));
        } else if (scrollY >= maxScrollY - 2 && deltaY < -10) {
          this.triggerGlow(this.rootGlowBottom, false, Math.min(1, Math.abs(deltaY) / 150));
        }
      }
    }, { passive: true });
  }
}

export function attachOverscrollGlow(options) {
  return new MduiOverscrollGlow(options);
}
