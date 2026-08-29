//
// Copyright 2026 安秋 <github.com/unjal29>
// Licensed under the Apache License, Version 2.0
//
// Material Components for Web (MDC-Web) - Android 5.0 (Lollipop) ~ 11.0 (R) 扁平化边界弧形动效 (Flat Arc EdgeEffect)
// 1:1 像素级与物理级复刻 AOSP EdgeEffect 状态机 (onPull / onAbsorb / onRelease)、mDisplacement 触摸偏置与 SVG 贝塞尔弧顶
//

const SVG_NS = 'http://www.w3.org/2000/svg';

export class MduiFlatEdgeEffect {
  /**
   * @param {HTMLElement} [container] 目标滚动容器，默认 window/viewport
   */
  constructor(container = null) {
    this.isWindow = !container || container === document.body || container === document.documentElement;
    this.container = this.isWindow ? document.body : container;
    
    this.wrapper = null;
    this.arcs = {
      top: null,
      bottom: null,
      left: null,
      right: null
    };
    this.paths = {
      top: null,
      bottom: null,
      left: null,
      right: null
    };
    this.recedeTimers = {
      top: null,
      bottom: null,
      left: null,
      right: null
    };

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isPulling = {
      top: false,
      bottom: false,
      left: false,
      right: false
    };

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = `md1-overscroll-edge-container ${this.isWindow ? 'md1-overscroll-edge-container--fixed' : ''}`;

    // 创建四向 SVG 弧线穹顶
    ['top', 'bottom', 'left', 'right'].forEach((dir) => {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', `md1-overscroll-edge-arc md1-overscroll-edge-arc--${dir}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      
      const isVertical = dir === 'top' || dir === 'bottom';
      svg.setAttribute('viewBox', isVertical ? '0 0 1000 100' : '0 0 100 1000');

      const path = document.createElementNS(SVG_NS, 'path');
      this.updatePathD(path, dir, 0.5);

      svg.appendChild(path);
      this.wrapper.appendChild(svg);

      this.arcs[dir] = svg;
      this.paths[dir] = path;
    });

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
   * 更新 SVG 二次贝塞尔弧顶几何路径 (支持 mDisplacement 触摸偏置)
   * @param {SVGPathElement} pathEl
   * @param {'top'|'bottom'|'left'|'right'} dir
   * @param {number} displacement 0.0 ~ 1.0 (接触点相对归一化位置)
   */
  updatePathD(pathEl, dir, displacement = 0.5) {
    const dClamped = Math.max(0.05, Math.min(0.95, displacement));
    
    if (dir === 'bottom') {
      // 底部向上拱起的半椭圆弧顶 (基底位于 y=100，最高点位于 y=0)
      const ctrlX = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      pathEl.setAttribute('d', `M 0 100 Q ${ctrlX} 0 1000 100 Z`);
    } else if (dir === 'top') {
      // 顶部向下拱起的半椭圆弧顶 (基底位于 y=0，最高点位于 y=100)
      const ctrlX = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      pathEl.setAttribute('d', `M 0 0 Q ${ctrlX} 100 1000 0 Z`);
    } else if (dir === 'left') {
      // 左侧向右拱起的弧顶 (基底位于 x=0，最高点位于 x=100)
      const ctrlY = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      pathEl.setAttribute('d', `M 0 0 Q 100 ${ctrlY} 0 1000 Z`);
    } else if (dir === 'right') {
      // 右侧向左拱起的弧顶 (基底位于 x=100，最高点位于 x=0)
      const ctrlY = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      pathEl.setAttribute('d', `M 100 0 Q 0 ${ctrlY} 100 1000 Z`);
    }
  }

  /**
   * 手指触控下拉/上拉拖拽 (STATE_PULL) - 0 延迟实时拉伸高度与透明度
   * @param {'top'|'bottom'|'left'|'right'} dir
   * @param {number} delta 拖拽距离 (px)
   * @param {number} [displacement=0.5] 触摸点偏置 (0.0~1.0)
   */
  onPull(dir, delta, displacement = 0.5) {
    const arc = this.arcs[dir];
    const path = this.paths[dir];
    if (!arc || !path) return;

    clearTimeout(this.recedeTimers[dir]);
    this.isPulling[dir] = true;

    this.updatePathD(path, dir, displacement);

    const pull = Math.abs(delta);
    const scale = Math.min(2.4, Math.max(0.15, pull / 55));
    const opacity = Math.min(0.24, Math.max(0.08, 0.08 + pull / 380));

    arc.classList.remove('is-receding');
    arc.classList.add('is-active');

    const isVertical = dir === 'top' || dir === 'bottom';
    arc.style.transition = 'transform 0.04s linear, opacity 0.04s linear';
    arc.style.transform = isVertical ? `scaleY(${scale})` : `scaleX(${scale})`;
    arc.style.opacity = `${opacity}`;
  }

  /**
   * 手指松开 (STATE_RECEDE) - Material Fast-Out Slow-In 平滑收缩回弹
   * @param {'top'|'bottom'|'left'|'right'} dir
   */
  onRelease(dir) {
    const arc = this.arcs[dir];
    if (!arc || !this.isPulling[dir]) return;

    this.isPulling[dir] = false;
    clearTimeout(this.recedeTimers[dir]);

    arc.classList.remove('is-active');
    arc.classList.add('is-receding');

    const isVertical = dir === 'top' || dir === 'bottom';
    arc.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.45s cubic-bezier(0.2, 0.8, 0.25, 1)';
    arc.style.transform = isVertical ? 'scaleY(0)' : 'scaleX(0)';
    arc.style.opacity = '0';

    this.recedeTimers[dir] = setTimeout(() => {
      arc.classList.remove('is-receding');
    }, 450);
  }

  /**
   * 惯性触底/滚轮撞击边界 (STATE_ABSORB -> STATE_RECEDE)
   * @param {'top'|'bottom'|'left'|'right'} dir
   * @param {number} [velocity=80] 冲击初速度
   * @param {number} [displacement=0.5] 碰撞点偏置 (0.0~1.0)
   */
  onAbsorb(dir, velocity = 80, displacement = 0.5) {
    const arc = this.arcs[dir];
    const path = this.paths[dir];
    if (!arc || !path) return;

    clearTimeout(this.recedeTimers[dir]);
    this.updatePathD(path, dir, displacement);

    const isVertical = dir === 'top' || dir === 'bottom';
    const v = Math.abs(velocity);
    const peakScale = Math.min(2.0, Math.max(0.6, v / 55));
    const peakOpacity = Math.min(0.22, Math.max(0.12, 0.10 + v / 320));

    arc.classList.remove('is-receding');
    arc.classList.add('is-active');

    // 1. 快速吸能膨胀阶段 (~100ms)
    arc.style.transition = 'transform 0.12s cubic-bezier(0, 0, 0.2, 1), opacity 0.12s ease-in';
    arc.style.transform = isVertical ? `scaleY(${peakScale})` : `scaleX(${peakScale})`;
    arc.style.opacity = `${peakOpacity}`;

    // 2. 衰减回弹消退阶段 (450ms)
    this.recedeTimers[dir] = setTimeout(() => {
      arc.classList.remove('is-active');
      arc.classList.add('is-receding');
      arc.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.45s ease-out';
      arc.style.transform = isVertical ? 'scaleY(0)' : 'scaleX(0)';
      arc.style.opacity = '0';

      this.recedeTimers[dir] = setTimeout(() => {
        arc.classList.remove('is-receding');
      }, 450);
    }, 120);
  }

  /**
   * 快捷兼容触发器 (支持 isTop 或方向字符串)
   * @param {boolean|string} isTopOrDir
   * @param {number} [intensity=1] 强度系数 (0.5 ~ 2.0)
   * @param {number} [displacement=0.5]
   */
  trigger(isTopOrDir, intensity = 1, displacement = 0.5) {
    let dir = 'top';
    if (typeof isTopOrDir === 'boolean') {
      dir = isTopOrDir ? 'top' : 'bottom';
    } else if (typeof isTopOrDir === 'string') {
      dir = isTopOrDir;
    }
    this.onAbsorb(dir, intensity * 70, displacement);
  }

  triggerGlow(container, isTop, intensity = 1) {
    this.trigger(isTop, intensity, 0.5);
  }

  bindEvents() {
    const targetEl = this.isWindow ? window : this.container;

    // 1. 鼠标滚轮监听 (精准边界检测与冲击吸收)
    targetEl.addEventListener('wheel', (e) => {
      let isTop = false;
      let isBottom = false;
      let isLeft = false;
      let isRight = false;

      let rect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      if (!this.isWindow && this.container.getBoundingClientRect) {
        rect = this.container.getBoundingClientRect();
      }

      const displacementX = (e.clientX - rect.left) / (rect.width || 1);
      const displacementY = (e.clientY - rect.top) / (rect.height || 1);

      if (this.isWindow) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;

        isTop = scrollY <= 1 && e.deltaY < 0;
        isBottom = scrollY >= maxScrollY - 2 && e.deltaY > 0;
        isLeft = scrollX <= 1 && e.deltaX < 0;
        isRight = scrollX >= maxScrollX - 2 && e.deltaX > 0;
      } else {
        const scrollTop = this.container.scrollTop;
        const maxScrollY = this.container.scrollHeight - this.container.clientHeight;
        const scrollLeft = this.container.scrollLeft;
        const maxScrollX = this.container.scrollWidth - this.container.clientWidth;

        isTop = scrollTop <= 1 && e.deltaY < 0;
        isBottom = scrollTop >= maxScrollY - 2 && e.deltaY > 0;
        isLeft = scrollLeft <= 1 && e.deltaX < 0;
        isRight = scrollLeft >= maxScrollX - 2 && e.deltaX > 0;
      }

      if (isTop) {
        this.onAbsorb('top', Math.abs(e.deltaY), displacementX);
      } else if (isBottom) {
        this.onAbsorb('bottom', Math.abs(e.deltaY), displacementX);
      } else if (isLeft) {
        this.onAbsorb('left', Math.abs(e.deltaX), displacementY);
      } else if (isRight) {
        this.onAbsorb('right', Math.abs(e.deltaX), displacementY);
      }
    }, { passive: true });

    // 2. 触控手势监听 (实时拉伸与位移跟随)
    targetEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    targetEl.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - this.touchStartY;
      const deltaX = currentX - this.touchStartX;

      let rect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      if (!this.isWindow && this.container.getBoundingClientRect) {
        rect = this.container.getBoundingClientRect();
      }

      const displacementX = (currentX - rect.left) / (rect.width || 1);
      const displacementY = (currentY - rect.top) / (rect.height || 1);

      let isTop = false;
      let isBottom = false;
      let isLeft = false;
      let isRight = false;

      if (this.isWindow) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;

        isTop = scrollY <= 0 && deltaY > 6;
        isBottom = scrollY >= maxScrollY - 2 && deltaY < -6;
        isLeft = scrollX <= 0 && deltaX > 6;
        isRight = scrollX >= maxScrollX - 2 && deltaX < -6;
      } else {
        const scrollTop = this.container.scrollTop;
        const maxScrollY = this.container.scrollHeight - this.container.clientHeight;
        const scrollLeft = this.container.scrollLeft;
        const maxScrollX = this.container.scrollWidth - this.container.clientWidth;

        isTop = scrollTop <= 0 && deltaY > 6;
        isBottom = scrollTop >= maxScrollY - 2 && deltaY < -6;
        isLeft = scrollLeft <= 0 && deltaX > 6;
        isRight = scrollLeft >= maxScrollX - 2 && deltaX < -6;
      }

      if (isTop) {
        this.onPull('top', deltaY, displacementX);
      } else if (isBottom) {
        this.onPull('bottom', deltaY, displacementX);
      } else if (isLeft) {
        this.onPull('left', deltaX, displacementY);
      } else if (isRight) {
        this.onPull('right', deltaX, displacementY);
      }
    }, { passive: true });

    const handleRelease = () => {
      this.onRelease('top');
      this.onRelease('bottom');
      this.onRelease('left');
      this.onRelease('right');
    };

    targetEl.addEventListener('touchend', handleRelease, { passive: true });
    targetEl.addEventListener('touchcancel', handleRelease, { passive: true });
  }
}

/**
 * 全局一键自动代理挂载视口与所有滚动容器
 */
export class MduiFlatEdgeEffectManager {
  constructor() {
    this.rootEffect = new MduiFlatEdgeEffect(null);
    this.containerMap = new WeakMap();
    this.bindDelegation();
  }

  triggerGlow(container, isTop, intensity = 1) {
    if (!container || container === document.body || container === document.documentElement) {
      this.rootEffect.trigger(isTop, intensity);
      return;
    }
    let effect = this.containerMap.get(container);
    if (!effect) {
      effect = new MduiFlatEdgeEffect(container);
      this.containerMap.set(container, effect);
    }
    effect.trigger(isTop, intensity);
  }

  bindDelegation() {
    // 监听全局 wheel 捕获所有可滚动容器
    window.addEventListener('wheel', (e) => {
      const scrollable = this.findScrollable(e.target);
      if (scrollable && scrollable !== document.body && scrollable !== document.documentElement) {
        let effect = this.containerMap.get(scrollable);
        if (!effect) {
          effect = new MduiFlatEdgeEffect(scrollable);
          this.containerMap.set(scrollable, effect);
        }
      }
    }, { passive: true, capture: true });

    // 监听全局 touch 捕获所有可滚动容器
    window.addEventListener('touchstart', (e) => {
      const scrollable = this.findScrollable(e.target);
      if (scrollable && scrollable !== document.body && scrollable !== document.documentElement) {
        let effect = this.containerMap.get(scrollable);
        if (!effect) {
          effect = new MduiFlatEdgeEffect(scrollable);
          this.containerMap.set(scrollable, effect);
        }
      }
    }, { passive: true, capture: true });
  }

  findScrollable(target) {
    let el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.classList && el.classList.contains('md1-overscroll-edge-container')) {
        el = el.parentElement;
        continue;
      }
      const style = window.getComputedStyle(el);
      const isScrollableY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      const isScrollableX = (style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth;
      if (isScrollableY || isScrollableX) return el;
      el = el.parentElement;
    }
    return null;
  }
}

export function attachFlatEdgeEffect(container) {
  if (container) return new MduiFlatEdgeEffect(container);
  return new MduiFlatEdgeEffectManager();
}

// 统一命名与多别名导出
export const MduiEdgeEffect = MduiFlatEdgeEffect;
export const MduiEdgeEffectManager = MduiFlatEdgeEffectManager;
export const MduiOverscrollRipple = MduiFlatEdgeEffect;
export const MduiOverscrollGlow = MduiFlatEdgeEffect;
export const attachEdgeEffect = attachFlatEdgeEffect;
export const attachOverscrollRipple = attachFlatEdgeEffect;
export const attachOverscrollGlow = attachFlatEdgeEffect;
