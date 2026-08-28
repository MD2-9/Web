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
  dialog,
  card,
  button
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
│ 离散大头针滑块        │ @material/slider                 │ Md1Slider                   │
│ 方向感知平滑选项卡    │ @material/tabs                   │ Md1Tabs                     │
│ 双波形线性进度条      │ @material/linear-progress        │ MduiLinearProgress          │
│ 纯圆水波纹涟漪动效    │ @material/ripple                 │ createRipple, attachRipples │
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
  onSelect: ({ primary, secondary, tertiary }) => {
    MdcMonetEngine.applyTheme({ primary, secondary, tertiary });
  }
});
picker.render();
```

---

### 2. 🧭 竖向导航栏与二级覆层抽屉 (`@material/navigation-rail`)

* **功能定位**：现代桌面端 72px 紧凑单图标栏（常驻上下对仗双竖排标题），鼠标悬停或点击平滑展开为 260px 悬浮面板；支持水波纹扩散展开二级全景子菜单，内置移动端左边缘右滑唤出、静止 2.5s 浮现悬浮按钮（FAB）。
* **引入路径**：
  * SCSS: `@import "@material/navigation-rail/mdc-navigation-rail";`
  * JS: `import { MdcNavigationRail } from '@material/navigation-rail';`

#### HTML 结构
```html
<aside class="mdc-navigation-rail" id="app-rail">
  <!-- 一级主导航区 -->
  <div class="drawer-nav-section" id="drawerNavSection">
    <div class="rail-header">
      <div class="rail-header-avatar">M3</div>
      <div class="rail-header-text">MD3.1 System</div>
    </div>
    
    <!-- 顶部竖向动态标题 -->
    <div class="rail-vertical-title" id="railVerticalTitleTop">MD3.1</div>

    <nav class="rail-nav-list">
      <a href="#home" class="rail-nav-item">
        <i class="material-icons rail-item-icon">home</i>
        <span class="rail-item-text">主页</span>
      </a>
      <div class="rail-nav-item" onclick="rail.openOverlay('catalogSubmenuPanel')">
        <i class="material-icons rail-item-icon">list_alt</i>
        <span class="rail-item-text">目录</span>
      </div>
    </nav>

    <!-- 底部竖向动态标题 (精准悬浮在底部正方形上方) -->
    <div class="rail-vertical-title" id="railVerticalTitleBottom">安秋</div>

    <div class="rail-footer">
      <div class="rail-footer-text">
        <button class="mdc-button mdc-button--raised">切换主题</button>
      </div>
    </div>
  </div>

  <!-- 二级覆层抽屉 (垂直居中 ✖ 水波纹覆盖展开) -->
  <div id="catalogSubmenuPanel" class="secondary-overlay-panel">
    <div class="overlay-top-bar">
      <div class="overlay-header-title">
        <button onclick="rail.closeOverlay('catalogSubmenuPanel')"><i class="material-icons">arrow_back</i></button>
        <span>组件全景目录</span>
      </div>
    </div>
    <nav class="rail-nav-list" style="justify-content: center;">
      <a href="#buttons" class="rail-nav-item">1. 按钮与 FAB</a>
      <a href="#cards" class="rail-nav-item">2. 直角卡片</a>
    </nav>
    <div class="overlay-bottom-bar">
      <button class="mdc-button mdc-button--outlined" onclick="rail.closeOverlay('catalogSubmenuPanel')">返回一级菜单</button>
    </div>
  </div>
</aside>
```

#### JavaScript 调用
```javascript
import { MdcNavigationRail } from '@material/navigation-rail';

const rail = new MdcNavigationRail(document.getElementById('app-rail'), {
  idleTimeoutSeconds: 2.5 // 移动端静止 N 秒浮现悬浮按钮
});

// 打开 / 关闭二级覆层面板
rail.openOverlay('catalogSubmenuPanel');
rail.closeOverlay('catalogSubmenuPanel');

// 动态联动上下双竖排标题
rail.setTitles('MD3.1 · 按钮', '1. 按钮与 FAB');
```

---

### 3. 🎚️ 经典离散滑块 (`@material/slider` / `Md1Slider`)

* **功能定位**：迁移并重构 MD1 / MDUI 经典 Discrete Slider 规范。常态为精致微圆点，在悬停、聚焦或拖拽时平滑膨胀变形为**经典泪滴气泡大头针**，正向显示当前数值。
* **引入路径**：
  * SCSS: `@import "@material/slider/md1-slider";`
  * JS: `import { Md1Slider } from '@material/slider/md1-slider';`

#### HTML 结构
```html
<div class="md1-slider-container">
  <span>色阶滑块:</span>
  <div class="md1-slider" id="mySlider">
    <input type="range" min="10" max="90" value="40">
    <div class="md1-slider-track"></div>
    <div class="md1-slider-fill"></div>
    <div class="md1-slider-thumb-wrapper">
      <div class="md1-slider-thumb">
        <span>40</span>
      </div>
    </div>
  </div>
  <span id="slider-val">Tone 40</span>
</div>
```

#### JavaScript 调用
```javascript
import { Md1Slider } from '@material/slider/md1-slider';

// 实例化单个滑块
const slider = new Md1Slider(document.getElementById('mySlider'));

// 或批量自动初始化页面内全部离散滑块
Md1Slider.initAll();
```

---

### 4. 📑 方向感知平滑选项卡 (`@material/tabs` / `Md1Tabs`)

* **功能定位**：配备 Material 动态贝塞尔缓动下划线滑条，并内置**方向感知**：向右切换（前往高索引）时内容从右侧平滑滑入，向左切换（前往低索引）时内容从左侧平滑滑入。
* **引入路径**：
  * SCSS: `@import "@material/tabs/md1-tabs";`
  * JS: `import { Md1Tabs } from '@material/tabs/md1-tabs';`

#### HTML 结构
```html
<div class="md1-tabs-bar" id="myTabsBar">
  <div class="md1-tab-item is-active"><i class="material-icons">palette</i>色彩</div>
  <div class="md1-tab-item"><i class="material-icons">layers</i>卡片</div>
  <div class="md1-tab-item"><i class="material-icons">navigation</i>导航</div>
  <div class="md1-tab-indicator"></div>
</div>

<div id="myTabsContent">
  <div class="md1-tab-panel is-active">【面板 1】莫奈色彩内容</div>
  <div class="md1-tab-panel">【面板 2】直角卡片内容</div>
  <div class="md1-tab-panel">【面板 3】Navigation Rail 内容</div>
</div>
```

#### JavaScript 调用
```javascript
import { Md1Tabs } from '@material/tabs/md1-tabs';

const tabs = new Md1Tabs(
  document.getElementById('myTabsBar'),
  document.getElementById('myTabsContent')
);

// 编程式切换到第 2 个 Tab
tabs.switchTo(1);
```

---

### 5. ⏳ 双波形线性进度条 (`@material/linear-progress` / `MduiLinearProgress`)

* **功能定位**：迁移并重构 MDUI 经典双波形纯 CSS 不确定进度条（双 wave keyframes 无缝穿梭），同时支持确定型进度条平滑宽度过渡。
* **引入路径**：
  * SCSS: `@import "@material/linear-progress/mdui-linear-progress";`
  * JS: `import { MduiLinearProgress } from '@material/linear-progress/mdui-linear-progress';`

#### HTML 结构
```html
<!-- 双波形不确定型进度条 -->
<div class="mdui-progress">
  <div class="mdui-progress-indeterminate"></div>
</div>

<!-- 确定型进度条 -->
<div class="mdui-progress" id="determinateProgress">
  <div class="mdui-progress-determinate" style="width: 65%;"></div>
</div>
```

#### JavaScript 调用
```javascript
import { MduiLinearProgress } from '@material/linear-progress/mdui-linear-progress';

const progress = new MduiLinearProgress(document.getElementById('determinateProgress'));
progress.setProgress(85); // 动态更新至 85%
```

---

### 6. 💧 纯圆水波纹涟漪动效 (`@material/ripple` / `createRipple`)

* **功能定位**：支持在卡片、图片框、菜单栏及任意可点击容器上生成 50% 纯圆水波纹涟漪。点击时以点击位置为中心向外扩散，松开后平滑淡出，支持亮暗主题自适应。
* **引入路径**：
  * SCSS: `@import "@material/ripple/mdui-ripple";`
  * JS: `import { createRipple, attachRipples } from '@material/ripple/mdui-ripple';`

#### JavaScript 调用
```javascript
import { attachRipples, createRipple } from '@material/ripple/mdui-ripple';

// 自动为所有卡片与交互元素绑定水波纹
attachRipples('.demo-card, .preview-img-box, .theme-tile, .expansion-panel');

// 或在特定事件中手动触发
myElement.addEventListener('pointerdown', (e) => createRipple(e, myElement));
```

---

### 7. 📂 手风琴折叠面板 (`@material/expansion-panel`)

* **功能定位**：轻量级手风琴面板组件，包含 0px 直角外框、旋转箭头指示器与平滑内容展开折叠动画。
* **引入路径**：
  * SCSS: `@import "@material/expansion-panel/mdc-expansion-panel";`
  * JS: `import { MdcExpansionPanel } from '@material/expansion-panel';`

#### HTML 结构
```html
<div class="expansion-panel" id="myAccordion">
  <div class="expansion-header">
    <span>折叠面板标题</span>
    <i class="material-icons expansion-arrow">expand_more</i>
  </div>
  <div class="expansion-body">
    折叠面板内部丰富内容...
  </div>
</div>
```

#### JavaScript 调用
```javascript
import { MdcExpansionPanel } from '@material/expansion-panel';

// 初始化单个面板
const panel = new MdcExpansionPanel(document.getElementById('myAccordion'));

// 或批量自动初始化
MdcExpansionPanel.initAll();
```

---

### 8. 🎛️ MD1 纯正胶囊滑动开关 (`@material/switch` / `md1-switch`)

* **功能定位**：经典 MD1 滑动开关规范，7px 胶囊轨道与 50% 纯圆浮动滑块，开启时自适应莫奈主色扩散。
* **引入路径**：
  * SCSS: `@import "@material/switch/md1-switch";`

#### HTML 结构
```html
<label class="md1-switch">
  <input type="checkbox" checked>
  <span class="md1-switch-track">
    <span class="md1-switch-thumb"></span>
  </span>
  <span>开关标签文本</span>
</label>
```

---

## 第二部分：官方原生组件清单 (Official Pure MDC Components)

以下为继承自官方 MDC-Web 规范的基础原子组件，在本项目中均已**全量同步并适配 0px 纯直角与 50% 纯圆几何体系**：

| 组件名称 | NPM 包路径 | 核心 SCSS 文件 | 核心 JavaScript Class | 样式特征与定制改动 |
| :--- | :--- | :--- | :--- | :--- |
| **按钮 (Button)** | `@material/button` | `mdc-button.scss` | `MDCButton` | 默认边角重构为 `0px` 纯直角；支持 Raised, Outlined, Flat |
| **浮动按钮 (FAB)** | `@material/fab` | `mdc-fab.scss` | `MDCRipple` (FAB) | 常规与 Mini FAB 严格保持 `50%` 纯圆，Extended FAB 保持 `24px` 胶囊形 |
| **卡片 (Card)** | `@material/card` | `mdc-card.scss` | `MDCCard` | 默认 `0px` 直角边框与阴影系统，内置 Primary Action 涟漪层 |
| **标签 (Chips)** | `@material/chips` | `mdc-chips.scss` | `MDCChip`, `MDCChipSet` | 胶囊形 `16px` 标签与过滤选择集 |
| **复选框 (Checkbox)** | `@material/checkbox` | `mdc-checkbox.scss` | `MDCCheckbox` | 0px 方形选框与 SVG 勾选路径动画 |
| **单选框 (Radio)** | `@material/radio` | `mdc-radio.scss` | `MDCRadio` | 严格保持 `50%` 纯圆外环与内圈 |
| **对话框 (Dialog)** | `@material/dialog` | `mdc-dialog.scss` | `MDCDialog` | 弹窗主体 Surface 重构为 `0px` 纯直角 |
| **列表 (List)** | `@material/list` | `mdc-list.scss` | `MDCList` | 单行、双行列表项与 Graphic / Meta 插槽 |
| **菜单 (Menu)** | `@material/menu` | `mdc-menu.scss` | `MDCMenu` | 下拉弹出菜单与锚点定位 |
| **输入框 (Text Field)** | `@material/textfield` | `mdc-text-field.scss` | `MDCTextField` | 包含 Filled、Outlined 与 Floating Label 浮动标签 |
| **轻量提示 (Snackbar)** | `@material/snackbar` | `mdc-snackbar.scss` | `MDCSnackbar` | 底部提示条重构为 `0px` 直角边角 |
| **应用栏 (Top App Bar)**| `@material/top-app-bar`| `mdc-top-app-bar.scss`| `MDCTopAppBar` | 顶部导航标题栏与滚动收缩联动 |
| **栅格布局 (Layout Grid)**| `@material/layout-grid`| `mdc-layout-grid.scss`| 纯 CSS | 12 列响应式栅格系统 |
| **图像列表 (Image List)**| `@material/image-list`| `mdc-image-list.scss` | 纯 CSS | 标规格网格与瀑布流图像列表 |
| **排版 (Typography)** | `@material/typography`| `mdc-typography.scss` | 纯 CSS | 默认适配 Google Sans Flex 现代无衬线字阶 |

---

## 自动化打包与验证 (Build & Testing)

本组件库支持通过 Webpack 独立构建或作为源码子模块引入：

```bash
# 安装依赖
npm.cmd install

# 编译生成全部 CSS / JS 分发文件至 build/
npm.cmd run dist

# 启动全景展厅预览服务器 (127.0.0.1:2929)
node server.js
```
