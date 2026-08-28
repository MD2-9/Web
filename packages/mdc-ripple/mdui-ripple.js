/**
 * @license
 * Copyright 2026 unjal <unjal29@outlook.com>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Material 核心动态水波纹涟漪发生器 (速率已调慢 3/5，支持高精度目标定位)
 * @param {PointerEvent|MouseEvent|TouchEvent} e
 * @param {HTMLElement} container
 */
export function createRipple(e, container) {
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
  const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  // 计算覆盖当前目标容器所需的最大圆半径
  const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

  const wave = document.createElement('div');
  wave.className = 'mdui-ripple-wave';
  wave.style.width = `${radius * 2}px`;
  wave.style.height = `${radius * 2}px`;
  wave.style.left = `${x - radius}px`;
  wave.style.top = `${y - radius}px`;

  container.appendChild(wave);

  requestAnimationFrame(() => {
    wave.classList.add('is-active');
  });

  function removeRipple() {
    wave.classList.add('is-fading');
    setTimeout(() => {
      if (wave.parentNode) wave.parentNode.removeChild(wave);
    }, 850);
    window.removeEventListener('pointerup', removeRipple);
    window.removeEventListener('pointercancel', removeRipple);
  }

  window.addEventListener('pointerup', removeRipple, { once: true });
  window.addEventListener('pointercancel', removeRipple, { once: true });
  setTimeout(removeRipple, 2400);
}

/**
 * 全局统一精确水波纹委托绑定器
 * 优先响应最近子交互元素（如按钮、标签），点击卡片空白区才作用于卡片自身，绝不向上重叠触发
 */
export function attachRipples() {
  const RIPPLE_SELECTOR = '.mdc-button, button, .mdc-icon-button, .segmented-button, .surface-token-chip, .theme-tile, .rail-nav-item, .preview-img-box, .expansion-header';

  window.addEventListener('pointerdown', (e) => {
    // 忽略表单输入框、单选、复选、滑块本身
    if (e.target.closest('input, select, textarea, .md1-slider, .md1-switch, .mdc-checkbox, .mdc-radio')) {
      return;
    }

    // 查找当前点击坐标下最近的涟漪目标容器（按钮优先于卡片）
    const target = e.target.closest(RIPPLE_SELECTOR);
    if (!target) return;

    createRipple(e, target);
  });
}
