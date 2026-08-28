# MDUI (MD1 纯直角&圆形版 + 莫奈取色双主题系统) 使用指南

欢迎使用经过深度改造的 **MDUI 组件库**！

本版本在保持 MDUI 轻量、高性能特性的基础上，完成了两大重磅升级：
1. **视觉语言回归与统一**：严格遵循 **Material Design 1 (Android 5.0 - 8.0 Lollipop 到 Oreo 时代)** 的经典 **「纯直角 & 圆形」** 几何美学规范，默认排版字体全面升级为 Google 官方 **Google Sans Flex** 变量字体；
2. **双主题系统并存**：内置基于 Google **HCT 色彩空间**与 **CAM16** 色貌模型的 **莫奈（Monet / Material You）动态取色引擎**，并与 MDUI 原生 **19 色调色板系统** 完美并存，支持全局/局部容器自由切换与独立渲染。

---

## 目录
- [一、快速引入](#一快速引入)
- [二、MD1 纯直角 & 圆形视觉规范](#二md1-纯直角--圆形视觉规范)
- [三、主题系统一：MD 原生 19 色系统](#三主题系统一md-原生-19-色系统)
- [四、主题系统二：莫奈（Monet）动态取色系统](#四主题系统二莫奈monet动态取色系统)
- [五、双主题并存与局部隔离](#五双主题并存与局部隔离)
- [六、API 完整参考 (mdui.monet)](#六api-完整参考-mduimonet)
- [七、演示 Demo](#七演示-demo)

---

## 一、快速引入

### 1. 静态 HTML 引入 (UMD / Global)
将 `css/`, `js/`, `fonts/`, `icons/` 目录置于项目中：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <!-- 引入样式 (已包含 Google Sans Flex 字体声明与纯直角/圆形规范) -->
  <link rel="stylesheet" href="./css/mdui.min.css">
</head>
<body class="mdui-theme-primary-indigo mdui-theme-accent-pink">

  <!-- 你的 HTML 内容 -->

  <!-- 引入 JS (包含全部组件逻辑与 mdui.monet 动态取色引擎) -->
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
| **卡片 Card** | `.mdui-card` | **纯直角 (`0px`)** | 经典直角卡片与阴影 |
| **对话框 Dialog** | `.mdui-dialog` | **纯直角 (`0px`)** | 经典居中弹窗 |
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

  <!-- 使用主题主色背景与文字 -->
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">主色按钮</button>
  <button class="mdui-btn mdui-btn-raised mdui-color-theme-accent">强调色按钮</button>
  <span class="mdui-text-color-theme">主色文字</span>

</body>
```

### 2. 19 种主色列表
`amber`, `blue`, `blue-grey`, `brown`, `cyan`, `deep-orange`, `deep-purple`, `green`, `grey`, `indigo`, `light-blue`, `light-green`, `lime`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow`。

### 3. 暗色模式 (Dark Theme)
在容器上添加 `.mdui-theme-layout-dark`：
```html
<body class="mdui-theme-primary-indigo mdui-theme-layout-dark">
```

---

## 四、主题系统二：莫奈（Monet）动态取色系统

莫奈取色系统基于 Google **Material Color Utilities (HCT & CAM16)** 算法，支持根据给定的种子颜色或从任意图片壁纸中采样提取主色，并动态生成 5 组 Tonal Palettes（色调阶度 50~900 及 A100~A700），通过 CSS 变量驱动整个页面的组件色彩。

### 1. 从颜色代码一键设置莫奈主题
```javascript
// 设置任意十六进制颜色作为莫奈种子色
mdui.monet.setColor('#6750A4');

// 启用暗色模式
mdui.monet.setColor('#6750A4', { dark: true });
```

### 2. 从图片壁纸中自动提取并应用莫奈主题
莫奈引擎内置了图像色彩量化与评分算法（`QuantizerCelebi` + `Score`），能够自动过滤杂色并选取最和谐的视觉基调：

```javascript
// 方式 A：传入 HTMLImageElement 或 Canvas
const img = document.querySelector('#my-wallpaper');
const theme = await mdui.monet.fromImage(img);
console.log('提取到的种子色:', theme.sourceColor);

// 方式 B：传入图片 URL 字符串
await mdui.monet.fromImage('https://example.com/wallpaper.jpg');
```

### 3. 动态切换亮色 / 暗色模式
```javascript
// 切换暗色
mdui.monet.setDarkMode(true);

// 切换亮色
mdui.monet.setDarkMode(false);
```

### 4. 重置并切回原生 19 色系统
```javascript
// 清除当前 DOM 上的莫奈主题变量，无缝切回 MD 19 色
mdui.monet.reset();
```

---

## 五、双主题并存与局部隔离

原生 19 色系统与莫奈取色系统支持**完全独立**地在同屏不同容器中共存：

```html
<!-- 容器 A：使用原生 19 色系统 -->
<div class="mdui-theme-primary-teal mdui-theme-accent-orange">
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">
    原生 Teal 按钮
  </button>
</div>

<!-- 容器 B：使用莫奈动态取色系统 -->
<div id="monet-container" class="mdui-theme-monet">
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">
    莫奈动态主色按钮
  </button>
</div>

<script>
  // 只将莫奈主题应用到容器 B，容器 A 完全不受影响
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
| `mdui.monet.generateTheme(sourceColor)` | `sourceColor: string \| number` | `ThemeObject` | 计算并返回完整的 Tonal Palettes、Schemes、MDUI 阶度色板对象（不修改 DOM） |
| `mdui.monet.applyTheme(theme, options)` | `theme: ThemeObject`<br>`options: { target?, dark? }` | `void` | 将计算出的主题对象以 CSS 变量形式注入指定 DOM |
| `mdui.monet.reset(target?)` | `target?: HTMLElement` | `void` | 移除 `.mdui-theme-monet` 及相关 CSS 变量，恢复原生主题 |
| `mdui.monet.getTheme()` | 无 | `ThemeObject \| null` | 获取当前活跃的莫奈主题数据 |
| `mdui.monet.getSourceColor()` | 无 | `string` | 获取当前的种子颜色 Hex |
| `mdui.monet.isDarkMode()` | 无 | `boolean` | 获取当前是否处于暗色模式 |
| `mdui.monet.argbFromHex(hex)` | `hex: string` | `number` | 辅助工具：十六进制颜色转 ARGB 整型 |
| `mdui.monet.hexFromArgb(argb)` | `argb: number` | `string` | 辅助工具：ARGB 整型转十六进制颜色 |

---

## 七、演示 Demo

在浏览器中打开根目录下的 `demo.html` 即可直观体验：
- 纯直角卡片、对话框、菜单与纯圆 FAB、单选框、开关组件的交互；
- 原生 19 色主色与暗色模式无缝切换；
- 莫奈动态拾色器、预置 Material You 经典配色、本地壁纸上传取色及 Tonal Palettes 色阶可视化；
- 双主题同屏局部隔离并存效果。
