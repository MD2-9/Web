/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * 手风琴折叠面板控制器
 */
export class MdcExpansionPanel {
  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.root = root;
    this.header = root.querySelector('.expansion-header');
    this.body = root.querySelector('.expansion-body');

    if (this.header) {
      this.header.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.root.classList.toggle('is-open');
  }

  open() {
    this.root.classList.add('is-open');
  }

  close() {
    this.root.classList.remove('is-open');
  }

  static attachTo(root) {
    return new MdcExpansionPanel(root);
  }

  static initAll(selector = '.expansion-panel') {
    return Array.from(document.querySelectorAll(selector)).map(el => new MdcExpansionPanel(el));
  }
}
