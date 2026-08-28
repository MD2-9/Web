//
// Copyright 2026 unjal <unjal29@outlook.com>
// Licensed under the Apache License, Version 2.0
//
// Android 5.0 ~ 11.0 经典页面边界水波纹控制器 (与 Material Ripple 涟漪特效风格完全一致)
//

export class MduiOverscrollRipple {
  /**
   * @param {HTMLElement} [container] 目标滚动容器，默认 window/viewport
   */
  constructor(container = null) {
    this.isWindow = !container || container === document.body || container === document.documentElement;
    this.container = this.isWindow ? document.body : container;
    this.wrapper = null;
    this.activeWaves = new Set();
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.lastTriggerTime = 0;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = `md1-overscroll-ripple-container ${this.isWindow ? 'md1-overscroll-ripple-container--fixed' : ''}`;

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
   * 触发边界水波纹 (Material Ripple 同款扩散涟漪)
   * @param {boolean} isTop 顶部或底部
   * @param {number} [clientX] 触碰点横坐标
   */
  trigger(isTop, clientX = window.innerWidth / 2) {
    const now = Date.now();
    if (now - this.lastTriggerTime < 180) return;
    this.lastTriggerTime = now;

    const rect = this.isWindow 
      ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
      : this.container.getBoundingClientRect();

    const originX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const originY = isTop ? 0 : rect.height;

    // 计算覆盖边界视口所需的最大水波纹半径
    const radius = Math.hypot(
      Math.max(originX, rect.width - originX),
      Math.min(rect.height * 0.65, 360)
    ) * 1.15;

    const wave = document.createElement('div');
    wave.className = 'md1-overscroll-ripple-wave';
    wave.style.width = `${radius * 2}px`;
    wave.style.height = `${radius * 2}px`;
    wave.style.left = `${originX}px`;
    wave.style.top = `${originY}px`;

    this.wrapper.appendChild(wave);
    this.activeWaves.add(wave);

    requestAnimationFrame(() => {
      wave.classList.add('is-active');
      setTimeout(() => {
        wave.classList.add('is-fading');
        setTimeout(() => {
          if (wave.parentNode) wave.parentNode.removeChild(wave);
          this.activeWaves.delete(wave);
        }, 450);
      }, 250);
    });
  }

  bindEvents() {
    const targetEl = this.isWindow ? window : this.container;

    // 1. 鼠标滚轮边界监听
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
        this.trigger(true, e.clientX);
      } else if (isBottomBoundary) {
        this.trigger(false, e.clientX);
      }
    }, { passive: true });

    // 2. 触控手势边界监听
    targetEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    targetEl.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
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
        this.trigger(true, currentX);
      } else if (isBottom) {
        this.trigger(false, currentX);
      }
    }, { passive: true });
  }
}

/**
 * 全局一键自动挂载视口与所有滚动容器的 Android 5-11 边界水波纹
 */
export class MduiOverscrollRippleManager {
  constructor() {
    this.rootRipple = new MduiOverscrollRipple(null);
    this.containerMap = new WeakMap();
    this.bindDelegation();
  }

  bindDelegation() {
    window.addEventListener('wheel', (e) => {
      const scrollable = this.findScrollable(e.target);
      if (scrollable) {
        let ripple = this.containerMap.get(scrollable);
        if (!ripple) {
          ripple = new MduiOverscrollRipple(scrollable);
          this.containerMap.set(scrollable, ripple);
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

export function attachOverscrollRipple(container) {
  if (container) return new MduiOverscrollRipple(container);
  return new MduiOverscrollRippleManager();
}

export const MduiEdgeEffect = MduiOverscrollRipple;
export const MduiOverscrollGlow = MduiOverscrollRipple;
export const attachEdgeEffect = attachOverscrollRipple;
export const attachOverscrollGlow = attachOverscrollRipple;
