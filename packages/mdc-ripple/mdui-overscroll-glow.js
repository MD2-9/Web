//
// Copyright 2026 unjal <unjal29@outlook.com>
// Licensed under the Apache License, Version 2.0
//
// Android 5.0 (Lollipop) ~ Android 11.0 (R) 扁平化边界弧形水波纹控制器
// 严格复刻截图所示的底部/顶部半椭圆弧顶，纯色微透，无多余光效
//

export class MduiFlatEdgeEffect {
  /**
   * @param {HTMLElement} [container] 目标滚动容器，默认 window/viewport
   */
  constructor(container = null) {
    this.isWindow = !container || container === document.body || container === document.documentElement;
    this.container = this.isWindow ? document.body : container;
    this.wrapper = null;
    this.topArc = null;
    this.bottomArc = null;
    this.touchStartY = 0;
    this.recedeTimers = { top: null, bottom: null };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = `md1-overscroll-edge-container ${this.isWindow ? 'md1-overscroll-edge-container--fixed' : ''}`;

    this.topArc = document.createElement('div');
    this.topArc.className = 'md1-overscroll-edge-arc md1-overscroll-edge-arc--top';

    this.bottomArc = document.createElement('div');
    this.bottomArc.className = 'md1-overscroll-edge-arc md1-overscroll-edge-arc--bottom';

    this.wrapper.appendChild(this.topArc);
    this.wrapper.appendChild(this.bottomArc);

    if (this.isWindow) {
      document.body.appendChild(this.wrapper);
    } else {
      if (window.getComputedStyle(this.container).position === 'static') {
        this.container.style.position = 'relative';
      }
      this.container.appendChild(this.wrapper);
    }
  }

  /**
   * 触发边界弧形膨胀并回弹消退 (支持滚轮冲击与触控拖拉)
   * @param {boolean} isTop
   * @param {number} [intensity=1] 强度 0.5 ~ 1.8
   */
  trigger(isTop, intensity = 1) {
    const arc = isTop ? this.topArc : this.bottomArc;
    const timerKey = isTop ? 'top' : 'bottom';
    if (!arc) return;

    clearTimeout(this.recedeTimers[timerKey]);

    const scale = Math.min(1.8, Math.max(0.5, intensity));

    arc.classList.remove('is-receding');
    arc.classList.add('is-active');
    arc.style.transform = `scaleY(${scale})`;

    this.recedeTimers[timerKey] = setTimeout(() => {
      arc.classList.remove('is-active');
      arc.classList.add('is-receding');
      arc.style.transform = 'scaleY(0)';
    }, 220);
  }

  /**
   * 触控持续下拉/上拉动态缩放
   */
  onPull(isTop, deltaY) {
    const arc = isTop ? this.topArc : this.bottomArc;
    const timerKey = isTop ? 'top' : 'bottom';
    if (!arc) return;

    clearTimeout(this.recedeTimers[timerKey]);
    arc.classList.remove('is-receding');
    arc.classList.add('is-active');

    const pull = Math.abs(deltaY);
    const scale = Math.min(2.0, Math.max(0.2, pull / 70));
    arc.style.transition = 'transform 0.05s linear, opacity 0.05s linear';
    arc.style.transform = `scaleY(${scale})`;
  }

  onRelease(isTop) {
    const arc = isTop ? this.topArc : this.bottomArc;
    const timerKey = isTop ? 'top' : 'bottom';
    if (!arc) return;

    clearTimeout(this.recedeTimers[timerKey]);
    arc.classList.remove('is-active');
    arc.classList.add('is-receding');
    arc.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.45s ease-out';
    arc.style.transform = 'scaleY(0)';
  }

  bindEvents() {
    const targetEl = this.isWindow ? window : this.container;

    // 1. 鼠标滚轮监听
    targetEl.addEventListener('wheel', (e) => {
      let isTopBoundary = false;
      let isBottomBoundary = false;

      if (this.isWindow) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        isTopBoundary = scrollY <= 1 && e.deltaY < 0;
        isBottomBoundary = scrollY >= maxScrollY - 2 && e.deltaY > 0;
      } else {
        const scrollTop = this.container.scrollTop;
        const maxScroll = this.container.scrollHeight - this.container.clientHeight;
        isTopBoundary = scrollTop <= 1 && e.deltaY < 0;
        isBottomBoundary = scrollTop >= maxScroll - 2 && e.deltaY > 0;
      }

      if (isTopBoundary) {
        this.trigger(true, Math.min(1.6, Math.abs(e.deltaY) / 80));
      } else if (isBottomBoundary) {
        this.trigger(false, Math.min(1.6, Math.abs(e.deltaY) / 80));
      }
    }, { passive: true });

    // 2. 触控手势监听
    targetEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    targetEl.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - this.touchStartY;

      let isTop = false;
      let isBottom = false;

      if (this.isWindow) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        isTop = scrollY <= 0 && deltaY > 8;
        isBottom = scrollY >= maxScrollY - 2 && deltaY < -8;
      } else {
        const scrollTop = this.container.scrollTop;
        const maxScroll = this.container.scrollHeight - this.container.clientHeight;
        isTop = scrollTop <= 0 && deltaY > 8;
        isBottom = scrollTop >= maxScroll - 2 && deltaY < -8;
      }

      if (isTop) {
        this.onPull(true, deltaY);
      } else if (isBottom) {
        this.onPull(false, deltaY);
      }
    }, { passive: true });

    targetEl.addEventListener('touchend', () => {
      this.onRelease(true);
      this.onRelease(false);
    }, { passive: true });
  }
}

/**
 * 全局一键自动挂载视口与所有滚动容器
 */
export class MduiFlatEdgeEffectManager {
  constructor() {
    this.rootEffect = new MduiFlatEdgeEffect(null);
    this.containerMap = new WeakMap();
    this.bindDelegation();
  }

  bindDelegation() {
    window.addEventListener('wheel', (e) => {
      const scrollable = this.findScrollable(e.target);
      if (scrollable) {
        let effect = this.containerMap.get(scrollable);
        if (!effect) {
          effect = new MduiFlatEdgeEffect(scrollable);
          this.containerMap.set(scrollable, effect);
        }
      }
    }, { passive: true });
  }

  findScrollable(target) {
    let el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      if (isScrollable) return el;
      el = el.parentElement;
    }
    return null;
  }
}

export function attachFlatEdgeEffect(container) {
  if (container) return new MduiFlatEdgeEffect(container);
  return new MduiFlatEdgeEffectManager();
}

export const MduiEdgeEffect = MduiFlatEdgeEffect;
export const MduiOverscrollRipple = MduiFlatEdgeEffect;
export const MduiOverscrollGlow = MduiFlatEdgeEffect;
export const attachEdgeEffect = attachFlatEdgeEffect;
export const attachOverscrollRipple = attachFlatEdgeEffect;
export const attachOverscrollGlow = attachFlatEdgeEffect;
