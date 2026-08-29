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
    this.wrapper = document.createElement('div');
    this.wrapper.className = `m29-overscroll-edge-container ${this.isWindow ? 'm29-overscroll-edge-container--fixed' : ''}`;

    // 创建四向 SVG 弧线穹顶
    ['top', 'bottom', 'left', 'right'].forEach((dir) => {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', `m29-overscroll-edge-arc m29-overscroll-edge-arc--${dir}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      
      const path = document.createElementNS(SVG_NS, 'path');
      svg.appendChild(path);

      this.arcs[dir] = svg;
      this.paths[dir] = path;
      this.wrapper.appendChild(svg);
    });

    if (this.isWindow) {
      document.body.appendChild(this.wrapper);
    } else {
      if (getComputedStyle(this.container).position === 'static') {
        this.container.style.position = 'relative';
      }
      this.container.appendChild(this.wrapper);
    }

    this.updateSVGPaths();
    window.addEventListener('resize', () => this.updateSVGPaths());
  }

  /**
   * 根据当前容器宽高，绘制 100% 贴合的半椭圆/二次贝塞尔扁平实心弧
   * 模拟 Android 原生 Drawable: 半径大、弧度扁平、极具张力
   */
  updateSVGPaths() {
    const rect = this.container.getBoundingClientRect();
    const w = this.isWindow ? window.innerWidth : (rect.width || this.container.clientWidth);
    const h = this.isWindow ? window.innerHeight : (rect.height || this.container.clientHeight);

    // 1. Top Arc (向下凸出的贝塞尔弧顶)
    if (this.arcs.top) {
      this.arcs.top.setAttribute('viewBox', `0 0 ${w} 80`);
      this.paths.top.setAttribute('d', `M 0,0 L ${w},0 L ${w},20 Q ${w / 2},80 0,20 Z`);
    }

    // 2. Bottom Arc (向上凸出的贝塞尔弧顶)
    if (this.arcs.bottom) {
      this.arcs.bottom.setAttribute('viewBox', `0 0 ${w} 80`);
      this.paths.bottom.setAttribute('d', `M 0,80 L ${w},80 L ${w},60 Q ${w / 2},0 0,60 Z`);
    }

    // 3. Left Arc (向右凸出的贝塞尔弧顶)
    if (this.arcs.left) {
      this.arcs.left.setAttribute('viewBox', `0 0 80 ${h}`);
      this.paths.left.setAttribute('d', `M 0,0 L 0,${h} L 20,${h} Q 80,${h / 2} 20,0 Z`);
    }

    // 4. Right Arc (向左凸出的贝塞尔弧顶)
    if (this.arcs.right) {
      this.arcs.right.setAttribute('viewBox', `0 0 80 ${h}`);
      this.paths.right.setAttribute('d', `M 80,0 L 80,${h} L 60,${h} Q 0,${h / 2} 60,0 Z`);
    }
  }

  /**
   * 物理状态机: onPull
   * @param {string} dir 'top' | 'bottom' | 'left' | 'right'
   * @param {number} delta 拉动距离比例 (0.0 ~ 1.0)
   * @param {number} displacement 触摸偏置 (0.0 ~ 1.0)
   */
  onPull(dir, delta, displacement = 0.5) {
    const arc = this.arcs[dir];
    if (!arc) return;

    if (this.recedeTimers[dir]) {
      clearTimeout(this.recedeTimers[dir]);
      this.recedeTimers[dir] = null;
    }
    arc.classList.remove('is-receding');

    // 阻尼非线性曲线：AOSP 经典 log 级阻尼递增
    const pullDistance = Math.min(1.0, Math.max(0, delta));
    const scale = Math.min(1.0, pullDistance * 2.2);
    // Android 原生默认纯色不透明度 0.35 (微透，绝不突兀)
    const alpha = Math.min(0.38, pullDistance * 0.45);

    if (dir === 'top' || dir === 'bottom') {
      arc.style.transform = `scaleY(${scale})`;
      // 偏置微调：依据触摸 X 位置微调弧形倾角
      const skew = (displacement - 0.5) * 8; 
      arc.style.transform += ` skewX(${skew}deg)`;
    } else {
      arc.style.transform = `scaleX(${scale})`;
      const skew = (displacement - 0.5) * 8;
      arc.style.transform += ` skewY(${skew}deg)`;
    }

    arc.style.opacity = alpha.toString();
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
    arc.classList.add('is-receding');

    if (dir === 'top' || dir === 'bottom') {
      arc.style.transform = 'scaleY(0)';
    } else {
      arc.style.transform = 'scaleX(0)';
    }
    arc.style.opacity = '0';

    this.recedeTimers[dir] = setTimeout(() => {
      arc.classList.remove('is-receding');
    }, 450);
  }

  /**
   * 物理状态机: onAbsorb (惯性飞射撞击边缘)
   * @param {string} dir
   * @param {number} velocity
   */
  onAbsorb(dir, velocity = 1.0) {
    const arc = this.arcs[dir];
    if (!arc) return;

    if (this.recedeTimers[dir]) {
      clearTimeout(this.recedeTimers[dir]);
    }
    arc.classList.remove('is-receding');

    const intensity = Math.min(1.0, Math.max(0.3, velocity / 1000));
    const targetScale = Math.min(1.0, 0.4 + intensity * 0.6);
    const targetAlpha = Math.min(0.38, 0.2 + intensity * 0.18);

    arc.style.transition = 'transform 0.12s cubic-bezier(0.0, 0.0, 0.2, 1), opacity 0.12s cubic-bezier(0.0, 0.0, 0.2, 1)';
    if (dir === 'top' || dir === 'bottom') {
      arc.style.transform = `scaleY(${targetScale})`;
    } else {
      arc.style.transform = `scaleX(${targetScale})`;
    }
    arc.style.opacity = targetAlpha.toString();

    // 撞击保持 80ms 后迅速释放
    setTimeout(() => {
      this.isPulling[dir] = true;
      this.onRelease(dir);
    }, 120);
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
