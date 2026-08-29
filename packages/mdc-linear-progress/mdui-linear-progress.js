/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * 线性进度条控制器
 */
export class MduiLinearProgress {
  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.root = root;
    this.determinateBar = root.querySelector('.mdui-progress-determinate');
  }

  /**
   * 设置确定型进度条百分比 (0~100)
   * @param {number} percent
   */
  setProgress(percent) {
    if (this.determinateBar) {
      this.determinateBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  }

  /**
   * 设为不确定动画模式
   */
  setIndeterminate() {
    if (this.determinateBar) {
      this.determinateBar.style.display = 'none';
    }
    let indet = this.root.querySelector('.mdui-progress-indeterminate');
    if (!indet) {
      indet = document.createElement('div');
      indet.className = 'mdui-progress-indeterminate';
      this.root.appendChild(indet);
    }
    indet.style.display = 'block';
  }

  static attachTo(root) {
    return new MduiLinearProgress(root);
  }
}
