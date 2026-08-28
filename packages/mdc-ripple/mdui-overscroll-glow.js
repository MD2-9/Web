//
// Copyright 2026 unjal <unjal29@outlook.com>
// Licensed under the Apache License, Version 2.0
//
// Android 5.0 (Lollipop) ~ Android 11.0 (R) Material EdgeEffect Controller
// Implements AOSP EdgeEffect.java state machine (PULL -> ABSORB -> RECEDE) with touch displacement.
//

export class MduiEdgeEffect {
  /**
   * @param {HTMLElement} [container] 目标滚动容器，默认 window/viewport
   */
  constructor(container = null) {
    this.isWindow = !container || container === document.body || container === document.documentElement;
    this.container = this.isWindow ? document.body : container;
    
    this.wrapper = null;
    this.topEffect = null;
    this.bottomEffect = null;
    this.topGlow = null;
    this.bottomGlow = null;
    
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.recedeTimers = { top: null, bottom: null };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = `md1-edge-effect-container ${this.isWindow ? 'md1-edge-effect-container--fixed' : ''}`;

    // 顶部 EdgeEffect
    this.topEffect = document.createElement('div');
    this.topEffect.className = 'md1-edge-effect md1-edge-effect--top';
    this.topEffect.innerHTML = `
      <div class="md1-edge-effect__arc"></div>
      <div class="md1-edge-effect__glow"></div>
    `;
    this.topGlow = this.topEffect.querySelector('.md1-edge-effect__glow');

    // 底部 EdgeEffect
    this.bottomEffect = document.createElement('div');
    this.bottomEffect.className = 'md1-edge-effect md1-edge-effect--bottom';
    this.bottomEffect.innerHTML = `
      <div class="md1-edge-effect__arc"></div>
      <div class="md1-edge-effect__glow"></div>
    `;
    this.bottomGlow = this.bottomEffect.querySelector('.md1-edge-effect__glow');

    this.wrapper.appendChild(this.topEffect);
    this.wrapper.appendChild(this.bottomEffect);

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
   * 触发吸收冲击水波纹 (onAbsorb)
   * @param {boolean} isTop
   * @param {number} velocity
   * @param {number} clientX
   */
  onAbsorb(isTop, velocity = 1, clientX = window.innerWidth / 2) {
    const effect = isTop ? this.topEffect : this.bottomEffect;
    const glow = isTop ? this.topGlow : this.bottomGlow;
    const timerKey = isTop ? 'top' : 'bottom';
    if (!effect || !glow) return;

    clearTimeout(this.recedeTimers[timerKey]);

    const rect = this.isWindow 
      ? { left: 0, width: window.innerWidth, height: window.innerHeight }
      : this.container.getBoundingClientRect();

    const displacementX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const glowWidth = Math.max(rect.width * 0.75, 260);
    const glowHeight = Math.min(180, glowWidth * 0.45);

    glow.style.width = `${glowWidth}px`;
    glow.style.height = `${glowHeight}px`;
    glow.style.left = `${displacementX}px`;

    // 状态 1: ABSORB 冲击展开
    effect.classList.remove('is-receding');
    effect.classList.add('is-active');
    
    const intensity = Math.min(1.4, Math.max(0.6, velocity));
    glow.style.transition = 'transform 0.12s cubic-bezier(0, 0, 0.2, 1), opacity 0.12s ease';
    glow.style.transform = `translate(-50%, 0) scale(${intensity})`;
    glow.style.opacity = `${Math.min(0.85, 0.4 + intensity * 0.35)}`;

    // 状态 2: RECEDE 衰减消退
    this.recedeTimers[timerKey] = setTimeout(() => {
      effect.classList.remove('is-active');
      effect.classList.add('is-receding');
      glow.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.45s ease-out';
      glow.style.transform = `translate(-50%, 0) scale(${intensity * 1.35})`;
      glow.style.opacity = '0';
    }, 180);
  }

  /**
   * 持续拉动水波纹 (onPull)
   * @param {boolean} isTop
   * @param {number} deltaY
   * @param {number} clientX
   */
  onPull(isTop, deltaY, clientX = window.innerWidth / 2) {
    const effect = isTop ? this.topEffect : this.bottomEffect;
    const glow = isTop ? this.topGlow : this.bottomGlow;
    if (!effect || !glow) return;

    const rect = this.isWindow 
      ? { left: 0, width: window.innerWidth, height: window.innerHeight }
      : this.container.getBoundingClientRect();

    const displacementX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const glowWidth = Math.max(rect.width * 0.75, 260);
    const glowHeight = Math.min(180, glowWidth * 0.45);

    glow.style.width = `${glowWidth}px`;
    glow.style.height = `${glowHeight}px`;
    glow.style.left = `${displacementX}px`;

    effect.classList.remove('is-receding');
    effect.classList.add('is-active');

    const pullDistance = Math.abs(deltaY);
    const scale = Math.min(1.5, Math.sqrt(pullDistance / 80));
    const alpha = Math.min(0.75, 0.25 + pullDistance / 180);

    glow.style.transition = 'transform 0.05s linear, opacity 0.05s linear';
    glow.style.transform = `translate(-50%, 0) scale(${scale})`;
    glow.style.opacity = `${alpha}`;
  }

  /**
   * 释放拉动 (onRelease)
   * @param {boolean} isTop
   */
  onRelease(isTop) {
    const effect = isTop ? this.topEffect : this.bottomEffect;
    const glow = isTop ? this.topGlow : this.bottomGlow;
    const timerKey = isTop ? 'top' : 'bottom';
    if (!effect || !glow) return;

    clearTimeout(this.recedeTimers[timerKey]);
    effect.classList.remove('is-active');
    effect.classList.add('is-receding');

    glow.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.4s ease-out';
    glow.style.transform = `translate(-50%, 0) scale(1.3)`;
    glow.style.opacity = '0';
  }

  bindEvents() {
    // 1. 鼠标滚轮滚到头/底 (Wheel onAbsorb)
    const targetEl = this.isWindow ? window : this.container;

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
        this.onAbsorb(true, Math.min(1.5, Math.abs(e.deltaY) / 75), e.clientX);
      } else if (isBottomBoundary) {
        this.onAbsorb(false, Math.min(1.5, Math.abs(e.deltaY) / 75), e.clientX);
      }
    }, { passive: true });

    // 2. 触控手势拉动与释放 (Touch onPull / onRelease)
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
        isTop = scrollY <= 0 && deltaY > 0;
        isBottom = scrollY >= maxScrollY - 2 && deltaY < 0;
      } else {
        const scrollTop = this.container.scrollTop;
        const maxScroll = this.container.scrollHeight - this.container.clientHeight;
        isTop = scrollTop <= 0 && deltaY > 0;
        isBottom = scrollTop >= maxScroll - 2 && deltaY < 0;
      }

      if (isTop) {
        this.onPull(true, deltaY, currentX);
      } else if (isBottom) {
        this.onPull(false, deltaY, currentX);
      }
    }, { passive: true });

    targetEl.addEventListener('touchend', () => {
      this.onRelease(true);
      this.onRelease(false);
    }, { passive: true });
  }
}

/**
 * 全局一键自动挂载视口与所有滚动容器的 Android 5-11 EdgeEffect
 */
export class MduiEdgeEffectManager {
  constructor() {
    this.rootEffect = new MduiEdgeEffect(null);
    this.containerMap = new WeakMap();
    this.bindDelegation();
  }

  bindDelegation() {
    window.addEventListener('wheel', (e) => {
      const scrollable = this.findScrollable(e.target);
      if (scrollable) {
        let effect = this.containerMap.get(scrollable);
        if (!effect) {
          effect = new MduiEdgeEffect(scrollable);
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

export function attachEdgeEffect(container) {
  if (container) return new MduiEdgeEffect(container);
  return new MduiEdgeEffectManager();
}
