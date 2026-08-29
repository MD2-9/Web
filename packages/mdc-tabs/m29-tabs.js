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
 * Direction-aware sliding tab transitions adapted and inspired by MDUI
 * (https://github.com/zdhxiong/mdui), Copyright (c) 2016-2021 zdhxiong (MIT License).
 */

/**
 * M29 选项卡系统控制器 (Sliding Indicator ✖ 跟随滑块方向平滑切换)
 */
export class M29Tabs {
  /**
   * @param {HTMLElement} barContainer
   * @param {HTMLElement} [panelsContainer]
   */
  constructor(barContainer, panelsContainer = document) {
    this.bar = barContainer;
    this.container = panelsContainer;
    this.tabs = Array.from(this.bar.querySelectorAll('.m29-tab-item'));
    this.panels = Array.from(this.container.querySelectorAll('.m29-tab-panel'));
    this.indicator = this.bar.querySelector('.m29-tab-indicator');
    this.currentIndex = 0;

    this.init();
  }

  init() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => this.switchTo(index, e));
    });

    this.updateIndicator(this.tabs[this.currentIndex] || this.tabs[0]);

    window.addEventListener('resize', () => {
      this.updateIndicator(this.tabs[this.currentIndex]);
    });
  }

  /**
   * 切换到指定 Tab 索引，内容动画严格跟随滑块方向
   * @param {number} index
   * @param {Event|HTMLElement} [eventOrElement]
   */
  switchTo(index, eventOrElement) {
    if (index < 0 || index >= this.tabs.length) return;

    // 滑块向右移动 (index > currentIndex) 还是向左移动 (index < currentIndex)
    const isSlideRight = index >= this.currentIndex;
    this.currentIndex = index;

    const tab = this.tabs[index];

    this.tabs.forEach((t, i) => {
      if (i === index) {
        t.classList.add('is-active');
      } else {
        t.classList.remove('is-active');
      }
    });

    this.panels.forEach((panel, i) => {
      panel.classList.remove('slide-right', 'slide-left');
      if (i === index) {
        panel.classList.add('is-active');
        if (isSlideRight) {
          panel.classList.add('slide-right');
        } else {
          panel.classList.add('slide-left');
        }
      } else {
        panel.classList.remove('is-active');
      }
    });

    this.updateIndicator(tab);
  }

  updateIndicator(tabElement) {
    if (!this.indicator || !tabElement) return;
    this.indicator.style.width = `${tabElement.offsetWidth}px`;
    this.indicator.style.left = `${tabElement.offsetLeft}px`;
  }
}

// 保持向后兼容导出
export const Md1Tabs = M29Tabs;
