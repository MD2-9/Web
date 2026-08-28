/**
 * @license
 * Copyright 2026 unjal <unjal29@outlook.com>
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Material 纯直角日历选择器 (MDC DatePicker)
 */
export class MdcDatePicker {
  /**
   * @param {HTMLElement} root
   * @param {Object} options
   */
  constructor(root, options = {}) {
    this.root = root;
    this.options = Object.assign({
      initialDate: new Date(),
      onSelect: null
    }, options);

    this.currentDate = new Date(this.options.initialDate);
    this.selectedDate = new Date(this.options.initialDate);
    this.yearEl = root.querySelector('.mdc-date-picker__header-year');
    this.dateEl = root.querySelector('.mdc-date-picker__header-date');
    this.monthTitleEl = root.querySelector('.mdc-date-picker__month-label');
    this.gridEl = root.querySelector('.mdc-date-picker__grid');
    this.prevBtn = root.querySelector('.mdc-date-picker__prev-btn');
    this.nextBtn = root.querySelector('.mdc-date-picker__next-btn');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    if (this.yearEl) this.yearEl.textContent = `${year} 年`;
    if (this.monthTitleEl) {
      this.monthTitleEl.textContent = `${year} 年 ${month + 1} 月`;
    }

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    if (this.dateEl) {
      const sYear = this.selectedDate.getFullYear();
      const sMonth = this.selectedDate.getMonth() + 1;
      const sDay = this.selectedDate.getDate();
      const sW = weekdays[this.selectedDate.getDay()];
      this.dateEl.textContent = `${sMonth}月${sDay}日 ${sW}`;
    }

    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // 填充上月占位空白
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'mdc-date-picker__cell is-empty';
      this.gridEl.appendChild(emptyCell);
    }

    // 填充当月日期
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement('div');
      cell.className = 'mdc-date-picker__cell';

      const isSelected = this.selectedDate.getFullYear() === year &&
                         this.selectedDate.getMonth() === month &&
                         this.selectedDate.getDate() === day;
      const isToday = today.getFullYear() === year &&
                      today.getMonth() === month &&
                      today.getDate() === day;

      if (isSelected) cell.classList.add('is-selected');
      if (isToday) cell.classList.add('is-today');

      const span = document.createElement('span');
      span.textContent = day;
      cell.appendChild(span);

      cell.addEventListener('click', () => {
        this.selectedDate = new Date(year, month, day);
        this.render();
        if (typeof this.options.onSelect === 'function') {
          this.options.onSelect(this.selectedDate);
        }
      });

      this.gridEl.appendChild(cell);
    }
  }

  static attachTo(root, options) {
    return new MdcDatePicker(root, options);
  }
}

/**
 * Material 纯正表盘时钟选择器 (MDC TimePicker)
 */
export class MdcTimePicker {
  /**
   * @param {HTMLElement} root
   * @param {Object} options
   */
  constructor(root, options = {}) {
    this.root = root;
    this.options = Object.assign({
      initialHour: 9,
      initialMinute: 30,
      isPM: false,
      onSelect: null
    }, options);

    this.mode = 'hour'; // 'hour' | 'minute'
    this.hour = this.options.initialHour;
    this.minute = this.options.initialMinute;
    this.isPM = this.options.isPM;

    this.hourBox = root.querySelector('.mdc-time-picker__digit-hour');
    this.minuteBox = root.querySelector('.mdc-time-picker__digit-minute');
    this.amBtn = root.querySelector('.mdc-time-picker__ampm-am');
    this.pmBtn = root.querySelector('.mdc-time-picker__ampm-pm');
    this.clockFace = root.querySelector('.mdc-time-picker__clock-face');
    this.clockHand = root.querySelector('.mdc-time-picker__clock-hand');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    if (this.hourBox) {
      this.hourBox.addEventListener('click', () => {
        this.mode = 'hour';
        this.render();
      });
    }
    if (this.minuteBox) {
      this.minuteBox.addEventListener('click', () => {
        this.mode = 'minute';
        this.render();
      });
    }
    if (this.amBtn) {
      this.amBtn.addEventListener('click', () => {
        this.isPM = false;
        this.render();
      });
    }
    if (this.pmBtn) {
      this.pmBtn.addEventListener('click', () => {
        this.isPM = true;
        this.render();
      });
    }
  }

  render() {
    // 渲染数字显示
    const hStr = String(this.hour).padStart(2, '0');
    const mStr = String(this.minute).padStart(2, '0');
    if (this.hourBox) {
      this.hourBox.textContent = hStr;
      this.hourBox.classList.toggle('is-active', this.mode === 'hour');
    }
    if (this.minuteBox) {
      this.minuteBox.textContent = mStr;
      this.minuteBox.classList.toggle('is-active', this.mode === 'minute');
    }
    if (this.amBtn) this.amBtn.classList.toggle('is-active', !this.isPM);
    if (this.pmBtn) this.pmBtn.classList.toggle('is-active', this.isPM);

    // 旋转指针
    if (this.clockHand) {
      const angle = this.mode === 'hour'
        ? (this.hour % 12) * 30
        : this.minute * 6;
      this.clockHand.style.transform = `rotate(${angle}deg)`;
    }

    // 渲染表盘刻度数字
    if (!this.clockFace) return;
    const oldNumbers = this.clockFace.querySelectorAll('.mdc-time-picker__number');
    oldNumbers.forEach(n => n.remove());

    const isHour = this.mode === 'hour';
    const totalSteps = 12;
    const radius = 86; // 距离表盘中心距离 (px)
    const center = 115; // 230px 表盘中心

    for (let i = 1; i <= totalSteps; i++) {
      const val = isHour ? i : (i === 12 ? 0 : i * 5);
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = center + radius * Math.cos(angle) - 16;
      const y = center + radius * Math.sin(angle) - 16;

      const numEl = document.createElement('div');
      numEl.className = 'mdc-time-picker__number';
      numEl.style.left = `${x}px`;
      numEl.style.top = `${y}px`;
      numEl.textContent = isHour ? val : String(val).padStart(2, '0');

      const isCurrentActive = isHour ? (this.hour === val || (val === 12 && this.hour === 0)) : (this.minute === val);
      if (isCurrentActive) numEl.classList.add('is-active');

      numEl.addEventListener('click', () => {
        if (isHour) {
          this.hour = val;
          this.mode = 'minute'; // 选完小时顺滑自动切换至分钟
        } else {
          this.minute = val;
        }
        this.render();
        if (typeof this.options.onSelect === 'function') {
          this.options.onSelect({ hour: this.hour, minute: this.minute, isPM: this.isPM });
        }
      });

      this.clockFace.appendChild(numEl);
    }
  }

  static attachTo(root, options) {
    return new MdcTimePicker(root, options);
  }
}
