/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Acknowledgment & Attribution:
 * Dynamic ripple interaction concept inspired by MDUI
 * (https://github.com/zdhxiong/mdui), Copyright (c) 2016-2021 zdhxiong (MIT License).
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
  wave.className = 'm29-ripple-wave';
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
  const startPointerX = clientX;
  const startPointerY = clientY;

  function onPointerMove(moveEvent) {
    const moveX = moveEvent.clientX !== undefined ? moveEvent.clientX : (moveEvent.touches && moveEvent.touches[0] ? moveEvent.touches[0].clientX : startPointerX);
    const moveY = moveEvent.clientY !== undefined ? moveEvent.clientY : (moveEvent.touches && moveEvent.touches[0] ? moveEvent.touches[0].clientY : startPointerY);
    const dist = Math.hypot(moveX - startPointerX, moveY - startPointerY);
    const hasSelection = typeof window.getSelection === 'function' && window.getSelection().toString().trim().length > 0;
    // 🌟 选中文本或拖拽时立即取消水波纹，保持纯净文本选择体验
    if (dist > 8 || hasSelection) {
      wave.classList.add('is-fading');
      setTimeout(() => {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
      }, 200);
      cleanup();
    }
  }

  function cleanup() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', removeRipple);
    window.removeEventListener('pointercancel', removeRipple);
  }

  function removeRipple() {
    cleanup();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_HOLD_TIME - elapsed);

    setTimeout(() => {
      wave.classList.add('is-fading');
      setTimeout(() => {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
      }, 850);
    }, remaining);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', removeRipple, { once: true });
  window.addEventListener('pointercancel', removeRipple, { once: true });
  setTimeout(removeRipple, 2400);
}

/**
 * 全局统一精确水波纹委托绑定器
 * 优先响应最近子交互元素（如按钮、标签），点击卡片空白区才作用于卡片自身，绝不向上重叠触发
 */
export function attachRipples() {
  const INNER_INTERACTIVE_SELECTOR = [
    '.mdc-list-item',
    '.rail-nav-item',
    '.mobile-drawer-nav-item',
    '.m29-segmented-button',
    '.segmented-button',
    '.surface-token-chip',
    '.mdc-chip',
    '.theme-tile',
    '.theme-swatch',
    '.preview-img-box',
    '.m29-expansion-header',
    '.expansion-header',
    '.m29-tab-item',
    '.mdc-button',
    'button',
    '.mdc-icon-button',
    '.mdc-fab',
    '.mdc-card__action',
    '.mdc-card__primary-action'
  ].join(',');
  const CARD_CONTAINER_SELECTOR = '.demo-card, .mdc-card, [data-m29-ripple], [data-mdui-ripple]';

  window.addEventListener('pointerdown', (e) => {
    // 0. 如果当前已有正在选中的文本，不触发水波纹
    if (typeof window.getSelection === 'function' && window.getSelection().toString().trim().length > 0) {
      return;
    }

    // 1. 如果点击了复选框、单选框、滑块等原生 input 控件或 Tab 内容区，不触发水波纹
    if (e.target.closest('input, select, textarea, .m29-slider, .m29-switch, .m29-tab-content-container, .m29-tab-panel')) {
      return;
    }

    // 2. 检查是否点击了内部精准交互元素 (如列表项、按钮、标签等)
    const innerTarget = e.target.closest(INNER_INTERACTIVE_SELECTOR);
    if (innerTarget) {
      // 🌟 精准目标隔离：水波纹仅在被点击的列表项或按钮自身内部扩散，绝不向上波及到父容器或卡片！
      createRipple(e, innerTarget);
      return;
    }

    // 3. 点击卡片空白区域时，水波纹仅在卡片背景底层 (z-index: 0) 扩散，被卡片内部元素自然遮挡
    const cardTarget = e.target.closest(CARD_CONTAINER_SELECTOR);
    if (cardTarget) {
      createRipple(e, cardTarget);
    }
  });
}
