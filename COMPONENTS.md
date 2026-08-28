# MDC-Web · MD3.1 全组件架构与调用规范文档 (Component Catalog & API Reference)

本项目基于官方 **Material Components Web (MDC-Web v0.34.1 / Android 8 MD1 终极成熟架构)** 进行深度重构与定制扩展，融合了 **0px 纯直角 & 50% 纯圆几何骨架**、**Google Sans Flex 变量字体**、**Material You (CAM16 & HCT) 莫奈动态色彩空间引擎** 以及一系列全新现代组件。

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
  Md1Slider,
  Md1Tabs,
  MduiLinearProgress,
  createRipple,
  attachRipples,
  MduiOverscrollGlow,
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
│                               MD3.1 定制与新增组件架构                                  │
├───────────────────────┬──────────────────────────────────┬─────────────────────────────┤
│ 模块名称              │ NPM 包路径                       │ 核心导出 Class / API        │
├───────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ 莫奈动态色彩与调色盘  │ @material/monet                  │ MdcMonetEngine, Picker     │
│ 竖向导航栏 (Nav Rail) │ @material/navigation-rail        │ MdcNavigationRail           │
│ 触顶触底水波纹泛光    │ @material/ripple                 │ MduiOverscrollGlow          │
│ 纯圆目标隔离水波纹    │ @material/ripple                 │ createRipple, attachRipples │
│ 0px 纯直角分段按钮组  │ @material/segmented-button       │ segmented-button 规范       │
│ 0px 纯直角自定义下拉  │ @material/select                 │ mdc-select-custom 规范      │
│ 徽标与计数角标        │ @material/badge                  │ badge-container 规范        │
│ 0px 直角提示框        │ @material/tooltip                │ tooltip-wrapper 规范        │
│ 分割线                │ @material/divider                │ mdc-divider 规范            │
│ 离散大头针滑块        │ @material/slider                 │ Md1Slider                   │
│ 方向感知平滑选项卡    │ @material/tabs                   │ Md1Tabs                     │
│ 双波形线性进度条      │ @material/linear-progress        │ MduiLinearProgress          │
│ 手风琴折叠面板        │ @material/expansion-panel        │ MdcExpansionPanel           │
│ MD1 胶囊滑动开关      │ @material/switch                 │ md1-switch 规范             │
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

### 2. 📱 Android 5.0 ~ 11.0 触顶/触底边缘水波纹泛光 (`@material/ripple`)

* **功能定位**：完美重现 Android 5.0 (Lollipop) 至 Android 11 (R) 系统经典的 `EdgeEffect` 边缘水波纹与泛光弧线。**自动适用于全局页面视口以及所有内部可滚动容器**（如侧边栏抽屉、模态弹窗滚动区、手风琴内容区等）。
* **引入路径**：
  * SCSS: `@import "@material/ripple/mdui-overscroll-glow";`
  * JS: `import { MduiOverscrollGlow, attachOverscrollGlow } from '@material/ripple';`

#### HTML 结构 (自动挂载或手动声明)
```html
<!-- 全局视口泛光弧线 (会自动创建，亦可显式挂载) -->
<div class="md1-overscroll-glow md1-overscroll-glow--top md1-overscroll-glow--fixed">
  <div class="md1-overscroll-glow__arc"></div>
</div>
<div class="md1-overscroll-glow md1-overscroll-glow--bottom md1-overscroll-glow--fixed">
  <div class="md1-overscroll-glow__arc"></div>
</div>
```

#### JavaScript 调用
```javascript
import { attachOverscrollGlow } from '@material/ripple';

// 一键初始化全页面与所有滚动容器的边缘水波纹监听
const overscrollController = attachOverscrollGlow();

// 亦可手动触发特定容器的边缘泛光
overscrollController.triggerGlow(document.querySelector('.my-scroll-box'), true /* isTop */, 1.0 /* intensity */);
```

---

### 3. 🌊 精准隔离与速率放慢 3/5 水波纹动效 (`@material/ripple`)

* **功能定位**：将水波纹扩散速率调慢 3/5（动画时长由 0.4s 扩展至 0.65s），并实现**点击精确目标隔离**——点击按钮只有按钮产生涟漪，绝不连带触发卡片或父容器。
* **引入路径**：
  * SCSS: `@import "@material/ripple/mdui-ripple";`
  * JS: `import { createRipple, attachRipples } from '@material/ripple';`

#### HTML 结构
```html
<!-- 声明 data-mdui-ripple 即可拥有独立隔离水波纹 -->
<button class="mdc-button mdc-button--raised" data-mdui-ripple>
  Raised Button
</button>
```

#### JavaScript 调用
```javascript
import { attachRipples } from '@material/ripple';

// 初始化页面内所有带有 data-mdui-ripple 的元素
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

* **功能定位**：72px 桌面端常驻竖向导轨，支持点击一级菜单平滑唤出二级抽屉面板（进出同款统一动画 `scale(0.96) -> scale(1)` 与 `opacity 0 -> 1`）。
* **引入路径**：
  * SCSS: `@import "@material/navigation-rail/mdc-navigation-rail";`
  * JS: `import { MdcNavigationRail } from '@material/navigation-rail';`

---

### 10. 📑 方向感知选项卡与目标扩散水波纹 (`@material/tabs`)

* **功能定位**：具备 Sliding Indicator 动态滑块、方向感知滑动动画（左滑/右滑），并支持**以目标 Tab 按钮为原点向 Tab 内容容器全景扩散水波纹（Tab 按钮本身不显示涟漪，仅在内容容器内部显示）**。
* **引入路径**：
  * SCSS: `@import "@material/tabs/md1-tabs";`
  * JS: `import { Md1Tabs } from '@material/tabs';`

#### HTML 结构
```html
<div class="md1-tabs-bar" id="myTabsBar">
  <div class="md1-tab-item is-active" onclick="switchMd1Tab(0, this)">
    <i class="material-icons">widgets</i>
    <span>Tab 1</span>
  </div>
  <div class="md1-tab-item" onclick="switchMd1Tab(1, this)">
    <i class="material-icons">palette</i>
    <span>Tab 2</span>
  </div>
  <div class="md1-tab-indicator" id="myTabIndicator"></div>
</div>

<!-- Tab 内容容器 (水波纹以点击 Tab 为起点在此容器内部扩散) -->
<div class="md1-tab-content-container" id="myTabContent">
  <div class="md1-tab-panel is-active" id="tab-panel-0">内容 1</div>
  <div class="md1-tab-panel" id="tab-panel-1">内容 2</div>
</div>
```

#### JavaScript 调用
```javascript
import { Md1Tabs } from '@material/tabs';

// 实例化选项卡控制器
const tabs = new Md1Tabs(
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
<label class="md1-switch">
  <input type="checkbox" checked>
  <span class="md1-switch-track"></span>
  <span class="md1-switch-thumb"></span>
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
      这是遵循 MD3.1 直角体系的沉浸式对话框内容。
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
| **Headline 3** | `<h3>`, `.mdc-typography--headline3` | 18px | 24px | 600 (SemiBold) |
| **Body 1** | `<p>`, `.mdc-typography--body1` | 14px | 20px | 400 (Regular) |
| **Caption** | `<small>`, `.mdc-typography--caption` | 12px | 16px | 400 (Regular) |
