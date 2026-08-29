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
 * Linear progress indicator interaction concept inspired by MDUI
 * (https://github.com/zdhxiong/mdui), Copyright (c) 2016-2021 zdhxiong (MIT License).
 */

/**
 * M29 线性进度条控制器
 */
export class M29LinearProgress {
  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.root = root;
    this.determinateBar = root.querySelector('.m29-progress-determinate');
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
    let indet = this.root.querySelector('.m29-progress-indeterminate');
    if (!indet) {
      indet = document.createElement('div');
      indet.className = 'm29-progress-indeterminate';
      this.root.appendChild(indet);
    }
    indet.style.display = 'block';
  }

  static attachTo(root) {
    return new M29LinearProgress(root);
  }
}

// 保持向后兼容导出
export const MduiLinearProgress = M29LinearProgress;
