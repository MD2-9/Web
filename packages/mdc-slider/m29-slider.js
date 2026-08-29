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
 * Discrete slider interaction and teardrop pin concept adapted and inspired by MDUI
 * (https://github.com/zdhxiong/mdui), Copyright (c) 2016-2021 zdhxiong (MIT License).
 */

/**
 * M29 经典离散滑块控制器 (Teardrop Pin Discrete Slider)
 */
export class M29Slider {
  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.root = root;
    this.input = root.querySelector('input[type="range"]');
    this.fill = root.querySelector('.m29-slider-fill');
    this.thumbWrapper = root.querySelector('.m29-slider-thumb-wrapper');
    this.pinText = root.querySelector('.m29-slider-thumb span');
    this.valueDisplay = root.parentElement ? root.parentElement.querySelector('#slider-val') : null;

    if (this.input) {
      this.init();
    }
  }

  init() {
    const update = (val) => {
      const min = parseInt(this.input.min, 10) || 0;
      const max = parseInt(this.input.max, 10) || 100;
      const percent = ((val - min) / (max - min)) * 100;

      if (this.fill) this.fill.style.width = `${percent}%`;
      if (this.thumbWrapper) this.thumbWrapper.style.left = `${percent}%`;
      if (this.pinText) this.pinText.textContent = val;
      if (this.valueDisplay) this.valueDisplay.textContent = `Tone ${val}`;
    };

    this.input.addEventListener('input', (e) => update(e.target.value));
    this.input.addEventListener('focus', () => this.root.classList.add('is-active'));
    this.input.addEventListener('blur', () => this.root.classList.remove('is-active'));
    this.input.addEventListener('mousedown', () => this.root.classList.add('is-active'));
    window.addEventListener('mouseup', () => this.root.classList.remove('is-active'));
    this.input.addEventListener('touchstart', () => this.root.classList.add('is-active'), { passive: true });
    window.addEventListener('touchend', () => this.root.classList.remove('is-active'), { passive: true });

    update(this.input.value);
  }

  static attachTo(root) {
    return new M29Slider(root);
  }

  static initAll(selector = '.m29-slider') {
    return Array.from(document.querySelectorAll(selector)).map(el => new M29Slider(el));
  }
}

// 保持向后兼容导出
export const Md1Slider = M29Slider;
