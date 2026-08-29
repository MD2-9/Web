//
// Copyright 2026 安秋 <github.com/unjal29>
// Licensed under the Apache License, Version 2.0
//
// Material Components for Web (MDC-Web) - Android 5.0 (Lollipop) ~ 11.0 (R) 扁平化边界弧形动效 (Flat Arc EdgeEffect)
// 1:1 像素级与物理级复刻 AOSP EdgeEffect 状态机 (onPull / onAbsorb / onRelease)、mDisplacement 触摸偏置与 SVG 贝塞尔弧顶
//

const SVG_NS = 'http://www.w3.org/2000/svg';

export class M29FlatEdgeEffect {
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
    this.isMain = this.container && (this.container.classList.contains('main-container') || this.container.id === 'main-container');
    this.isPanel = this.container && (this.container.classList.contains('mdc-component-panel') || this.container.id === 'app-component-panel');

    this.wrapper = document.createElement('div');
    if (this.isMain) {
      this.wrapper.className = 'm29-overscroll-edge-container m29-overscroll-edge-container--main';
    } else if (this.isPanel) {
      this.wrapper.className = 'm29-overscroll-edge-container m29-overscroll-edge-container--panel';
    } else {
      this.wrapper.className = `m29-overscroll-edge-container ${this.isWindow ? 'm29-overscroll-edge-container--fixed' : ''}`;
    }

    // 创建四向 SVG 弧线穹顶
    ['top', 'bottom', 'left', 'right'].forEach((dir) => {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', `m29-overscroll-edge-arc m29-overscroll-edge-arc--${dir}`);
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

    if (this.isWindow || this.isMain) {
      document.body.appendChild(this.wrapper);
    } else {
      if (getComputedStyle(this.container).position === 'static') {
        this.container.style.position = 'relative';
      }
      this.container.appendChild(this.wrapper);
    }
  }

  updatePathD(pathEl, dir, displacement = 0.5) {
    const dClamped = Math.max(0.05, Math.min(0.95, displacement));
    
    if (dir === 'bottom') {
      const ctrlX = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      const ctrl1X = Math.max(80, Math.min(920, ctrlX - 250));
      const ctrl2X = Math.max(80, Math.min(920, ctrlX + 250));
      pathEl.setAttribute('d', `M 0 100 C ${ctrl1X} -20, ${ctrl2X} -20, 1000 100 Z`);
    } else if (dir === 'top') {
      const ctrlX = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      const ctrl1X = Math.max(80, Math.min(920, ctrlX - 250));
      const ctrl2X = Math.max(80, Math.min(920, ctrlX + 250));
      pathEl.setAttribute('d', `M 0 0 C ${ctrl1X} 120, ${ctrl2X} 120, 1000 0 Z`);
    } else if (dir === 'left') {
      const ctrlY = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      const ctrl1Y = Math.max(80, Math.min(920, ctrlY - 250));
      const ctrl2Y = Math.max(80, Math.min(920, ctrlY + 250));
      pathEl.setAttribute('d', `M 0 0 C 120 ${ctrl1Y}, 120 ${ctrl2Y}, 0 1000 Z`);
    } else if (dir === 'right') {
      const ctrlY = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
      const ctrl1Y = Math.max(80, Math.min(920, ctrlY - 250));
      const ctrl2Y = Math.max(80, Math.min(920, ctrlY + 250));
      pathEl.setAttribute('d', `M 100 0 C -20 ${ctrl1Y}, -20 ${ctrl2Y}, 100 1000 Z`);
    }
  }

  getDimensions() {
    const rect = this.container ? this.container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const w = this.isMain ? rect.width : (this.container && this.container.clientWidth ? this.container.clientWidth : (rect.width || window.innerWidth));
    const h = this.isMain ? window.innerHeight : (this.container && this.container.clientHeight ? this.container.clientHeight : (rect.height || window.innerHeight));
    return { w, h, rect };
  }

  /**
   * 物理状态机: onPull
   * @param {string} dir 'top' | 'bottom' | 'left' | 'right'
   * @param {number} delta 拉动距离 (像素或比例)
   * @param {number} displacement 触摸偏置 (0.0 ~ 1.0)
   */
  onPull(dir, delta, displacement = 0.5) {
    const arc = this.arcs[dir];
    const path = this.paths[dir];
    if (!arc || !path) return;

    if (this.recedeTimers[dir]) {
      clearTimeout(this.recedeTimers[dir]);
      this.recedeTimers[dir] = null;
    }
    arc.classList.remove('is-receding');

    this.updatePathD(path, dir, displacement);

    const { w, h } = this.getDimensions();
    const isVertical = dir === 'top' || dir === 'bottom';
    const containerDim = isVertical ? w : h;

    // 🌟 核心规范：
    // 上下垂直临界：21% 宽度 ~ 29% 宽度曲线，倍率为 距离 x 12%
    // 左右水平临界：8% 高度 ~ 12% 高度曲线，倍率为 距离 x 3%
    const minDim = isVertical ? 280 : 300;
    const maxDim = isVertical ? 1200 : 1000;
    const t = Math.max(0, Math.min(1, (containerDim - minDim) / (maxDim - minDim)));
    const smoothT = t * t * (3 - 2 * t);

    const MAX_SCALE = isVertical ? (0.29 - 0.08 * smoothT) : (0.12 - 0.04 * smoothT);
    const MID_RATE = isVertical ? 0.12 : 0.03;

    const pull = Math.abs(delta);
    const normalizedPull = pull / 300; // 🌟 触摸移动距离增加到 3 倍
    const scale = Math.min(MAX_SCALE, MAX_SCALE * Math.tanh((normalizedPull * MID_RATE) / MAX_SCALE));
    const opacity = Math.min(0.28, Math.max(0.06, 0.06 + (scale / MAX_SCALE) * 0.18));

    arc.style.transition = 'none';
    if (isVertical) {
      // 🌟 上下水波纹高度按宽度计算
      const currentHeight = Math.round(w * scale);
      arc.style.height = `${currentHeight}px`;
    } else {
      // 🌟 左右水波纹宽度按高度计算 (8% ~ 12% 高度)
      const currentWidth = Math.round(h * scale);
      arc.style.width = `${currentWidth}px`;
    }

    arc.style.opacity = opacity.toString();
    this.isPulling[dir] = true;
  }

  /**
   * 物理状态机: onRelease
   * 用户手指离开屏幕时平滑收回，带有回弹阻尼
   */
  onRelease(dir) {
    const arc = this.arcs[dir];
    if (!arc || !this.isPulling[dir]) return;

    this.isPulling[dir] = false;
    clearTimeout(this.recedeTimers[dir]);
    arc.classList.add('is-receding');

    const isVertical = dir === 'top' || dir === 'bottom';
    arc.style.transition = isVertical
      ? 'height 0.48s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.48s cubic-bezier(0.2, 0.8, 0.25, 1)'
      : 'width 0.48s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.48s cubic-bezier(0.2, 0.8, 0.25, 1)';
    
    if (isVertical) {
      arc.style.height = '0px';
    } else {
      arc.style.width = '0px';
    }
    arc.style.opacity = '0';

    this.recedeTimers[dir] = setTimeout(() => {
      arc.classList.remove('is-receding');
    }, 480);
  }

  /**
   * 物理状态机: onAbsorb (惯性飞射与鼠标滚轮撞击边缘)
   * @param {string} dir
   * @param {number} velocity
   * @param {number} displacement
   */
  onAbsorb(dir, velocity = 80, displacement = 0.5) {
    const arc = this.arcs[dir];
    const path = this.paths[dir];
    if (!arc || !path) return;

    if (this.recedeTimers[dir]) {
      clearTimeout(this.recedeTimers[dir]);
    }
    arc.classList.remove('is-receding');

    this.updatePathD(path, dir, displacement);

    const { w, h } = this.getDimensions();
    const isVertical = dir === 'top' || dir === 'bottom';
    const containerDim = isVertical ? w : h;

    // 🌟 鼠标滚轮/惯性冲击：
    // 上下：12% 宽度 ~ 16% 宽度曲线 (倍率 12%)
    // 左右：6% 高度 ~ 8% 高度曲线 (倍率 3%)
    const minDim = isVertical ? 280 : 300;
    const maxDim = isVertical ? 1200 : 1000;
    const t = Math.max(0, Math.min(1, (containerDim - minDim) / (maxDim - minDim)));
    const smoothT = t * t * (3 - 2 * t);

    const WHEEL_MAX_SCALE = isVertical ? (0.16 - 0.04 * smoothT) : (0.08 - 0.02 * smoothT);
    const MID_RATE = isVertical ? 0.12 : 0.03;

    const v = Math.abs(velocity);
    const normalizedV = v / 80;
    const peakScale = Math.min(WHEEL_MAX_SCALE, Math.max(0.03, WHEEL_MAX_SCALE * Math.tanh((normalizedV * MID_RATE * 1.5) / WHEEL_MAX_SCALE)));
    const peakOpacity = Math.min(0.24, Math.max(0.06, 0.06 + (peakScale / WHEEL_MAX_SCALE) * 0.16));

    arc.style.transition = isVertical
      ? 'height 0.14s cubic-bezier(0, 0, 0.2, 1), opacity 0.14s ease-out'
      : 'width 0.14s cubic-bezier(0, 0, 0.2, 1), opacity 0.14s ease-out';
    
    if (isVertical) {
      const peakHeight = Math.round(w * peakScale);
      arc.style.height = `${peakHeight}px`;
    } else {
      const peakWidth = Math.round(h * peakScale);
      arc.style.width = `${peakWidth}px`;
    }
    arc.style.opacity = peakOpacity.toString();

    // 撞击保持 140ms 后平滑释放回弹
    this.recedeTimers[dir] = setTimeout(() => {
      arc.style.transition = isVertical
        ? 'height 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.5s cubic-bezier(0.2, 0.8, 0.25, 1)'
        : 'width 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.5s cubic-bezier(0.2, 0.8, 0.25, 1)';
      if (isVertical) {
        arc.style.height = '0px';
      } else {
        arc.style.width = '0px';
      }
      arc.style.opacity = '0';
    }, 150);
  }

  bindEvents() {
    const target = this.isWindow ? window : this.container;

    // 1. 触摸手势精确跟踪 (Touch Over-Scroll)
    target.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    target.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const diffY = currentY - this.touchStartY;
      const diffX = currentX - this.touchStartX;

      const scrollTop = this.isWindow ? (window.pageYOffset || document.documentElement.scrollTop) : this.container.scrollTop;
      const scrollHeight = this.isWindow ? document.documentElement.scrollHeight : this.container.scrollHeight;
      const clientHeight = this.isWindow ? window.innerHeight : this.container.clientHeight;

      const scrollLeft = this.isWindow ? (window.pageXOffset || document.documentElement.scrollLeft) : this.container.scrollLeft;
      const scrollWidth = this.isWindow ? document.documentElement.scrollWidth : this.container.scrollWidth;
      const clientWidth = this.isWindow ? window.innerWidth : this.container.clientWidth;

      // 顶部越界下拉
      if (scrollTop <= 0 && diffY > 0) {
        const delta = diffY / (clientHeight * 0.7);
        const displacement = currentX / (clientWidth || 1);
        this.onPull('top', delta, displacement);
      } else if (this.isPulling.top && diffY <= 0) {
        this.onRelease('top');
      }

      // 底部越界上拉
      const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 1.5);
      if (isAtBottom && diffY < 0) {
        const delta = Math.abs(diffY) / (clientHeight * 0.7);
        const displacement = currentX / (clientWidth || 1);
        this.onPull('bottom', delta, displacement);
      } else if (this.isPulling.bottom && diffY >= 0) {
        this.onRelease('bottom');
      }

      // 左侧越界向右拉
      if (scrollLeft <= 0 && diffX > 0) {
        const delta = diffX / (clientWidth * 0.7);
        const displacement = currentY / (clientHeight || 1);
        this.onPull('left', delta, displacement);
      } else if (this.isPulling.left && diffX <= 0) {
        this.onRelease('left');
      }

      // 右侧越界向左拉
      const isAtRight = (scrollLeft + clientWidth) >= (scrollWidth - 1.5);
      if (isAtRight && diffX < 0) {
        const delta = Math.abs(diffX) / (clientWidth * 0.7);
        const displacement = currentY / (clientHeight || 1);
        this.onPull('right', delta, displacement);
      } else if (this.isPulling.right && diffX >= 0) {
        this.onRelease('right');
      }
    }, { passive: true });

    const handleTouchEnd = () => {
      ['top', 'bottom', 'left', 'right'].forEach(dir => {
        if (this.isPulling[dir]) {
          this.onRelease(dir);
        }
      });
    };

    target.addEventListener('touchend', handleTouchEnd, { passive: true });
    target.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // 2. 鼠标滚轮撞击边缘 (Wheel / Trackpad Over-Scroll)
    let wheelTimer = null;
    let accumulatedWheelY = 0;
    let accumulatedWheelX = 0;

    target.addEventListener('wheel', (e) => {
      const scrollTop = this.isWindow ? (window.pageYOffset || document.documentElement.scrollTop) : this.container.scrollTop;
      const scrollHeight = this.isWindow ? document.documentElement.scrollHeight : this.container.scrollHeight;
      const clientHeight = this.isWindow ? window.innerHeight : this.container.clientHeight;

      const scrollLeft = this.isWindow ? (window.pageXOffset || document.documentElement.scrollLeft) : this.container.scrollLeft;
      const scrollWidth = this.isWindow ? document.documentElement.scrollWidth : this.container.scrollWidth;
      const clientWidth = this.isWindow ? window.innerWidth : this.container.clientWidth;

      // 向上滚动触顶
      if (scrollTop <= 0 && e.deltaY < 0) {
        accumulatedWheelY += Math.abs(e.deltaY);
        const delta = Math.min(1.0, accumulatedWheelY / 320);
        const displacement = e.clientX ? (e.clientX / clientWidth) : 0.5;
        this.onPull('top', delta, displacement);
      }

      // 向下滚动触底
      const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 1.5);
      if (isAtBottom && e.deltaY > 0) {
        accumulatedWheelY += Math.abs(e.deltaY);
        const delta = Math.min(1.0, accumulatedWheelY / 320);
        const displacement = e.clientX ? (e.clientX / clientWidth) : 0.5;
        this.onPull('bottom', delta, displacement);
      }

      // 向左滚动触界
      if (scrollLeft <= 0 && e.deltaX < 0) {
        accumulatedWheelX += Math.abs(e.deltaX);
        const delta = Math.min(1.0, accumulatedWheelX / 320);
        const displacement = e.clientY ? (e.clientY / clientHeight) : 0.5;
        this.onPull('left', delta, displacement);
      }

      // 向右滚动触界
      const isAtRight = (scrollLeft + clientWidth) >= (scrollWidth - 1.5);
      if (isAtRight && e.deltaX > 0) {
        accumulatedWheelX += Math.abs(e.deltaX);
        const delta = Math.min(1.0, accumulatedWheelX / 320);
        const displacement = e.clientY ? (e.clientY / clientHeight) : 0.5;
        this.onPull('right', delta, displacement);
      }

      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        ['top', 'bottom', 'left', 'right'].forEach(dir => this.onRelease(dir));
        accumulatedWheelY = 0;
        accumulatedWheelX = 0;
      }, 100);
    }, { passive: true });
  }
}

/**
 * 全局智能滚动容器托管器
 * 自动识别并为页面内所有溢出滚动容器注入 EdgeEffect 扁平弧
 */
export class M29FlatEdgeEffectManager {
  constructor() {
    this.containerMap = new WeakMap();
    this.initWindow();
    this.observeDynamicContainers();
  }

  initWindow() {
    new M29FlatEdgeEffect(null);
  }

  observeDynamicContainers() {
    // 监听全局 wheel 捕获所有可滚动容器
    window.addEventListener('wheel', (e) => {
      const scrollable = this.findScrollable(e.target);
      if (scrollable && scrollable !== document.body && scrollable !== document.documentElement) {
        let effect = this.containerMap.get(scrollable);
        if (!effect) {
          effect = new M29FlatEdgeEffect(scrollable);
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
          effect = new M29FlatEdgeEffect(scrollable);
          this.containerMap.set(scrollable, effect);
        }
      }
    }, { passive: true, capture: true });
  }

  findScrollable(target) {
    let el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.classList && el.classList.contains('m29-overscroll-edge-container')) {
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
  if (container) return new M29FlatEdgeEffect(container);
  return new M29FlatEdgeEffectManager();
}

// 统一命名与别名导出
export const M29EdgeEffect = M29FlatEdgeEffect;
export const M29EdgeEffectManager = M29FlatEdgeEffectManager;
export const M29OverscrollRipple = M29FlatEdgeEffect;
export const M29OverscrollGlow = M29FlatEdgeEffect;
export const attachEdgeEffect = attachFlatEdgeEffect;
export const attachOverscrollRipple = attachFlatEdgeEffect;
export const attachOverscrollGlow = attachFlatEdgeEffect;

// 保持向后兼容导出
export const MduiFlatEdgeEffect = M29FlatEdgeEffect;
export const MduiFlatEdgeEffectManager = M29FlatEdgeEffectManager;
export const MduiEdgeEffect = M29FlatEdgeEffect;
export const MduiEdgeEffectManager = M29FlatEdgeEffectManager;
export const MduiOverscrollRipple = M29FlatEdgeEffect;
export const MduiOverscrollGlow = M29FlatEdgeEffect;
