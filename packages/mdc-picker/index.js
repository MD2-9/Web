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
    this.displayedHour = this.hour;
    this.displayedMinute = this.minute;
    this.isPM = this.options.isPM;
    this.currentAngle = (this.hour % 24) * 15;

    this.digitalDisplay = root.querySelector('.mdc-time-picker__digital-display');
    this.digitIndicator = null;
    this.invContent = null;
    this.hourToMinuteTimer = null;
    this.amBtn = root.querySelector('.mdc-time-picker__ampm-am');
    this.pmBtn = root.querySelector('.mdc-time-picker__ampm-pm');
    this.clockFace = root.querySelector('.mdc-time-picker__clock-face');

    this.setupDigitalDisplayDOM();
    this.setupDialDOM();
    this.bindEvents();
    this.render();
  }

  setupDigitalDisplayDOM() {
    if (!this.digitalDisplay) return;

    if (!this.digitalDisplay.querySelector('.mdc-time-picker__digit-content--inverted')) {
      const origH = this.digitalDisplay.querySelector('.mdc-time-picker__digit-hour');
      const origM = this.digitalDisplay.querySelector('.mdc-time-picker__digit-minute');
      const curH = origH ? origH.textContent.trim() : String(this.hour).padStart(2, '0');
      const curM = origM ? origM.textContent.trim() : String(this.minute).padStart(2, '0');

      this.digitalDisplay.innerHTML = `
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-slot--hour"></div>
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-slot--min"></div>
        <div class="mdc-time-picker__digital-content mdc-time-picker__digital-content--base">
          <span class="mdc-time-picker__digit-box mdc-time-picker__digit-hour">${curH}</span>
          <span class="mdc-time-picker__colon">:</span>
          <span class="mdc-time-picker__digit-box mdc-time-picker__digit-minute">${curM}</span>
        </div>
        <div class="mdc-time-picker__digit-indicator">
          <div class="mdc-time-picker__digital-content mdc-time-picker__digital-content--inverted">
            <span class="mdc-time-picker__digit-box mdc-time-picker__digit-hour">${curH}</span>
            <span class="mdc-time-picker__colon">:</span>
            <span class="mdc-time-picker__digit-box mdc-time-picker__digit-minute">${curM}</span>
          </div>
        </div>
      `;
    }

    this.baseHourBox = this.digitalDisplay.querySelector('.mdc-time-picker__digital-content--base .mdc-time-picker__digit-hour');
    this.baseMinBox = this.digitalDisplay.querySelector('.mdc-time-picker__digital-content--base .mdc-time-picker__digit-minute');
    this.invHourBox = this.digitalDisplay.querySelector('.mdc-time-picker__digital-content--inverted .mdc-time-picker__digit-hour');
    this.invMinBox = this.digitalDisplay.querySelector('.mdc-time-picker__digital-content--inverted .mdc-time-picker__digit-minute');
    this.digitIndicator = this.digitalDisplay.querySelector('.mdc-time-picker__digit-indicator');
    this.invContent = this.digitalDisplay.querySelector('.mdc-time-picker__digital-content--inverted');
  }

  setIndicatorPosition(mode = this.mode) {
    if (!this.digitIndicator || !this.invContent || !this.baseHourBox || !this.baseMinBox) return;

    const targetBox = mode === 'minute' ? this.baseMinBox : this.baseHourBox;
    const targetX = targetBox.offsetLeft;
    const baseW = targetBox.offsetWidth || 62;

    this.digitIndicator.style.transform = `translateX(${targetX}px)`;
    this.digitIndicator.style.width = `${baseW}px`;
    this.invContent.style.transform = `translateX(${-targetX}px)`;
  }

  animateDigitIndicator(fromMode, toMode, onFinished) {
    if (!this.digitIndicator || !this.invContent || !this.baseHourBox || !this.baseMinBox) return;

    const hourX = this.baseHourBox.offsetLeft;
    const minX = this.baseMinBox.offsetLeft;
    const baseW = this.baseHourBox.offsetWidth || 62;
    const stretchW = baseW + 34; // 96px: 冲刺拉伸宽度

    const isRight = toMode === 'minute';
    const startX = isRight ? hourX : minX;
    const endX = isRight ? minX : hourX;

    if (this.digitIndicator._anim) this.digitIndicator._anim.cancel();
    if (this.invContent._anim) this.invContent._anim.cancel();

    // 🌟 1.2s 非线性运动曲线：蓄力压缩回拉 ➔ 高速弹射拉伸 ➔ 缓冲过冲与阻尼沉降归位
    let keyframes;
    if (isRight) {
      keyframes = [
        { transform: `translateX(${startX}px)`, width: `${baseW}px`, offset: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        // 蓄力压缩：向左回拉 5px，宽度压缩至 56px
        { transform: `translateX(${startX - 5}px)`, width: `${baseW - 6}px`, offset: 0.12, easing: 'cubic-bezier(0.2, 0, 0.1, 1)' },
        // 弹射拉伸：向右爆发冲刺，拉伸至 96px
        { transform: `translateX(${startX + (endX - startX) * 0.22}px)`, width: `${stretchW}px`, offset: 0.36, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' },
        // 跨越冒号区
        { transform: `translateX(${startX + (endX - startX) * 0.65}px)`, width: `${stretchW - 4}px`, offset: 0.64, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        // 缓冲过冲：向右探出 3px
        { transform: `translateX(${endX + 3}px)`, width: `${baseW + 2}px`, offset: 0.85, easing: 'cubic-bezier(0.2, 1, 0.3, 1)' },
        // 阻尼归位：锁定目标位置 62px
        { transform: `translateX(${endX}px)`, width: `${baseW}px`, offset: 1 }
      ];
    } else {
      keyframes = [
        { transform: `translateX(${startX}px)`, width: `${baseW}px`, offset: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        // 蓄力压缩：向右回拉 5px，宽度压缩至 56px
        { transform: `translateX(${startX + 5}px)`, width: `${baseW - 6}px`, offset: 0.12, easing: 'cubic-bezier(0.2, 0, 0.1, 1)' },
        // 弹射拉伸：向左爆发冲刺，拉伸至 96px
        { transform: `translateX(${startX - (startX - endX) * 0.38 - (stretchW - baseW)}px)`, width: `${stretchW}px`, offset: 0.36, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' },
        // 跨越冒号区
        { transform: `translateX(${startX - (startX - endX) * 0.75 - (stretchW - 4 - baseW)}px)`, width: `${stretchW - 4}px`, offset: 0.64, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        // 缓冲过冲：向左探出 3px
        { transform: `translateX(${endX - 3}px)`, width: `${baseW + 2}px`, offset: 0.85, easing: 'cubic-bezier(0.2, 1, 0.3, 1)' },
        // 阻尼归位：锁定目标位置 62px
        { transform: `translateX(${endX}px)`, width: `${baseW}px`, offset: 1 }
      ];
    }

    const invKeyframes = keyframes.map(kf => {
      const match = kf.transform.match(/translateX\(([-0-9.]+)px\)/);
      const x = match ? parseFloat(match[1]) : 0;
      return {
        transform: `translateX(${-x}px)`,
        offset: kf.offset,
        easing: kf.easing
      };
    });

    const animOptions = {
      duration: 800,
      fill: 'forwards'
    };

    this.digitIndicator._animDirection = isRight ? 'toMinute' : 'toHour';
    this.digitIndicator._anim = this.digitIndicator.animate(keyframes, animOptions);
    this.invContent._anim = this.invContent.animate(invKeyframes, animOptions);

    this.digitIndicator._anim.onfinish = () => {
      this.digitIndicator.style.transform = `translateX(${endX}px)`;
      this.digitIndicator.style.width = `${baseW}px`;
      this.invContent.style.transform = `translateX(${-endX}px)`;
      if (onFinished) onFinished();
    };
  }

  // 🌟 打断动画机制：已执行动画反向执行 并且时长变为52%
  interruptIndicatorReverse(onFinished) {
    if (!this.digitIndicator || !this.invContent || !this.digitIndicator._anim) return false;

    const anim = this.digitIndicator._anim;
    const invAnim = this.invContent._anim;

    if (anim.playState === 'running' || anim.playState === 'paused') {
      const elapsed = anim.currentTime || 0;
      if (elapsed > 10) {
        // 速率设定为 -(1 / 0.52)，使倒放所需耗时恰好为已执行时间的 52%
        const reverseRate = - (1 / 0.52);
        anim.playbackRate = reverseRate;
        if (invAnim) invAnim.playbackRate = reverseRate;

        anim.onfinish = () => {
          anim.cancel();
          if (invAnim) invAnim.cancel();
          const startMode = this.digitIndicator._animDirection === 'toMinute' ? 'hour' : 'minute';
          this.setIndicatorPosition(startMode);
          if (onFinished) onFinished();
        };
        return true;
      }
    }
    return false;
  }

  setupDialDOM() {
    if (!this.clockFace) return;
    this.clockFace.innerHTML = '';

    // 1. 基础数字层（暗色正常显示）
    this.numbersBase = document.createElement('div');
    this.numbersBase.className = 'mdc-time-picker__numbers-base';
    this.clockFace.appendChild(this.numbersBase);

    // 2. 中心轴点
    this.centerPivot = document.createElement('div');
    this.centerPivot.className = 'mdc-time-picker__center-pivot';
    this.clockFace.appendChild(this.centerPivot);

    // 3. 旋转指针
    this.clockHand = document.createElement('div');
    this.clockHand.className = 'mdc-time-picker__clock-hand';

    // 4. 指针头部 34px 纯圆滑块（局部遮罩反色剪裁器）
    this.thumbCircle = document.createElement('div');
    this.thumbCircle.className = 'mdc-time-picker__thumb-circle';

    // 5. 逆向旋转反色镜像层（纯白高对比度文字）
    this.invertedMask = document.createElement('div');
    this.invertedMask.className = 'mdc-time-picker__inverted-mask';
    this.thumbCircle.appendChild(this.invertedMask);

    this.clockHand.appendChild(this.thumbCircle);
    this.clockFace.appendChild(this.clockHand);

    this.currentDialMode = null;
    this.cachedNodes = [];
  }

  bindEvents() {
    if (this.baseHourBox) {
      this.baseHourBox.addEventListener('click', () => {
        if (this.hourPauseTimer) {
          clearTimeout(this.hourPauseTimer);
          this.hourPauseTimer = null;
        }
        if (this.hourToMinuteTimer) {
          clearTimeout(this.hourToMinuteTimer);
          this.hourToMinuteTimer = null;
        }
        const wasInterrupted = this.interruptIndicatorReverse();
        if (!wasInterrupted && this.mode !== 'hour') {
          this.animateDigitIndicator('minute', 'hour');
        }
        this.mode = 'hour';
        this.snapToCurrentTime(true);
        this.updateDigitalDisplay(false);
      });
    }
    if (this.baseMinBox) {
      this.baseMinBox.addEventListener('click', () => {
        if (this.hourPauseTimer) {
          clearTimeout(this.hourPauseTimer);
          this.hourPauseTimer = null;
        }
        if (this.hourToMinuteTimer) {
          clearTimeout(this.hourToMinuteTimer);
          this.hourToMinuteTimer = null;
        }
        const wasInterrupted = this.interruptIndicatorReverse();
        if (!wasInterrupted && this.mode !== 'minute') {
          this.animateDigitIndicator('hour', 'minute');
        }
        this.mode = 'minute';
        this.snapToCurrentTime(true);
        this.updateDigitalDisplay(false);
      });
    }
    if (this.amBtn) {
      this.amBtn.addEventListener('click', () => {
        if (this.hour >= 12) {
          this.hour -= 12;
          this.isPM = false;
          this.dragDirection = -1;
          if (this.mode === 'hour') {
            this.snapToCurrentTime(true);
          }
          this.updateDigitalDisplay(true);
        } else {
          this.isPM = false;
          this.updateDigitalDisplay(false);
        }
      });
    }
    if (this.pmBtn) {
      this.pmBtn.addEventListener('click', () => {
        if (this.hour < 12) {
          this.hour += 12;
          this.isPM = true;
          this.dragDirection = 1;
          if (this.mode === 'hour') {
            this.snapToCurrentTime(true);
          }
          this.updateDigitalDisplay(true);
        } else {
          this.isPM = true;
          this.updateDigitalDisplay(false);
        }
      });
    }

    // 🌟 表盘双圈交互 ✖ 连续平滑跨越 00 ✖ 动态数字平滑变形移动 ✖ 0.29s 磁吸
    if (this.clockFace) {
      let isDragging = false;

      this.dragDirection = 1;

      const updateFromPointer = (clientX, clientY) => {
        const rect = this.clockFace.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let rawDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (rawDeg < 0) rawDeg += 360;

        let currentMod = ((this.currentAngle % 360) + 360) % 360;
        let delta = rawDeg - currentMod;
        if (delta < -180) delta += 360;
        if (delta > 180) delta -= 360;

        if (Math.abs(delta) > 0.4) {
          this.dragDirection = delta > 0 ? 1 : -1;
        }

        this.currentAngle += delta;

        if (this.clockHand) {
          this.clockHand.style.transition = 'none';
          this.clockHand.style.transform = `rotate(${this.currentAngle}deg)`;
        }
        if (this.invertedMask) {
          this.invertedMask.style.transition = 'none';
          this.invertedMask.style.transform = `rotate(${-this.currentAngle}deg)`;
        }

        const normAngle = ((this.currentAngle % 360) + 360) % 360;
        if (this.mode === 'hour') {
          // 24小时表盘：360° / 24 = 15° 每小时
          let h = Math.round(normAngle / 15);
          if (h >= 24) h = 0;
          this.hour = h;
          this.isPM = this.hour >= 12;
        } else {
          let m = Math.round(normAngle / 6);
          if (m >= 60) m = 0;
          this.minute = m;
        }
        this.renderNumbers(true);
      };

      this.clockFace.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 🌟 核心保护：只有在小时模式处于等待/过渡期间，触碰表盘才打断倒放回小时
        if (this.mode === 'hour') {
          const isTransitionPending = Boolean(this.hourPauseTimer || this.hourToMinuteTimer);
          if (this.hourPauseTimer) {
            clearTimeout(this.hourPauseTimer);
            this.hourPauseTimer = null;
          }
          if (this.hourToMinuteTimer) {
            clearTimeout(this.hourToMinuteTimer);
            this.hourToMinuteTimer = null;
          }
          if (isTransitionPending) {
            this.interruptIndicatorReverse();
          }
        }
        // 🌟 如果已经切换到分钟模式 (this.mode === 'minute')：
        // 拖动绝对不会变回小时！保持 this.mode = 'minute'，指针与角度精确对应分钟！

        isDragging = true;
        try { this.clockFace.setPointerCapture(e.pointerId); } catch (_) {}
        updateFromPointer(e.clientX, e.clientY);
      });

      this.clockFace.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        updateFromPointer(e.clientX, e.clientY);
      });

      const handlePointerUp = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        try { this.clockFace.releasePointerCapture(e.pointerId); } catch (_) {}

        this.snapToCurrentTime(true);

        if (this.mode === 'hour') {
          if (this.hourPauseTimer) {
            clearTimeout(this.hourPauseTimer);
            this.hourPauseTimer = null;
          }
          if (this.hourToMinuteTimer) {
            clearTimeout(this.hourToMinuteTimer);
            this.hourToMinuteTimer = null;
          }

          // 🌟 1. 先把时的改变动画播放完
          this.updateDigitalDisplay(true, () => {
            if (isDragging) return;

            // 🌟 2. 执行完等待 0.3s (300ms)
            this.hourPauseTimer = setTimeout(() => {
              if (isDragging) return;

              // 🌟 3. 然后开始 0.8s (800ms) 的时分切换动画
              this.animateDigitIndicator('hour', 'minute');

              // 4. 给出 0.8s (800ms) 完整等待时间，期间维持小时表盘显示，滑块正在物理反色滑移
              this.hourToMinuteTimer = setTimeout(() => {
                this.hourToMinuteTimer = null;
                if (!isDragging) {
                  this.mode = 'minute';
                  this.snapToCurrentTime(true);
                  this.updateDigitalDisplay(false);
                }
              }, 800);
            }, 300);
          });
        } else {
          // 🌟 分钟模式下释放：仅更新分钟显示，绝不触发模式跳转或倒放
          this.updateDigitalDisplay(true);
        }

        if (typeof this.options.onSelect === 'function') {
          this.options.onSelect({ hour: this.hour, minute: this.minute, isPM: this.isPM });
        }
      };

      this.clockFace.addEventListener('pointerup', handlePointerUp);
      this.clockFace.addEventListener('pointercancel', handlePointerUp);

      // 🌟 彻底隔离移动端与滚轮滚动，防止拖拽表盘时误触发页面滚动
      this.clockFace.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
      this.clockFace.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
      this.clockFace.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    }
  }

  snapToCurrentTime(animate = false) {
    const targetDeg = this.mode === 'hour'
      ? (this.hour % 24) * 15
      : (this.minute % 60) * 6;

    let currentMod = ((this.currentAngle % 360) + 360) % 360;
    let delta = targetDeg - currentMod;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;
    this.currentAngle += delta;

    const transitionStyle = animate ? 'transform 0.29s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    if (this.clockHand) {
      this.clockHand.style.transition = transitionStyle;
      this.clockHand.style.transform = `rotate(${this.currentAngle}deg)`;
    }
    if (this.invertedMask) {
      this.invertedMask.style.transition = transitionStyle;
      this.invertedMask.style.transform = `rotate(${-this.currentAngle}deg)`;
    }

    this.render(animate);
  }

  updateDigitalDisplay(animate = false, onHourFinished = null) {
    const hStr = String(this.hour).padStart(2, '0');
    const mStr = String(this.minute).padStart(2, '0');

    if (!animate) {
      if (this.baseHourBox) this.baseHourBox.innerHTML = `<span class="mdc-time-picker__digit-text">${hStr}</span>`;
      if (this.invHourBox) this.invHourBox.innerHTML = `<span class="mdc-time-picker__digit-text">${hStr}</span>`;
      if (this.baseMinBox) this.baseMinBox.innerHTML = `<span class="mdc-time-picker__digit-text">${mStr}</span>`;
      if (this.invMinBox) this.invMinBox.innerHTML = `<span class="mdc-time-picker__digit-text">${mStr}</span>`;
      this.displayedHour = this.hour;
      this.displayedMinute = this.minute;
      if (onHourFinished) onHourFinished();
    } else {
      if (this.displayedHour !== this.hour) {
        const fromH = this.displayedHour;
        const toH = this.hour;
        this.displayedHour = this.hour;
        if (this.baseHourBox) this.rollDigitBox(this.baseHourBox, fromH, toH, 24, 2, this.dragDirection, onHourFinished);
        if (this.invHourBox) this.rollDigitBox(this.invHourBox, fromH, toH, 24, 2, this.dragDirection);
      } else {
        if (onHourFinished) onHourFinished();
      }
      if (this.displayedMinute !== this.minute) {
        const fromM = this.displayedMinute;
        const toM = this.minute;
        this.displayedMinute = this.minute;
        if (this.baseMinBox) this.rollDigitBox(this.baseMinBox, fromM, toM, 60, 5, this.dragDirection);
        if (this.invMinBox) this.rollDigitBox(this.invMinBox, fromM, toM, 60, 5, this.dragDirection);
      }
    }

    if (this.amBtn) this.amBtn.classList.toggle('is-active', !this.isPM);
    if (this.pmBtn) this.pmBtn.classList.toggle('is-active', this.isPM);

    this.setIndicatorPosition(this.mode);
  }

  rollDigitBox(box, fromVal, toVal, maxVal, stepSize, dragDirection, onFinished) {
    if (!box) return;
    if (fromVal === toVal) {
      box.innerHTML = `<span class="mdc-time-picker__digit-text">${String(toVal).padStart(2, '0')}</span>`;
      if (onFinished) onFinished();
      return;
    }

    const forwardDist = (toVal - fromVal + maxVal) % maxVal;
    const backwardDist = (fromVal - toVal + maxVal) % maxVal;

    let isUp;
    if (dragDirection !== undefined && dragDirection !== 0) {
      isUp = dragDirection > 0;
    } else {
      isUp = forwardDist <= backwardDist;
    }

    const intermediates = [];
    if (isUp) {
      let curr = fromVal;
      while (true) {
        const dist = (toVal - curr + maxVal) % maxVal;
        if (dist <= 0 || dist <= stepSize) break;
        curr = (curr + stepSize) % maxVal;
        intermediates.push(curr);
      }
    } else {
      let curr = fromVal;
      while (true) {
        const dist = (curr - toVal + maxVal) % maxVal;
        if (dist <= 0 || dist <= stepSize) break;
        curr = (curr - stepSize + maxVal) % maxVal;
        intermediates.push(curr);
      }
    }

    const token = Symbol();
    box._rollAnimToken = token;

    const itemHeight = box.clientHeight || 52;

    const track = document.createElement('div');
    track.className = 'mdc-time-picker__roller-track';
    track.style.position = 'absolute';
    track.style.left = '0';
    track.style.width = '100%';
    track.style.display = 'flex';
    track.style.flexDirection = 'column';
    track.style.willChange = 'transform';

    const createItem = (val, isInter) => {
      const el = document.createElement('div');
      el.className = 'mdc-time-picker__digit-text';
      el.style.height = `${itemHeight}px`;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.width = '100%';
      el.textContent = String(val).padStart(2, '0');

      if (isInter) {
        // 🌟 中途步进时间变化：高透明度 (0.35) ✖ 80%字号 (32px) 显示
        el.style.opacity = '0.35';
        el.style.fontSize = '32px';
        el.style.transform = 'scale(0.8)';
      } else {
        el.style.opacity = '1';
        el.style.fontSize = '40px';
      }
      return el;
    };

    let startTranslateY = 0;
    let endTranslateY = 0;

    if (isUp) {
      track.style.top = '0';
      track.appendChild(createItem(fromVal, false));
      intermediates.forEach(v => track.appendChild(createItem(v, true)));
      track.appendChild(createItem(toVal, false));

      const totalDist = (intermediates.length + 1) * itemHeight;
      startTranslateY = 0;
      endTranslateY = -totalDist;
    } else {
      track.appendChild(createItem(toVal, false));
      intermediates.forEach(v => track.appendChild(createItem(v, true)));
      track.appendChild(createItem(fromVal, false));

      const totalDist = (intermediates.length + 1) * itemHeight;
      track.style.top = `-${totalDist}px`;
      startTranslateY = 0;
      endTranslateY = totalDist;
    }

    box.innerHTML = '';
    box.appendChild(track);

    // 🌟 过程与结果同时开始切换动画、同时结束切换动画（过程只作为动效用）
    const duration = Math.min(320, Math.max(220, 180 + intermediates.length * 28));

    const anim = track.animate([
      { transform: `translateY(${startTranslateY}px)` },
      { transform: `translateY(${endTranslateY}px)` }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      if (box._rollAnimToken !== token) return;
      box.innerHTML = `<span class="mdc-time-picker__digit-text">${String(toVal).padStart(2, '0')}</span>`;
      if (onFinished) onFinished();
    };
  }

  renderNumbers(isLiveDrag = false) {
    if (!this.numbersBase || !this.invertedMask) return;

    const isHour = this.mode === 'hour';

    // 1. 初始化或切换模式时重构持久化 DOM 节点（保持平滑 CSS 动画）
    if (this.currentDialMode !== this.mode) {
      this.currentDialMode = this.mode;
      this.numbersBase.innerHTML = '';
      this.invertedMask.innerHTML = '';
      this.cachedNodes = [];

      // 小时表盘：0 3 6 .. 架构（0, 3, 6, 9, 12, 15, 18, 21，共 8 个 45° 等距正八方位锚点）
      const anchorList = isHour
        ? [0, 3, 6, 9, 12, 15, 18, 21]
        : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

      anchorList.forEach(anchorVal => {
        const baseEl = document.createElement('div');
        baseEl.className = 'mdc-time-picker__number';
        this.numbersBase.appendChild(baseEl);

        const invEl = document.createElement('div');
        invEl.className = 'mdc-time-picker__number';
        this.invertedMask.appendChild(invEl);

        this.cachedNodes.push({ anchorVal, baseEl, invEl });
      });
    }

    const center = 115;
    const radius = 88; // 统一优雅大外圈 88px

    if (isHour) {
      // 🌟 小时模式：24小时 0 3 6 .. 架构 ✖ 动态数字平滑滑翔跟随（最大位移仅 15°）
      const currentHour = this.hour;
      const baseAnchor = Math.floor(currentHour / 3) * 3;
      const rem = currentHour % 3;
      const nextAnchor = (baseAnchor + 3) % 24;

      let closestAnchor;
      if (rem === 0) {
        closestAnchor = baseAnchor;
      } else if (rem === 1) {
        // 比如 1 (距离 0 只有 1 步)：由 0 滑翔至 1；4 由 3 滑翔至 4
        closestAnchor = baseAnchor;
      } else {
        // rem === 2，比如 2 (距离 3 只有 1 步)：由 3 滑翔至 2；5 由 6 滑翔至 5
        closestAnchor = nextAnchor;
      }

      this.cachedNodes.forEach(item => {
        const A = item.anchorVal;
        const isMorphing = (A === closestAnchor);

        let angleDeg;
        let text;

        if (isMorphing) {
          // 最近的基准刻度沿圆周滑翔至当前小时并显示当前小时数字
          angleDeg = (currentHour % 24) * 15;
          text = String(currentHour);
        } else {
          // 其余刻度静止在基准位置（0, 3, 6, 9, 12, 15, 18, 21）
          angleDeg = (A % 24) * 15;
          text = String(A);
        }

        const rad = (angleDeg - 90) * (Math.PI / 180);
        const x = center + radius * Math.cos(rad);
        const y = center + radius * Math.sin(rad);

        item.baseEl.style.left = `${x}px`;
        item.baseEl.style.top = `${y}px`;
        item.baseEl.textContent = text;

        item.invEl.style.left = `${x}px`;
        item.invEl.style.top = `${y}px`;
        item.invEl.textContent = text;
      });
    } else {
      // 🌟 分钟模式：方向感知迟滞（10->15在13切换，15->10在12切换）✖ 动态数字平滑变形跟随
      const currentMin = this.minute;
      const base = Math.floor(currentMin / 5) * 5;
      const rem = currentMin - base;
      const next = (base + 5) % 60;

      let closestAnchor;
      if (rem === 0) {
        closestAnchor = base % 60;
      } else if (this.dragDirection >= 0) {
        // 顺时针（如 10->15）：10, 11, 12 使用 10；到 13 切换至 15
        closestAnchor = (rem < 3) ? (base % 60) : next;
      } else {
        // 逆时针（如 15->10）：15, 14, 13 使用 15；到 12 切换至 10
        closestAnchor = (rem > 2) ? next : (base % 60);
      }

      this.cachedNodes.forEach(item => {
        const A = item.anchorVal;
        const isMorphing = (A === closestAnchor);

        let angleDeg;
        let text;

        if (isMorphing) {
          // 最近的基准数字（如 15 或 20）平滑滑翔至指针当前分钟位置（如 16 或 19）并显示当前分钟
          angleDeg = (currentMin % 60) * 6;
          text = String(currentMin).padStart(2, '0');
        } else {
          // 其余数字安静停留在基准刻度位置
          angleDeg = (A % 60) * 6;
          text = String(A).padStart(2, '0');
        }

        const rad = (angleDeg - 90) * (Math.PI / 180);
        const x = center + radius * Math.cos(rad);
        const y = center + radius * Math.sin(rad);

        item.baseEl.style.left = `${x}px`;
        item.baseEl.style.top = `${y}px`;
        item.baseEl.textContent = text;

        item.invEl.style.left = `${x}px`;
        item.invEl.style.top = `${y}px`;
        item.invEl.textContent = text;
      });
    }
  }

  render(animateDigital = false) {
    this.updateDigitalDisplay(animateDigital);

    if (this.clockHand) {
      this.clockHand.style.transform = `rotate(${this.currentAngle}deg)`;
    }
    if (this.invertedMask) {
      this.invertedMask.style.transform = `rotate(${-this.currentAngle}deg)`;
    }

    this.renderNumbers(false);
  }

  static attachTo(root, options) {
    return new MdcTimePicker(root, options);
  }
}
