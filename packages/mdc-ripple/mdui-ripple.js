/**
 * @license
 * Copyright 2026 unjal <unjal29@outlook.com>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Material 核心动态水波纹涟漪发生器
 * @param {PointerEvent|MouseEvent|TouchEvent} e
 * @param {HTMLElement} container
 */
export function createRipple(e, container) {
  if (!container) return;
  // 忽略直接点击在表单控件或原生按钮内部
  if (e.target && e.target.closest('input, select, textarea, .md1-slider, .md1-switch, .mdc-button, button, a')) {
    return;
  }
  const rect = container.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
  const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);

  const x = clientX - rect.left;
  const y = clientY - rect.top;

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
    }, 450);
    window.removeEventListener('pointerup', removeRipple);
    window.removeEventListener('pointercancel', removeRipple);
  }

  window.addEventListener('pointerup', removeRipple, { once: true });
  window.addEventListener('pointercancel', removeRipple, { once: true });
  setTimeout(removeRipple, 1200);
}

/**
 * 自动为指定选择器容器绑定水波纹
 * @param {string} selector
 */
export function attachRipples(selector = '.demo-card, .preview-img-box, .secondary-overlay-panel .rail-nav-item, .theme-tile, .expansion-panel, .surface-token-chip') {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('pointerdown', (e) => createRipple(e, el));
  });
}
