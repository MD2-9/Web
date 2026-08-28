# MDUI (MD1 纯直角&圆形版 + 莫奈取色双主题系统) 使用指南

欢迎使用经过深度改造的 **MDUI 组件库**！

本版本在保持 MDUI 轻量、高性能特性的基础上，完成了两大重磅升级与全面细节修复：
1. **视觉语言回归与统一**：严格遵循 **Material Design 1 (Android 5.0 - 8.0 Lollipop 到 Oreo 时代)** 的经典 **「纯直角 & 圆形」** 几何美学规范，默认排版字体全面升级为 Google 官方 **Google Sans Flex** 变量字体；
2. **Android 12-17 莫奈（Monet）全功能动态双主题系统**：
   - 完整支持 **单色、双色亦或三色主题**（最多 3 个自定义主题色：Primary 主色、Secondary 次色、Tertiary 第三色）；
   - 壁纸图片取色支持自定义提取 **单色 / 双色 / 三色** 种子色并自动协同；
   - 包含完整的 5 组核心调色板（Accent 1/2/3, Neutral 1/2）与 MD3 Surface Container 沉浸式着色（背景底色、卡片、抽屉栏、对话框、菜单等自动着色）；
   - 支持 Android 13+ 风格变体（Tonal Spot / Vibrant / Expressive / Neutral / Rainbow / Fruit Salad / Monochrome 等）；
   - 与 MDUI 原生 **19 色调色板系统** 完美并存，支持全局/局部容器自由切换与独立隔离；
3. **关键交互与图层修复**：
   - 修复了侧边栏在超宽屏下与固定标题栏重叠的布局 bug；
   - 修复了卡片置顶 Sticky 遮挡问题；
   - 修复了直角菜单在卡片内的图层截断与遮挡 bug；
   - 修复了局部双主题并存时的 CSS 优先级穿透，原生 19 色与莫奈主题真正做到相互独立隔离。

---

## 目录
- [一、快速引入](#一快速引入)
- [二、MD1 纯直角 & 圆形视觉规范](#二md1-纯直角--圆形视觉规范)
- [三、主题系统一：MD 原生 19 色系统](#三主题系统一md-原生-19-色系统)
- [四、主题系统二：莫奈（Monet / Android 12-17）单/双/三色系统](#四主题系统二莫奈monet--android-12-17-单双三色系统)
- [五、双主题并存与局部隔离](#五双主题并存与局部隔离)
- [六、API 完整参考 (mdui.monet)](#六api-完整参考-mduimonet)
- [七、常见布局最佳实践 (Appbar / 抽屉栏 / Sticky 置顶 / 菜单)](#七常见布局最佳实践-appbar--抽屉栏--sticky-置顶--菜单)
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

// 使用莫奈取色 (单色、双色或三色)
mdui.monet.setColor(['#3F51B5', '#009688', '#FF4081']);
```

---

## 二、MD1 纯直角 & 圆形视觉规范

在 MD1 纯直角设计语言中，所有矩形容器严格采用 `border-radius: 0;`，而具有操作引导和状态标识的组件采用纯圆形（50% / Pill 胶囊），几何秩序分明：

| 组件类型 | 涉及类名 / 元素 | 形状规范 | 说明 |
| :--- | :--- | :--- | :--- |
| **卡片 Card** | `.mdui-card` | **纯直角 (`0px`)** | 经典直角卡片，自动响应 MD3 Surface 容器着色 |
| **对话框 Dialog** | `.mdui-dialog` | **纯直角 (`0px`)** | 经典居中弹窗，自动响应 MD3 高层级表面色 |
| **下拉与弹出菜单** | `.mdui-menu`, `.mdui-select-menu` | **纯直角 (`0px`)** | 直角菜单浮层，已置顶并修复图层截断 |
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

本库完全保留并保护 MDUI 原生的 19 种调色板主色与强调色体系：

```html
<!-- 设置主色为 Teal，强调色为 Deep Orange -->
<body class="mdui-theme-primary-teal mdui-theme-accent-deep-orange">

  <button class="mdui-btn mdui-btn-raised mdui-color-theme">主色按钮</button>
  <button class="mdui-btn mdui-btn-raised mdui-color-theme-accent">强调色按钮</button>
  <span class="mdui-text-color-theme">主色文字</span>

</body>
```

---

## 四、主题系统二：莫奈（Monet / Android 12-17）单/双/三色系统

### 1. 单色模式 (Single-seed)
指定一个主色，Secondary（次色）与 Tertiary（第三色）由 HCT 空间算法自动推导生成：
```javascript
mdui.monet.setColor('#6750A4');
```

### 2. 双色模式 (Dual-seed)
指定 Primary 与 Secondary 两个种子色，Tertiary 自动推导：
```javascript
mdui.monet.setColor(['#3F51B5', '#009688']);
// 或
mdui.monet.setDualColors('#3F51B5', '#009688');
```

### 3. 三色模式 (Triple-seed)
同时指定 Primary、Secondary、Tertiary 三个种子色，全自由度定制：
```javascript
mdui.monet.setColor(['#3F51B5', '#009688', '#FF4081']);
// 或
mdui.monet.setTripleColors('#3F51B5', '#009688', '#FF4081');
```

### 4. 壁纸图片自定义数量取色 (1 / 2 / 3 色)
```javascript
const img = document.querySelector('#wallpaper');

// 提取单色
await mdui.monet.fromImage(img, { count: 1 });

// 提取双色
await mdui.monet.fromImage(img, { count: 2 });

// 提取三色（默认）
await mdui.monet.fromImage(img, { count: 3 });
```

### 5. Android 13+ 风格变体 (Scheme Variants)
```javascript
// 切换风格变体：'tonal_spot' | 'vibrant' | 'expressive' | 'neutral' | 'rainbow' | 'fruit_salad' | 'monochrome'
mdui.monet.setVariant('vibrant');
```

---

## 五、双主题并存与局部隔离

原生 19 色在任何容器下均受最高优先级保护，两者可任意嵌套共存：

```html
<!-- 容器 A：原生 19 色 (不受全局莫奈任何干扰) -->
<div class="mdui-theme-primary-teal mdui-theme-accent-deep-orange">
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">原生 Teal</button>
</div>

<!-- 容器 B：独立 Monet 动态主题 -->
<div id="monet-container" class="mdui-theme-monet">
  <button class="mdui-btn mdui-btn-raised mdui-color-theme">莫奈 Primary</button>
  <button class="mdui-btn mdui-btn-raised mdui-color-theme-accent">莫奈 Accent</button>
</div>

<script>
  mdui.monet.setTripleColors('#E65100', '#00838F', '#C2185B', {
    target: document.getElementById('monet-container')
  });
</script>
```

---

## 六、API 完整参考 (`mdui.monet`)

| 方法 | 参数 | 返回值 | 说明 |
| :--- | :--- | :--- | :--- |
| `mdui.monet.setColor(colors, options)` | `colors: string \| Array \| Object`<br>`options: { target?, dark?, variant?, apply? }` | `ThemeObject` | 设置单色/双色/三色种子，计算调色板并可选应用到 DOM |
| `mdui.monet.setSingleColor(p, options)` | `p: string`, `options?` | `ThemeObject` | 便捷设置单色主题 |
| `mdui.monet.setDualColors(p, s, options)` | `p: string`, `s: string`, `options?` | `ThemeObject` | 便捷设置双色主题 |
| `mdui.monet.setTripleColors(p, s, t, options)` | `p: string`, `s: string`, `t: string`, `options?` | `ThemeObject` | 便捷设置三色主题 |
| `mdui.monet.fromImage(source, options)` | `source: HTMLImageElement \| string`<br>`options: { count?: 1\|2\|3, variant?, dark? }` | `Promise<ThemeObject>` | 从图片量化提取指定数量的种子色并应用主题 |
| `mdui.monet.setVariant(variant, target?)` | `variant: string`, `target?: HTMLElement` | `void` | 切换 Android 13+ 风格变体 |
| `mdui.monet.setDarkMode(isDark, target?)` | `isDark: boolean`, `target?: HTMLElement` | `void` | 切换暗色/亮色模式 |
| `mdui.monet.reset(target?)` | `target?: HTMLElement` | `void` | 移除莫奈样式，恢复原生主题 |

---

## 七、常见布局最佳实践 (Appbar / 抽屉栏 / Sticky 置顶 / 菜单)

1. **抽屉栏与固定标题栏联动**：给 `<body>` 添加 `.mdui-appbar-with-toolbar`，抽屉栏将自动预留顶部 64px (小屏 56px, 横屏 48px)；
2. **卡片置顶 (Sticky)**：将置顶卡片设为 `top: 64px;`（小屏 `56px`）；
3. **弹出菜单 (Menu)**：建议将 `<ul class="mdui-menu" id="xxx">` 放置在 `<body>` 直接子层级或卡片外，确保不受父级容器 `overflow: hidden` 影响，本库已将菜单图层 `z-index` 设置为最高层级。

---

## 八、演示 Demo

在浏览器中打开根目录下的 `demo.html` 即可直观体验所有单色/双色/三色自由调节、图片壁纸提取与直角/纯圆组件！
