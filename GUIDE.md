# MDUI (MD1 纯直角&圆形版 + 莫奈取色双主题系统) 使用指南

欢迎使用经过深度改造的 **MDUI 组件库**！

本版本在保持 MDUI 轻量、高性能特性的基础上，完成了两大重磅升级与全面细节修复：
1. **视觉语言回归与统一**：严格遵循 **Material Design 1 (Android 5.0 - 8.0 Lollipop 到 Oreo 时代)** 的经典 **「纯直角 & 圆形」** 几何美学规范，默认排版字体全面升级为 Google 官方 **Google Sans Flex** 变量字体；
2. **双主题系统并存与 MD3 沉浸式着色**：内置基于 Google **HCT 色彩空间**与 **CAM16** 色貌模型的 **莫奈（Monet / Material You）动态取色引擎**，支持从颜色或壁纸图片自动生成 5 组 Tonal Palettes 与完整的 MD3 Surface Container 表面体系（背景底色、卡片、抽屉栏、对话框、菜单等自动沉浸着色），并与 MDUI 原生 **19 色调色板系统** 完美并存，支持全局/局部容器自由切换与独立渲染；
3. **关键体验修复**：修复了侧边栏在超宽屏下与顶部标题栏重叠的布局 bug、修复了卡片置顶 Sticky 遮挡问题。

---

## 目录
- [一、快速引入](#一快速引入)
- [二、MD1 纯直角 & 圆形视觉规范](#二md1-纯直角--圆形视觉规范)
- [三、主题系统一：MD 原生 19 色系统](#三主题系统一md-原生-19-色系统)
- [四、主题系统二：莫奈（Monet）动态取色系统 (MD3 沉浸方案)](#四主题系统二莫奈monet动态取色系统-md3-沉浸方案)
- [五、双主题并存与局部隔离](#五双主题并存与局部隔离)
- [六、API 完整参考 (mdui.monet)](#六api-完整参考-mduimonet)
- [七、常见布局最佳实践 (Appbar / 抽屉栏 / Sticky 置顶)](#七常见布局最佳实践-appbar--抽屉栏--sticky-置顶)
- [八、演示 Demo](#八演示-demo)

---

## 一、快速引入

### 1. 静态 HTML 引入 (UMD / Global)
将 `css/`, `js/`, `fonts/`, `icons/` 目录置于项目中：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="./css/mdui.min.css">
</head>
<body class="mdui-appbar-with-toolbar mdui-theme-primary-indigo mdui-theme-accent-pink">

  <!-- 你的 HTML 内容 -->

  <script src="./js/mdui.min.js"></script>
</body>
</html>
```

### 2. ES Module (ESM) 模块化引入
```javascript
import mdui, { monet } from './js/mdui.esm.js';

// 使用原生 MDUI 方法
mdui.snackbar({ message: '欢迎使用 MDUI' });

// 使用莫奈取色
mdui.monet.setColor('#6750A4');
```

---

## 二、MD1 纯直角 & 圆形视觉规范

在 MD1 纯直角设计语言中，所有矩形容器严格采用 `border-radius: 0;`，而具有操作引导和状态标识的组件采用纯圆形（50% / Pill 胶囊），几何秩序分明：

| 组件类型 | 涉及类名 / 元素 | 形状规范 | 说明 |
| :--- | :--- | :--- | :--- |
| **卡片 Card** | `.mdui-card` | **纯直角 (`0px`)** | 经典直角卡片，自动响应 MD3 Surface 容器着色 |
| **对话框 Dialog** | `.mdui-dialog` | **纯直角 (`0px`)** | 经典居中弹窗，自动响应 MD3 高层级表面色 |
| **下拉与弹出菜单** | `.mdui-menu`, `.mdui-select-menu` | **纯直角 (`0px`)** | 直角菜单浮层 |
| **常规按钮** | `.mdui-btn`, `.mdui-btn-raised`, `.mdui-btn-group` | **纯直角 (`0px`)** | 直角 Raised / Flat 按钮 |
| **线性进度条** | `.mdui-progress` | **纯直角 (`0px`)** | 直角进度槽 |
| **提示框 / 气泡** | `.mdui-snackbar`, `.mdui-tooltip` | **纯直角 (`0px`)** | 直角消息提示 |
| **代码与键盘标签** | `.mdui-typo code`, `pre`, `kbd` | **纯直角 (`0px`)** | 直角排版修饰 |
| **复选框** | `.mdui-checkbox-icon::after` | **纯直角 (`0px`)** | 直角勾选框指示器 |
| **浮动操作按钮** | `.mdui-fab`, `.mdui-fab-mini` | **纯圆形 (`50%`)** | 纯圆浮动动作按钮 |
| **图标按钮** | `.mdui-btn-icon` | **纯圆形 (`50%`)** | 纯圆图标点击按钮 |
| **头像 / 圆形图片** | `.mdui-card-header-avatar`, `.mdui-list-item-avatar`, `.mdui-img-circle` | **纯圆形 (`50%`)** | 纯圆头像 |
| **单选框** | `.mdui-radio-icon`, `::before` | **纯圆形 (`50%`)** | 纯圆单选钮 |
| **开关 Switch** | `.mdui-switch-icon`, `::before` | **胶囊形 / 纯圆** | 药丸滑道与纯圆滑块 |
| **滑块 Slider** | `.mdui-slider-thumb` | **纯圆形 (`50%`)** | 纯圆调节手柄 |
| **环形加载器** | `.mdui-spinner` | **纯圆形 (`50%`)** | 纯圆环形旋转器 |
| **纸片 Chip** | `.mdui-chip` | **胶囊形 (`16px`)** | 内置 icon/delete 为纯圆 |

---

## 三、主题系统一：MD 原生 19 色系统

本库完全保留并兼容 MDUI 原生的 19 种调色板主色与强调色体系：

### 1. 使用方式
在 `<body>` 或任意父容器上添加对应的主题类：

```html
<!-- 设置主色为 Teal，强调色为 Deep Orange -->
<body class="mdui-theme-primary-teal mdui-theme-accent-deep-orange">

  <button class="mdui-btn mdui-btn-raised mdui-color-theme">主色按钮</button>
  <button class="mdui-btn mdui-btn-raised mdui-color-theme-accent">强调色按钮</button>
  <span class="mdui-text-color-theme">主色文字</span>

</body>
```

### 2. 19 种主色列表
`amber`, `blue`, `blue-grey`, `brown`, `cyan`, `deep-orange`, `deep-purple`, `green`, `grey`, `indigo`, `light-blue`, `light-green`, `lime`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow`。

---

## 四、主题系统二：莫奈（Monet）动态取色系统 (MD3 沉浸方案)

莫奈取色系统基于 Google **Material Color Utilities (HCT & CAM16)** 算法：
- 动态生成 5 组 Tonal Palettes（Primary, Secondary, Tertiary, Neutral, NeutralVariant）；
- **背景与卡片沉浸着色**：页面背景自动着色为 `--mdui-monet-background`，卡片着色为 `--mdui-monet-surface-container`，副标题等由 `--mdui-monet-on-surface-variant` 驱动，暗色模式下自适应呈现舒适柔和的深色调。

### 1. 从颜色代码一键设置
```javascript
// 设置任意十六进制颜色作为莫奈种子色
mdui.monet.setColor('#6750A4');

// 启用暗色模式
mdui.monet.setColor('#6750A4', { dark: true });
```

### 2. 从图片壁纸中自动提取并应用
```javascript
// 传入 HTMLImageElement / Canvas 或图片 URL
const img = document.querySelector('#wallpaper');
await mdui.monet.fromImage(img);
```

### 3. 暗色/亮色切换与重置
```javascript
// 切换暗色模式
mdui.monet.setDarkMode(true);

// 恢复 MD 原生 19 色
mdui.monet.reset();
```

---

## 五、双主题并存与局部隔离

```html
<!-- 容器 A：原生 19 色 -->
<div class="mdui-theme-primary-teal mdui-theme-accent-orange">
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">原生 Teal</button>
</div>

<!-- 容器 B：独立 Monet 动态主题 -->
<div id="monet-container" class="mdui-theme-monet">
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">莫奈动态色</button>
</div>

<script>
  mdui.monet.setColor('#9C27B0', {
    target: document.getElementById('monet-container')
  });
</script>
```

---

## 六、API 完整参考 (`mdui.monet`)

| 方法 | 参数 | 返回值 | 说明 |
| :--- | :--- | :--- | :--- |
| `mdui.monet.setColor(color, options)` | `color: string \| number`<br>`options: { target?, dark?, apply? }` | `ThemeObject` | 设置种子色（Hex/RGB/ARGB），计算调色板并可选应用到指定 DOM |
| `mdui.monet.fromImage(source, options)` | `source: HTMLImageElement \| HTMLCanvasElement \| string`<br>`options: { target?, dark? }` | `Promise<ThemeObject>` | 从图片/Canvas/URL 采样提取主色并应用莫奈主题 |
| `mdui.monet.setDarkMode(isDark, target?)` | `isDark: boolean`<br>`target?: HTMLElement` | `void` | 切换指定容器或全局的莫奈暗色/亮色方案 |
| `mdui.monet.generateTheme(sourceColor)` | `sourceColor: string \| number` | `ThemeObject` | 计算并返回包含 Palettes、MD3 Surfaces 与 Schemes 的主题对象 |
| `mdui.monet.applyTheme(theme, options)` | `theme: ThemeObject`<br>`options: { target?, dark? }` | `void` | 将计算出的主题对象以 CSS 变量形式注入指定 DOM |
| `mdui.monet.reset(target?)` | `target?: HTMLElement` | `void` | 移除 `.mdui-theme-monet` 及相关 CSS 变量，恢复原生主题 |
| `mdui.monet.getTheme()` | 无 | `ThemeObject \| null` | 获取当前活跃的莫奈主题数据 |

---

## 七、常见布局最佳实践 (Appbar / 抽屉栏 / Sticky 置顶)

### 1. 抽屉栏与固定标题栏联动
当页面使用固定 Appbar 时，建议给 `<body>` 添加 `.mdui-appbar-with-toolbar`，侧边栏在超宽屏展开时将自动在标题栏下方留出恰当空间：
```html
<body class="mdui-appbar-with-toolbar ...">
  <header class="mdui-appbar mdui-appbar-fixed">...</header>
  <div class="mdui-drawer" id="my-drawer">...</div>
</body>
```

### 2. 卡片置顶 (Sticky)
当在固定标题栏下方使用置顶卡片或面板时，将 `top` 设为 `top: 64px`（小屏 `top: 56px`）：
```css
.my-sticky-panel {
  position: -webkit-sticky;
  position: sticky;
  top: 64px;
  z-index: 400;
}
@media (max-width: 599.9px) {
  .my-sticky-panel {
    top: 56px;
  }
}
```

---

## 八、演示 Demo

在浏览器中打开根目录下的 `demo.html` 即可直观体验所有特性。
