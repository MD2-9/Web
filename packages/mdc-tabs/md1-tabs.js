/**
 * @license
 * Copyright 2026 unjal <unjal29@outlook.com>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * MD1 选项卡系统控制器 (Sliding Indicator ✖ 方向感知平滑切换 ✖ 目标Tab为起点扩散至全内容水波纹)
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
   * 切换到指定 Tab 索引并以目标 Tab 为原点在内容容器内扩散水波纹
   * @param {number} index
   * @param {Event|HTMLElement} [eventOrElement]
   */
  switchTo(index, eventOrElement) {
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
    this.triggerTabContentRipple(tab, index, isSlideRight);
  }

  triggerTabContentRipple(tabElement, index, isSlideRight = true) {
    const activePanel = this.panels[index];
    if (!activePanel || !tabElement) return;

    const contentContainer = activePanel.closest('.md1-tab-content-container') || activePanel.parentElement;
    if (!contentContainer) return;

    if (window.getComputedStyle(contentContainer).position === 'static') {
      contentContainer.style.position = 'relative';
    }
    contentContainer.style.overflow = 'hidden';

    const tabRect = tabElement.getBoundingClientRect();
    const containerRect = contentContainer.getBoundingClientRect();
    const originX = (tabRect.left + tabRect.width / 2) - containerRect.left;
    const originY = 0;

    const maxRadius = Math.hypot(
      Math.max(originX, containerRect.width - originX),
      containerRect.height
    ) * 1.05;

    const wave = document.createElement('div');
    wave.className = `md1-tab-content-ripple ${isSlideRight ? 'slide-right' : 'slide-left'}`;
    wave.style.width = `${maxRadius * 2}px`;
    wave.style.height = `${maxRadius * 2}px`;
    wave.style.left = `${originX}px`;
    wave.style.top = `${originY}px`;
    contentContainer.appendChild(wave);

    setTimeout(() => {
      if (wave.parentNode) wave.parentNode.removeChild(wave);
    }, 650);
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
