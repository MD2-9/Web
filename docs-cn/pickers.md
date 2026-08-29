# 日历与时钟选择器指南 (Pickers)

MDC-Web M2.9 提供了严格遵循 0px 纯直角与 50% 纯圆几何规范的日期选择器（`MdcDatePicker`）与时间选择器（`MdcTimePicker`）。

---

## 1. 日历选择器 (`MdcDatePicker`)

### 1.1 特性
- **0px 直角容器**与纯圆日期选中高亮态。
- 支持月份快速切换、年份选择与今日指示圆点。
- 完整键盘导航支持（方向键切换日期、Enter/Space 选中）。

### 1.2 调用示例
```javascript
import { MdcDatePicker } from '@material/picker';

const datePicker = new MdcDatePicker(document.getElementById('myDatePicker'), {
  value: new Date(),
  onChange: (date) => {
    console.log('选择日期:', date.toLocaleDateString());
  }
});
```

---

## 2. 时间选择器 (`MdcTimePicker`)

### 2.1 核心特性与动效设计
1. **24小时 / 12小时双模式**：
   - 24 小时表盘采用 0 3 6 .. 正八方位锚点架构，刻度数字随指针滑翔跟随。
   - 12 小时表盘包含 1~12 标准刻度与上午/下午（AM/PM）切换器。
2. **即时物理反色遮罩滑块**：
   - 顶部数字区通过双层文本渲染与硬件加速遮罩（`mdc-time-picker__digit-indicator`），实现数字在滑入紫色背景时呈现白黑无缝反色过渡。
3. **1:1 动态等比自适应表盘**：
   - 表盘容器强制保持 1:1 宽高比（`aspect-ratio: 1 / 1`）。
   - 通过 `ResizeObserver` 动态测量当前物理直径，指针高度与刻度数字坐标毫秒级等比重算。
4. **32% 空间自适应隐藏机制**：
   - 当顶栏右侧可用空间少于 32%（$\text{右侧余量} / \text{顶栏宽度} < 0.32$）时，系统自动为时间选择器添加 `.is-narrow` 并平滑隐藏“上午/下午”切换器，确保时间数字居中显示不换行。

### 2.2 HTML 结构
```html
<div class="mdc-time-picker" id="demoTimePicker">
  <div class="mdc-time-picker__header">
    <div class="mdc-time-picker__digital-display">
      <div class="mdc-time-picker__digit-indicator"></div>
      <div class="mdc-time-picker__digital-content mdc-time-picker__digital-content--base">
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-hour">09</div>
        <div class="mdc-time-picker__colon">:</div>
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-minute">30</div>
      </div>
      <div class="mdc-time-picker__digital-content mdc-time-picker__digital-content--inverted">
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-hour">09</div>
        <div class="mdc-time-picker__colon">:</div>
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-minute">30</div>
      </div>
    </div>
    <div class="mdc-time-picker__ampm-toggle">
      <button class="mdc-time-picker__ampm-btn mdc-time-picker__ampm-am is-active">上午</button>
      <button class="mdc-time-picker__ampm-btn mdc-time-picker__ampm-pm">下午</button>
    </div>
  </div>
  <div class="mdc-time-picker__dial-container">
    <div class="mdc-time-picker__clock-face">
      <div class="mdc-time-picker__clock-hand">
        <div class="mdc-time-picker__clock-thumb"></div>
      </div>
      <div class="mdc-time-picker__numbers-base"></div>
    </div>
  </div>
</div>
```

### 2.3 JavaScript 初始化
```javascript
import { MdcTimePicker } from '@material/picker';

const timePicker = new MdcTimePicker(document.getElementById('demoTimePicker'), {
  hour: 9,
  minute: 30,
  isPM: false,
  onSelect: ({ hour, minute, isPM }) => {
    console.log(`选择时间: ${hour}:${minute} ${isPM ? 'PM' : 'AM'}`);
  }
});
```
