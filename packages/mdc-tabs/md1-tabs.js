/**
 * @license
 * Copyright 2026 unjal <unjal29@outlook.com>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * MD1 选项卡系统控制器 (Sliding Indicator ✖ 方向感知平滑切换)
 */
export class Md1Tabs {
  /**
   * @param {HTMLElement} barContainer
   * @param {HTMLElement} [panelsContainer]
   */
  constructor(barContainer, panelsContainer = document) {
    this.bar = barContainer;
    this.container = panelsContainer;
    this.tabs = Array.from(this.bar.querySelectorAll('.md1-tab-item'));
    this.panels = Array.from(this.container.querySelectorAll('.md1-tab-panel'));
    this.indicator = this.bar.querySelector('.md1-tab-indicator');
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
   * 切换到指定 Tab 索引
   * @param {number} index
   * @param {Event} [e]
   */
  switchTo(index, e) {
    if (index < 0 || index >= this.tabs.length) return;

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

  static attachTo(barElement, panelsContainer) {
    return new Md1Tabs(barElement, panelsContainer);
  }
}
