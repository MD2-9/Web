# MDC-Web · M2.9 全组件架构与调用规范文档 (Component Catalog & API Reference)

> **开发者**：安秋 ([github.com/unjal29](https://github.com/unjal29))  
> **开源协议**：全部组件统一遵循 **Apache License 2.0**  
> **上游官方基准库**：[Google MDC-Web (github.com/material-components/material-components-web)](https://github.com/material-components/material-components-web)  
> **参考说明**：部分 UI 借用与参考自 [MDUI (github.com/zdhxiong/mdui)](https://github.com/zdhxiong/mdui)  
> **字体声明**：排版演示采用 **Google Sans Flex** 变量字体，版权归 **Google LLC** 所有。

本项目基于官方 **Material Components Web (MDC-Web v0.34.1 / Android 8 MD1 终极成熟架构)** 进行深度重构与定制扩展，构建全新的 **M2.9** 设计规范体系。融合了 **0px 纯直角 & 50% 纯圆几何骨架**、**Google Sans Flex 变量字体**、**Material You (CAM16 & HCT) 莫奈动态色彩空间引擎** 以及一系列现代组件。

所有控件均封装在模块化的 `packages/` 与 `packages/material-components-web` 中，支持全量引入或按需调用。

---

## 快速调用与引入方式 (Quickstart & Usage)

### 1. 全量引入 (All-in-one Bundle)

#### SCSS / CSS
```scss
// 引入包含全部官方原生与定制扩展组件的完整样式表
@import "@material/material-components-web/material-components-web";
```

#### JavaScript
```javascript
// 方式 A：从总包解构引入
import {
  autoInit,
  navigationRail,
  monet,
  expansionPanel,
  M29Slider,
  M29Tabs,
  M29LinearProgress,
  createRipple,
  attachRipples,
  M29OverscrollGlow,
  attachOverscrollGlow,
  dialog,
  card,
  button,
  select,
  textField
} from 'material-components-web';

// 一键自动实例化页面中所有已声明 data-mdc-auto-init 的组件
autoInit();
```

---

## 第一部分：定制与新增组件 (Modified & Extended Components)

本部分汇总了由本项目**深度重构、几何定制或全新开发**的核心组件与子系统。

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                M2.9 定制与新增组件架构                                 │
├───────────────────────┬──────────────────────────────────┬─────────────────────────────┤
│ 模块名称              │ NPM 包路径                       │ 核心导出 Class / API        │
├───────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ 莫奈动态色彩与调色盘  │ @material/monet                  │ MdcMonetEngine, Picker     │
│ 竖向导航栏 (Nav Rail) │ @material/navigation-rail        │ MdcNavigationRail           │
│ 触顶触底水波纹泛光    │ @material/ripple                 │ M29OverscrollGlow          │
│ 纯圆目标隔离水波纹    │ @material/ripple                 │ createRipple, attachRipples │
│ 0px 纯直角分段按钮组  │ @material/segmented-button       │ segmented-button 规范       │
│ 0px 纯直角自定义下拉  │ @material/select                 │ mdc-select-custom 规范      │
│ 徽标与计数角标        │ @material/badge                  │ badge-container 规范        │
│ 0px 直角提示框        │ @material/tooltip                │ tooltip-wrapper 规范        │
│ 分割线                │ @material/divider                │ mdc-divider 规范            │
│ 离散大头针滑块        │ @material/slider                 │ M29Slider                   │
│ 方向感知平滑选项卡    │ @material/tabs                   │ M29Tabs                     │
│ 双波形线性进度条      │ @material/linear-progress        │ M29LinearProgress          │
│ 手风琴折叠面板        │ @material/expansion-panel        │ MdcExpansionPanel           │
│ MD1 胶囊滑动开关      │ @material/switch                 │ m29-switch 规范             │
│ 日历与时钟选择器      │ @material/picker                 │ MdcDatePicker, TimePicker   │
│ 莫奈动态三色与Container│ @material/theme, @material/monet │ M3 全局三色与Container规范  │
│ 0px 纯直角几何体系    │ @material/button, card, dialog.. │ 全局 Straight Angle 规范    │
└───────────────────────┴──────────────────────────────────┴─────────────────────────────┘
```

---

### 1. 🎨 莫奈动态色彩与调色盘系统 (`@material/monet`)

* **功能定位**：基于 CAM16 / HCT 色彩空间算法，提供类似 Android 12+ / MD3 的动态取色体系与 3-Step 交互式调色盘，自动计算 50~900 全色阶并注入 `--mdc-theme-*` CSS 变量。
* **引入路径**：
  * SCSS: `@import "@material/monet/mdc-monet";`
  * JS: `import { MdcMonetEngine, MdcMonetPicker, MONET_PALETTES } from '@material/monet';`

#### HTML 结构 (3-Step 调色盘色块网格)
```html
<div class="theme-grid" id="themeGrid">
  <!-- 动态生成的 24 款莫奈无缝色块 -->
</div>
```

#### JavaScript 调用
```javascript
import { MdcMonetEngine, MdcMonetPicker } from '@material/monet';

// 1. 算法生成并应用莫奈全色阶主题 (支持亮色/暗色 Tone 20/12 阶梯适配)
const theme = MdcMonetEngine.applyTheme({
  primary: '#6750A4',
  secondary: '#625B71',
  tertiary: '#7D5260'
}, {
  target: document.documentElement,
  dark: false,
  variant: 'tonal_spot'
});

// 2. 实例化 3-Step 调色盘交互组件
const picker = new MdcMonetPicker({
  container: document.getElementById('themeGrid'),
  stepTitle: document.getElementById('pickerStepTitle'),
  stepSub: document.getElementById('pickerStepSub'),
  onComplete: (colors) => {
    console.log('用户调色完成:', colors);
  }
});
```

---

### 2. 📱 Android 5.0 ~ 11.0 扁平化边界临界动效 (Flat Arc EdgeEffect / 边界水波纹)

* **功能定位**：1:1 严格复刻 Android 5.0 (Lollipop) 至 Android 11.0 (R) AOSP 系统的 `android.widget.EdgeEffect` 扁平化半椭圆弧顶临界动效。配色与 Material Ripple 同源（纯色微透，无发光/光晕），支持手指实时阻尼拉伸 (`onPull`)、触点横向偏置 (`mDisplacement`)、滚轮/惯性冲击吸能 (`onAbsorb`) 与 Material 经典 Fast-Out Slow-In 回弹消退 (`onRelease`)。
* **引入路径**：
  * SCSS: `@import "@material/ripple/m29-overscroll-glow";`
  * JS: `import { M29FlatEdgeEffect, attachFlatEdgeEffect, M29EdgeEffect, attachEdgeEffect } from '@material/ripple';`

#### HTML 结构 (自动挂载或手动声明)
```html
<!-- 全局视口/容器边界弧顶 (JS 自动注入 SVG 贝塞尔穹顶) -->
<div class="m29-overscroll-edge-container m29-overscroll-edge-container--fixed">
  <svg class="m29-overscroll-edge-arc m29-overscroll-edge-arc--top" viewBox="0 0 1000 100" preserveAspectRatio="none">
    <path d="M 0 0 C 250 120, 750 120, 1000 0 Z"></path>
  </svg>
  <svg class="m29-overscroll-edge-arc m29-overscroll-edge-arc--bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
    <path d="M 0 100 C 250 -20, 750 -20, 1000 100 Z"></path>
  </svg>
</div>
```

#### JavaScript 调用
```javascript
import { attachFlatEdgeEffect } from '@material/ripple';

// 1. 一键初始化全页面视口与所有内部滚动容器的边界临界动效
const edgeManager = attachFlatEdgeEffect();

// 2. 手动触发特定方向的边界冲击回弹
edgeManager.triggerGlow(document.querySelector('.my-scroll-box'), true /* isTop */, 1.2 /* intensity */);
```

---

### 3. 🌊 精准隔离与速率放慢 3/5 水波纹动效 (`@material/ripple`)

* **功能定位**：将水波纹扩散速率调慢 3/5（动画时长由 0.4s 扩展至 0.65s），并实现**点击精确目标隔离**——点击按钮只有按钮产生涟漪，绝不连带触发卡片或父容器。
* **引入路径**：
  * SCSS: `@import "@material/ripple/m29-ripple";`
  * JS: `import { createRipple, attachRipples } from '@material/ripple';`

#### HTML 结构
```html
<!-- 声明 data-m29-ripple 即可拥有独立隔离水波纹 -->
<button class="mdc-button mdc-button--raised" data-m29-ripple>
  Raised Button
</button>
```

#### JavaScript 调用
```javascript
import { attachRipples } from '@material/ripple';

// 初始化页面内所有带有 data-m29-ripple 的元素
attachRipples();
```

---

### 4. 🔲 0px 纯直角分段按钮组 (`@material/segmented-button`)

* **功能定位**：严格遵循 0px 纯直角规范的分段按钮组，支持单选/多选状态切换与图标排版。
* **引入路径**：
  * SCSS: `@import "@material/segmented-button/mdc-segmented-button";`

#### HTML 结构
```html
<div class="segmented-button-group" id="demoSegmentedGroup">
  <button class="segmented-button is-selected" onclick="toggleSegmented(this)">
    <i class="material-icons" style="font-size: 16px;">view_module</i> 全景视图
  </button>
  <button class="segmented-button" onclick="toggleSegmented(this)">
    <i class="material-icons" style="font-size: 16px;">view_compact</i> 紧凑网格
  </button>
  <button class="segmented-button" onclick="toggleSegmented(this)">
    <i class="material-icons" style="font-size: 16px;">view_list</i> 详细列表
  </button>
</div>
```

---

### 5. 📐 0px 纯直角自定义下拉选择器 (`@material/select`)

* **功能定位**：彻底摆脱原生 `<select>` 简陋样式的纯直角浮动菜单选择器，具备 Material Floating Label、旋转箭头与 Elevation 8 浮层阴影。
* **引入路径**：
  * SCSS: `@import "@material/select/mdc-select";`

#### HTML 结构
```html
<div class="mdc-select-custom" id="customSelectDemo">
  <div class="mdc-select-custom__surface" onclick="toggleMdcSelect(event)">
    <span class="mdc-select-custom__label">选择主题算法</span>
    <span class="mdc-select-custom__selected-text" id="selectCustomText">Tonal Spot (标准莫奈)</span>
    <i class="material-icons mdc-select-custom__icon">arrow_drop_down</i>
  </div>
  <div class="mdc-select-custom__menu" id="selectCustomMenu">
    <div class="mdc-select-custom__item is-selected" onclick="selectMdcOption('tonal_spot', this)">
      <span>Tonal Spot (标准莫奈)</span>
      <i class="material-icons" style="font-size: 18px; color: var(--mdc-theme-primary);">check</i>
    </div>
    <div class="mdc-select-custom__item" onclick="selectMdcOption('vibrant', this)">
      <span>Vibrant (高饱和活力)</span>
    </div>
  </div>
</div>
```

---

### 6. 🏷️ 徽标与计数角标 (`@material/badge`)

* **功能定位**：红点提醒（Dot Badge）与数字计数角标（Count Badge），支持纯圆与胶囊几何。
* **引入路径**：
  * SCSS: `@import "@material/badge/mdc-badge";`

#### HTML 结构
```html
<!-- 红点徽标 -->
<div class="badge-container">
  <button class="mdc-icon-button material-icons">notifications</button>
  <span class="badge-dot"></span>
</div>

<!-- 数字计数徽标 -->
<div class="badge-container">
  <button class="mdc-icon-button material-icons">email</button>
  <span class="badge-number">9+</span>
</div>
```

---

### 7. 💬 0px 直角提示框 (`@material/tooltip`)

* **功能定位**：悬浮提示气泡，纯直角 0px 剪裁与 Elevation 4 阴影。
* **引入路径**：
  * SCSS: `@import "@material/tooltip/mdc-tooltip";`

#### HTML 结构
```html
<div class="tooltip-wrapper">
  <button class="mdc-button mdc-button--outlined">Hover Me</button>
  <div class="tooltip-box">纯直角 Material 提示框</div>
</div>
```

---

### 8. ➖ 分割线 (`@material/divider`)

* **功能定位**：全宽分割线与缩进 56px 列表分割线。
* **引入路径**：
  * SCSS: `@import "@material/divider/mdc-divider";`

#### HTML 结构
```html
<!-- 全宽分割线 -->
<hr class="mdc-divider">

<!-- 列表前缀图标对齐缩进分割线 -->
<hr class="mdc-divider mdc-divider--inset">
```

---

### 9. 🧭 竖向导航栏与二级抽屉 (`@material/navigation-rail`)

* **功能定位**：桌面端（宽度 $\ge 600\text{px}$）常驻竖向导航导轨，默认收起为 80px 单图标模式，悬浮展开至 256px 并渐显文字标签。支持点击一级菜单平滑唤出二级抽屉面板（圆圈涟漪展开动画 `clip-path: circle()`）。
* **对齐规范**：桌面端二级面板内的导航列表（`.rail-nav-list`）、自定义内容（`.secondary-overlay-content`）与调色盘网格（`.theme-grid`）采用**上下居中对齐**（`margin: auto 0; justify-content: center;`），在内容过长时平滑触发内部纵向滚动。
* **引入路径**：
  * SCSS: `@import "@material/navigation-rail/mdc-navigation-rail";`
  * JS: `import { MdcNavigationRail } from '@material/navigation-rail';`

#### HTML 结构
```html
<nav class="mdc-navigation-rail" id="app-rail">
  <div class="rail-header">
    <div class="rail-header-avatar">M</div>
    <span class="rail-header-text">M2.9 Web</span>
  </div>
  <div class="rail-nav-list">
    <a href="#section-overview" class="rail-nav-item is-active">
      <i class="material-icons rail-item-icon">home</i>
      <span class="rail-item-text">首页</span>
    </a>
  </div>
  <!-- 二级抽屉面板 (桌面端上下居中) -->
  <div class="secondary-overlay-panel" id="catalogSubmenuPanel">
    <div class="secondary-overlay-header">
      <button class="secondary-back-btn"><i class="material-icons">arrow_back</i></button>
      <div class="secondary-overlay-title">组件目录</div>
    </div>
    <div class="rail-nav-list">
      <a href="#section-buttons" class="rail-nav-item">1. 按钮与 FAB</a>
    </div>
  </div>
</nav>
```

---

### 10. 📱 移动端专用抽屉组件 (`@material/mobile-drawer`)

* **功能定位**：移动端（宽度 $< 600\text{px}$）独立专用抽屉组件，默认隐藏于屏幕左侧之外，支持屏幕左边缘右滑唤出或页面静止 2.9 秒后自动呈现的悬浮操作按钮唤出。
* **对齐与交互规范**：
  * **向下对齐（Bottom-to-Top）**：一级列表与二级面板内的全部按钮与内容均采用向下靠底排列（`justify-content: flex-end; margin-top: auto; margin-bottom: 0;`），极致贴合单手大拇指黄金操作区。
  * **0.39s 页面跳转收回**：点击跳转页面锚点项时，平滑滚动至目标锚点并在延迟 0.39 秒后收回抽屉，给用户清晰的视觉确认。
* **引入路径**：
  * SCSS: `@import "@material/mobile-drawer/mdc-mobile-drawer";`
  * JS: `import { MdcMobileDrawer } from '@material/mobile-drawer';`

---

### 11. ⏰ 日历与时钟选择器 (`@material/picker`)

* **功能定位**：0px 直角与纯圆 Material 规范的日期选择器（DatePicker）与表盘时间选择器（TimePicker）。
  * **DatePicker**：支持年份/月份切换、今日指示器、选中圆圈态与农历/节假日扩展。
  * **TimePicker**：具备 24小时/12小时模式、拖拽即时物理反色遮罩指针、1:1 动态等比自适应表盘（表盘直径随容器自适应且数字与指针毫秒级重算坐标）、以及**当顶栏右侧可用空间少于 32% 时自动隐藏上午/下午切换器**的高级响应式机制。
* **引入路径**：
  * SCSS: `@import "@material/picker/mdc-picker";`
  * JS: `import { MdcDatePicker, MdcTimePicker } from '@material/picker';`

#### HTML 结构 (TimePicker)
```html
<div class="mdc-time-picker" id="demoTimePicker">
  <div class="mdc-time-picker__header">
    <div class="mdc-time-picker__digital-display">
      <div class="mdc-time-picker__digit-indicator"></div>
      <div class="mdc-time-picker__digital-content mdc-time-picker__digital-content--base">
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-hour">12</div>
        <div class="mdc-time-picker__colon">:</div>
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-minute">30</div>
      </div>
      <div class="mdc-time-picker__digital-content mdc-time-picker__digital-content--inverted">
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-hour">12</div>
        <div class="mdc-time-picker__colon">:</div>
        <div class="mdc-time-picker__digit-slot mdc-time-picker__digit-minute">30</div>
      </div>
    </div>
    <div class="mdc-time-picker__ampm-toggle">
      <button class="mdc-time-picker__ampm-btn mdc-time-picker__ampm-am">上午</button>
      <button class="mdc-time-picker__ampm-btn mdc-time-picker__ampm-pm is-active">下午</button>
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

#### JavaScript 调用
```javascript
import { MdcDatePicker, MdcTimePicker } from '@material/picker';

const datePicker = new MdcDatePicker(document.getElementById('demoDatePicker'), {
  onChange: (date) => console.log('Selected date:', date)
});

const timePicker = new MdcTimePicker(document.getElementById('demoTimePicker'), {
  mode: 'hour',
  hour: 12,
  minute: 30,
  isPM: true,
  onSelect: (time) => console.log('Selected time:', time)
});
```

---

### 12. 📑 方向感知选项卡与目标扩散水波纹 (`@material/tabs`)

* **功能定位**：具备 Sliding Indicator 动态滑块、方向感知滑动动画（左滑/右滑），并支持**以目标 Tab 按钮为原点向 Tab 内容容器全景扩散水波纹（Tab 按钮本身不显示涟漪，仅在内容容器内部显示）**。
* **引入路径**：
  * SCSS: `@import "@material/tabs/m29-tabs";`
  * JS: `import { M29Tabs } from '@material/tabs';`

#### HTML 结构
```html
<div class="m29-tabs-bar" id="myTabsBar">
  <div class="m29-tab-item is-active" onclick="switchM29Tab(0, this)">
    <i class="material-icons">widgets</i>
    <span>Tab 1</span>
  </div>
  <div class="m29-tab-item" onclick="switchM29Tab(1, this)">
    <i class="material-icons">palette</i>
    <span>Tab 2</span>
  </div>
  <div class="m29-tab-indicator" id="myTabIndicator"></div>
</div>

<!-- Tab 内容容器 (水波纹以点击 Tab 为起点在此容器内部扩散) -->
<div class="m29-tab-content-container" id="myTabContent">
  <div class="m29-tab-panel is-active" id="tab-panel-0">内容 1</div>
  <div class="m29-tab-panel" id="tab-panel-1">内容 2</div>
</div>
```

#### JavaScript 调用
```javascript
import { M29Tabs } from '@material/tabs';

// 实例化选项卡控制器
const tabs = new M29Tabs(
  document.getElementById('myTabsBar'),
  document.getElementById('myTabContent')
);
```

---

## 第二部分：官方原版组件 (0px 纯直角 & 50% 纯圆几何规范)

本部分汇总所有官方原生组件的纯直角重构版本与标准使用范例。

---

### 1. 🔲 按钮系列 (`@material/button`, `@material/fab`)

#### 普通按钮 (0px 纯直角)
```html
<!-- 文字按钮 -->
<button class="mdc-button">Flat Button</button>

<!-- 填充按钮 -->
<button class="mdc-button mdc-button--raised">Raised Button</button>

<!-- 描边按钮 -->
<button class="mdc-button mdc-button--outlined">Outlined Button</button>
```

#### 浮动操作按钮 FAB (50% 纯圆)
```html
<!-- 标准 FAB -->
<button class="mdc-fab" style="border-radius: 50% !important;">
  <i class="material-icons mdc-fab__icon">add</i>
</button>

<!-- 迷你 FAB -->
<button class="mdc-fab mdc-fab--mini" style="border-radius: 50% !important;">
  <i class="material-icons mdc-fab__icon">edit</i>
</button>

<!-- 扩展 FAB -->
<button class="mdc-fab mdc-fab--extended" style="border-radius: 28px !important; padding: 0 20px;">
  <i class="material-icons mdc-fab__icon">send</i>
  <span class="mdc-fab__label">Extended FAB</span>
</button>
```

---

### 2. 🃏 卡片系列 (`@material/card`)

```html
<div class="mdc-card" style="border-radius: 0; padding: 16px;">
  <div class="mdc-card__primary-action" style="border-radius: 0;">
    <h3 style="margin: 0 0 8px;">纯直角卡片标题</h3>
    <p style="margin: 0; opacity: 0.85;">遵循 0px 纯直角与 Elevation 深度分层规范。</p>
  </div>
  <div class="mdc-card__actions" style="margin-top: 16px;">
    <button class="mdc-button mdc-card__action mdc-card__action--button">阅读更多</button>
  </div>
</div>
```

---

### 3. 📝 输入框系列 (`@material/textfield`)

#### Filled 填充型 (带前缀图标)
```html
<div class="mdc-text-field mdc-text-field--with-leading-icon" style="width: 240px;">
  <i class="material-icons mdc-text-field__icon">edit</i>
  <input type="text" id="tf-filled" class="mdc-text-field__input" value="Google Sans Flex">
  <label class="mdc-floating-label mdc-floating-label--float-above" for="tf-filled">Filled 输入框</label>
  <div class="mdc-line-ripple"></div>
</div>
```

#### Outlined 描边型 (带前缀图标与自动缺口标签)
```html
<div class="mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon" style="width: 240px;">
  <i class="material-icons mdc-text-field__icon">tune</i>
  <input type="text" id="tf-outlined" class="mdc-text-field__input" value="Outlined Style">
  <label class="mdc-floating-label" for="tf-outlined">Outlined 框</label>
</div>
```

---

### 4. 🎚️ 选择控件 (`@material/checkbox`, `@material/radio`, `@material/switch`)

```html
<!-- 复选框 (0px 直角) -->
<div class="mdc-checkbox">
  <input type="checkbox" class="mdc-checkbox__native-control" id="cb1" checked/>
  <div class="mdc-checkbox__background" style="border-radius: 0;">
    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
      <path class="mdc-checkbox__checkmark-path" fill="none" stroke="white" d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
    </svg>
  </div>
</div>

<!-- 单选框 (纯圆) -->
<div class="mdc-radio">
  <input class="mdc-radio__native-control" type="radio" id="radio1" name="radios" checked>
  <div class="mdc-radio__background">
    <div class="mdc-radio__outer-circle"></div>
    <div class="mdc-radio__inner-circle"></div>
  </div>
</div>

<!-- MD1 经典滑动开关 -->
<label class="m29-switch">
  <input type="checkbox" checked>
  <span class="m29-switch-track"></span>
  <span class="m29-switch-thumb"></span>
</label>
```

---

### 5. 💬 模态对话框 (`@material/dialog`)

```html
<aside id="my-dialog" class="mdc-dialog" role="alertdialog" aria-labelledby="dialog-title" aria-describedby="dialog-content">
  <div class="mdc-dialog__surface" style="border-radius: 0; box-shadow: 0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14);">
    <header class="mdc-dialog__header">
      <h2 id="dialog-title" class="mdc-dialog__header__title">直角对话框标题</h2>
    </header>
    <section id="dialog-content" class="mdc-dialog__body">
      这是遵循 M2.9 直角体系的沉浸式对话框内容。
    </section>
    <footer class="mdc-dialog__footer">
      <button type="button" class="mdc-button mdc-dialog__footer__button--cancel">取消</button>
      <button type="button" class="mdc-button mdc-dialog__footer__button--accept">确认</button>
    </footer>
  </div>
  <div class="mdc-dialog__backdrop"></div>
</aside>
```

---

### 6. 🔤 Google Sans Flex 排版体系 (`@material/typography`)

全库采用官方 Google Sans Flex 可变字体（支持 `wght 100~1000`, `GRAD -200~150`, `opsz 6~144`, `ROND 0~100` 等全轴微调）。

```css
body {
  font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

| 级别 | 标签 / 类名 | 字号 | 行高 | 字重 (Weight) |
| :--- | :--- | :--- | :--- | :--- |
| **Headline 1** | `<h1>`, `.mdc-typography--headline1` | 32px | 40px | 700 (Bold) |
| **Headline 2** | `<h2>`, `.mdc-typography--headline2` | 24px | 32px | 700 (Bold) |
| **Body 1** | `<p>`, `.mdc-typography--body1` | 14px | 20px | 400 (Regular) |
| **Caption** | `<small>`, `.mdc-typography--caption` | 12px | 16px | 400 (Regular) |

---

### 7. 🌊 Android 5.0 ~ 11.0 经典页面边界水波纹 (`@material/ripple/m29-overscroll-glow`)

与 Material Ripple 涟漪完全同款风格的页面触顶/触底边界水波纹涟漪动效。

#### 核心特性：
- **纯正 Material 涟漪波纹**：遵循与按钮/Tab水波纹完全一致的实体圆形涟漪（`border-radius: 50%`，`var(--mdc-theme-primary)`），无伪造渐变光弧，纯净自然。
- **触点动态位移定位**：根据滚轮或手势在边界上的实时水平横坐标（`clientX`）对齐水波纹圆心。
- **全容器自动支持**：自动适配全局视口与页面内所有 `overflow-y: auto / scroll` 滚动容器。

```javascript
import { M29OverscrollRipple, attachOverscrollRipple } from '@material/ripple';

// 1. 全局视口自动挂载
attachOverscrollRipple();

// 2. 指定容器单独挂载
const containerRipple = new M29OverscrollRipple(document.getElementById('my-scroll-container'));
```

---

### 8. 🧭 Navigation Rail 二级菜单水波纹扩散展开 (`@material/navigation-rail`)

二级抽屉面板以点击按钮或触碰点为原点，通过 `clip-path: circle(...)` 呈现圆形水波纹向外扩展动画（Expand），返回一级菜单时以同款圆形水波纹向原点平滑收缩消退（Dismiss）。

```html
<!-- 一级菜单项 (传入 event 以获取精确水波纹圆心坐标) -->
<div class="rail-nav-item" onclick="openOverlay('catalogSubmenuPanel', event)" title="目录">
  <i class="material-icons rail-item-icon">toc</i>
  <span class="rail-item-text">目录</span>
</div>

<!-- 二级水波纹面板 -->
<div id="catalogSubmenuPanel" class="secondary-overlay-panel">
  <div class="overlay-top-bar">
    <div class="overlay-header-title">
      <button class="mdc-button mdc-button--dense" onclick="closeOverlay('catalogSubmenuPanel', event)">
        <i class="material-icons">arrow_back</i>
      </button>
      <span>组件全景目录</span>
    </div>
  </div>
  <div class="secondary-overlay-content">...</div>
</div>
```

---

### 9. 🕒 日历与时间选择器系统 (`@material/picker`)

* **功能定位**：严格遵循 Google Material Design 3 官方时钟与日期选择器规范，结合 **0px 直角与 50% 纯圆几何体系**，打造深度物理交互与视效体验。
* **引入路径**：
  * SCSS: `@import "@material/picker/mdc-picker";`
  * JS: `import { MdcDatePicker, MdcTimePicker } from '@material/picker';`

#### 核心技术特性：
1. **物理反色光栅滑块架构（Physical Inverted Indicator Mask）**：
   - 顶部数字看板采用**双层同步镜像架构**：底层为普通中性灰文本层，顶层为搭载反向 `transform: translateX(...)` 的 `overflow: hidden` 绝对定位反色光栅层。
   - 当主题色滑块在小时与分钟框之间移动时，被滑块覆盖的数字物理反色（深色模式自动根据对比度翻转为高对比度黑字 `#000000` 或纯白）。
2. **蓄力 ➔ 弹射拉伸 ➔ 缓冲过冲 ➔ 阻尼归位（Non-linear Anticipation & Cushioning）**：
   - 滑块动画长达 **0.8s (800ms)**，非线性贝塞尔曲线模拟物理形变：
     - **0%~20% 蓄力（Anticipation）**：滑块向移动反方向产生微小挤压蓄力；
     - **20%~60% 弹射与动态拉伸（Stretch & Launch）**：中途宽度扩展放大（如从 62px 膨胀至 84px），呈现高速流体拉伸张力；
     - **60%~85% 缓冲与过冲（Cushioning & Overshoot）**：抵达目标边界产生轻微过冲缓冲；
     - **85%~100% 阻尼归位（Settle）**：宽度平滑收敛回 62px 并精确吸附。
3. **极速打断动效（52% Duration Reverse Interrupt）**：
   - 在小时切换完成后的 0.3s 等待或 0.8s 滑块行进中，若用户再次触碰表盘小时区域，动画以当前进度即时反向倒放，且倒放时长按 `52%` 加速折算，实现极速跟手打断，零顿挫零跳帧。
4. **严格时序协同（Sequential Animation Pipeline）**：
   - 拖拽小时表盘松手 ➔ **1. 完整播放小时数字纵向滚动（~260ms）** ➔ **2. 执行完毕静止等待 0.3s (300ms)** ➔ **3. 启动 0.8s (800ms) 物理滑块反色过渡** ➔ **4. 自动无缝进入分钟表盘**。
5. **分钟模式绝对锁定与精确匹配**：
   - 24 小时制基准刻度 `[0, 3, 6, 9, 12, 15, 18, 21]`（360°/24 = 15°/小时）；
   - 分钟基准刻度 `[0, 5, 10, 15.. 55]`（360°/60 = 6°/分钟），搭载**方向感知迟滞跟随算法**（顺时针在第 3 格切换，逆时针在第 2 格切换）；
   - 一旦表盘完成过渡转入分钟模式，再次触碰/拖动表盘**绝对锁定在分钟模式，指针与角度精确对应 60 分钟刻度，绝不回退**。
6. **AM/PM 切换采用 Primary 主色规范**：
   - AM/PM 激活态采用主色（`--mdc-theme-primary` / `--mdc-theme-on-primary`），与时钟核心时分选框保持完全同一的高级视觉焦点。

#### JavaScript 调用示例
```javascript
import { MdcTimePicker, MdcDatePicker } from '@material/picker';

// 实例化时间选择器
const timePicker = new MdcTimePicker(document.querySelector('.mdc-time-picker'), {
  initialHour: 9,
  initialMinute: 30,
  is24Hour: true,
  onChange: ({ hour, minute, isPM }) => {
    console.log(`当前时间更新: ${hour}:${minute} (PM: ${isPM})`);
  }
});

// 实例化日期选择器
const datePicker = new MdcDatePicker(document.querySelector('.mdc-date-picker'), {
  initialDate: new Date(),
  onSelect: (selectedDate) => {
    console.log(`选定日期: ${selectedDate.toLocaleDateString()}`);
  }
});
```

---

### 10. 🎨 Google Material Design 3 (M3) 三色体系与全局样式规范 (M3 3-Color System & Tokens)

在 Material Design 3 官方体系中，色彩不是简单的单色调配，而是按照 **Primary (主色)**、**Secondary (次色)** 和 **Tertiary (第三色)** 及其衍生容器构建的严密层级网络。

#### 1. 三色语义与设计职责

| 色彩角色 | HCT / 算法定位 | 设计语义与职责 | 对应官方组件示例 |
| :--- | :--- | :--- | :--- |
| **Primary (主色)** | 核心种子色 (Tone 40/80) | **主导行动点**：页面最高视觉层级、核心控件焦点。 | 凸起按钮 (Raised/Filled)、FAB 悬浮按钮、时钟指针、单选日历选中圆点、**时钟选择器「上午 / 下午 (AM/PM)」激活项**。 |
| **Primary Container** | 浅层/深层低强容器 (Tone 90/30) | **主色容器**：核心信息块底色、高调选框。 | 时分数字看板激活底座。 |
| **Secondary (次色)** | 主色同相、极低彩度 (Muted) | **辅助平衡**：低视觉冲击力，不喧宾夺主，保持与主色和谐共存。 | 次级开关、未激活滑块轨道、复选框。 |
| **Secondary Container** | 低饱和容器 (Tone 90/30) | **伴生组件激活态**：柔和、耐看的次级高亮。 | **Navigation Rail 激活指示药丸**、**Segmented Button 分段按钮已选项**、**Filter Chips 过滤标签已选项**、日期范围选择区间。 |
| **Tertiary (第三色)** | 偏移 60°~120° 的补色/对比色 | **对比强调与个性表达**：平衡冷暖感，为独立功能提供视觉跳脱感。 | 通知小红点 / 数字徽标 (Badges)、特殊提示横条。 |
| **Tertiary Container** | 对比色容器 (Tone 90/30) | **功能分区容器**：与主工作流形成鲜明对比但不过于刺眼。 | 警告提示盒、特殊标定卡片。 |

#### 2. 全局 CSS 变量规范

本项目已将全套 M3 官方 Token 同步写入 `@material/theme/_variables.scss`、`mdc-theme.scss` 以及全局 `:root` / `.dark-theme` 中：

```scss
:root {
  /* Primary 主色系 */
  --mdc-theme-primary: #6750a4;
  --mdc-theme-primary-container: #eaddff;
  --mdc-theme-on-primary: #ffffff;
  --mdc-theme-on-primary-container: #21005d;

  /* Secondary 次色系 */
  --mdc-theme-secondary: #625b71;
  --mdc-theme-secondary-container: #e8def8;
  --mdc-theme-on-secondary: #ffffff;
  --mdc-theme-on-secondary-container: #1d192b;

  /* Tertiary 第三色系 */
  --mdc-theme-tertiary: #7d5260;
  --mdc-theme-tertiary-container: #ffd8e4;
  --mdc-theme-on-tertiary: #ffffff;
  --mdc-theme-on-tertiary-container: #31111d;

  /* Surface 表面与容器 */
  --mdc-theme-background: #fdf8fd;
  --mdc-theme-surface: #ffffff;
  --mdc-theme-on-surface: #1d1b20;
  --mdc-theme-surface-container: #ffffff;
  --mdc-theme-surface-container-high: #f7f2fa;
}

/* 官方原生暗色模式 (Dark Theme Tone 映射) */
.dark-theme {
  --mdc-theme-primary: #d0bcff;
  --mdc-theme-primary-container: #4f378b;
  --mdc-theme-on-primary: #000000;
  --mdc-theme-on-primary-container: #eaddff;

  --mdc-theme-secondary: #ccc2dc;
  --mdc-theme-secondary-container: #4a4458;
  --mdc-theme-on-secondary: #000000;
  --mdc-theme-on-secondary-container: #e8def8;

  --mdc-theme-tertiary: #efb8c8;
  --mdc-theme-tertiary-container: #633b48;
  --mdc-theme-on-tertiary: #000000;
  --mdc-theme-on-tertiary-container: #ffd8e4;

  --mdc-theme-background: #1f1e24;
  --mdc-theme-surface: #19181e;
  --mdc-theme-on-surface: #e6e1e5;
  --mdc-theme-surface-container: #131217;
  --mdc-theme-surface-container-high: #0d0c10;
}
```

#### 3. 全局辅助类 (Utility Classes)

在 SCSS 中引入 `@import "@material/theme/mdc-theme";` 后，可直接使用以下实用类：
- `.mdc-theme--primary-bg` / `.mdc-theme--on-primary`
- `.mdc-theme--secondary-bg` / `.mdc-theme--on-secondary`
- `.mdc-theme--tertiary-bg` / `.mdc-theme--on-tertiary`
- `.mdc-theme--primary-container-bg` / `.mdc-theme--on-primary-container`
- `.mdc-theme--secondary-container-bg` / `.mdc-theme--on-secondary-container`
- `.mdc-theme--tertiary-container-bg` / `.mdc-theme--on-tertiary-container`

---

#### 4. 色彩维度自由配置体系 (1 / 2 / 3 色动态切换机制)

为了在“Google M3 官方多色层级”与“极简主义纯净单色调”之间取得完美平衡，项目提供了全局**色彩方案维度 (Color Palette Dimensions)** 可配置项，支持用户在设置抽屉面板与莫奈色彩实验室中随时无缝切换：

1. **1色·单色极致模式 (`mode = 1`，默认纯净模式)**：
   - **特点**：次色与第三色全量收敛为主色，所有容器（Container）统一采用主色衍生容器。
   - **视觉效果**：Navigation Rail 药丸、Segmented Button、Chips、TimePicker AM/PM 等所有交互元素完全统一在同一高雅单色系中，告别多色杂乱，视觉极其纯净高级。
2. **2色·双色中阶平衡模式 (`mode = 2`)**：
   - **特点**：采用 Primary（主色）+ 同相低彩度 Secondary（次色），第三色自动并入次色。
   - **视觉效果**：主行动点与指针为高饱和主色，常驻侧边栏与次级控件为低饱和内敛次色，沉稳耐看。
3. **3色·三色全阶对比模式 (`mode = 3`)**：
   - **特点**：完整呈现 Google Material Design 3 官方全阶标准，第三色产生 +60°~120° 色相对比。
   - **视觉效果**：AM/PM 切换与徽标使用 Tertiary Container，与主色时分形成鲜明的跨维度功能视觉分区。

##### API 调用与配置：
```javascript
// 切换色彩方案维度 (1: 单色统一, 2: 双色平衡, 3: 三色对比)
setColorPaletteMode(1);
```

