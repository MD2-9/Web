/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Material 核心动态水波纹涟漪发生器 (速率已调慢 3/5，支持高精度目标定位与 0.12s 最小留存时间)
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

  const startTime = Date.now();
  const MIN_HOLD_TIME = 120; // 🌟 严格提供 0.12s (120ms) 单点留存时间

  function removeRipple() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_HOLD_TIME - elapsed);

    setTimeout(() => {
      wave.classList.add('is-fading');
      setTimeout(() => {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
      }, 850);
    }, remaining);

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
  const INNER_INTERACTIVE_SELECTOR = '.mdc-button, button, .mdc-icon-button, .segmented-button, .surface-token-chip, .theme-tile, .rail-nav-item, .preview-img-box, .expansion-header, .md1-tab-item, .mdc-fab';
  const CARD_CONTAINER_SELECTOR = '.demo-card, .mdc-card, [data-mdui-ripple]';

  window.addEventListener('pointerdown', (e) => {
    // 1. 如果点击了复选框、单选框、滑块等原生 input 控件或 Tab 内容区，不触发水波纹
    if (e.target.closest('input, select, textarea, .md1-slider, .md1-switch, .md1-tab-content-container, .md1-tab-panel')) {
      return;
    }

    // 2. 检查是否点击了内部精准交互元素
    const innerTarget = e.target.closest(INNER_INTERACTIVE_SELECTOR);
    if (innerTarget) {
      const btn = innerTarget.closest('.mdc-button, button');
      if (btn) {
        createRipple(e, btn);
        return;
      }
      createRipple(e, innerTarget);
      return;
    }

    // 3. 点击卡片空白区域时，触发卡片整体浅淡水波纹
    const cardTarget = e.target.closest(CARD_CONTAINER_SELECTOR);
    if (cardTarget) {
      createRipple(e, cardTarget);
    }
  });
}
