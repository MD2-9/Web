# Material Design 2.9 (M2.9 / MD3.1) Web Components

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Based on MDC Web](https://img.shields.io/badge/upstream-MDC%20Web%20v0.34.1-6200EE.svg)](https://github.com/material-components/material-components-web)
[![Architecture](https://img.shields.io/badge/Design-Zero--Radius%20%7C%20Monet%20%7C%20AOSP%20EdgeEffect-00796B.svg)](#-核心特性亮点)
[![Author](https://img.shields.io/badge/author-unjal-263238.svg)](https://github.com/unjal29)

**Material Design 2.9 (M2.9 / MD3.1)** 是基于 Google 官方 [Material Components for the web (MDC Web)](https://github.com/material-components/material-components-web) 深度扩展与现代演进的下一代 Web 组件库与交互展厅系统。

本项目完美融合了 **Material Design 3 (Material You)** 的动态调色哲学与 **经典 Material Design** 的严谨几何触感，为现代 Web 应用带来极具辨识度的视觉体验与极致流畅的交互动效。

---

## ✨ 核心特性亮点

### 📐 1. 极简直角几何美学 (Zero-Radius Styling)
全系组件统一采用现代直角几何语言，消除多余圆角与冗余边框，呈现硬朗、纯粹、高密度的专业界面质感。

### 🎨 2. Monet 动态取色调色盘 (Material You Theming)
- 独创 **3 步原点扩散式** Monet 调色盘取色器。
- 支持从任意色相提取主色、辅助色、容器色与暗色阶，实时驱动全站 CSS 变量与动态主题切换。
- 内置 Google Sans Flex 可变字体与本地 Material Icons 图标集，实现无外部网络依赖的完整离线呈现。

### 🌊 3. 1:1 原生 AOSP EdgeEffect 边界泛光水波纹
- 严格遵循 **Android 5-11 原生 AOSP EdgeEffect** 规范与物理状态机。
- 支持触摸/滚动坐标实时追踪、扁平弧形边缘泛光穹顶与位移动态反馈，完美还原原生移动端触顶/触底阻尼质感。

### 🧭 4. 现代化 MDC Navigation Rail 导航轨系统
- **双模式竖排动态标题**（MD3.1 / 安秋）。
- **全屏响应式抽屉**：移动端自动适配抽屉模式，桌面端优雅停靠。
- **精确对称动效**：二级菜单与一级菜单采用原地水波纹扩散展开与反向收缩动画，杜绝位移跳动。

### 🧩 5. 深度重构与全新扩展组件 (M2.9 Extensions)
除承接官方 MDC 全部基础组件外，本项目新增与重构了大量核心包：
- `@material/monet`：Monet 动态色彩提取与调色引擎。
- `@material/navigation-rail`：现代 Navigation Rail 导航轨组件。
- `@material/picker`：经典 Material 时钟/日期选择器（支持 12/24 小时制及 AM/PM 联动高亮）。
- `@material/segmented-button`：分段选择器与紧凑网格布局。
- `@material/expansion-panel`：折叠面板与手风琴容器。
- `@material/badge` & `@material/divider` & `@material/tooltip`：基础增强元器件。
- **重构组件**：
  - **Tabs**：方向感知型横向滑动水波纹与无缝切换动画。
  - **Slider**：MDUI 经典水滴气泡指针离散滑块。
  - **Switch & Chips**：支持 MD1 经典形态与 M3 胶囊几何。
  - **Text Field & Select**：纯直角缺口轮廓、前缀/后缀图标精确居中对齐。

### 🏛️ 6. 9 大模块全功能交互展厅 (Interactive Showcase)
- 涵盖 Buttons & FABs、Inputs & Forms、Navigation、Surfaces & Cards、Data Display、Feedback、Pickers 等全量控件。
- 支持手势横向滑动切换、空闲悬浮功能球、底部轻提示 (Toast) 与全网段服务监听。

### ⚡ 7. 现代极速构建与边缘计算部署
- 基于 `esbuild-sass-plugin` 的极速全量 CSS 编译管线 (`scripts/build-css.js`)。
- 原生支持 **Cloudflare Workers (Wrangler)** 边缘计算一键部署 (`worker.js`)。

---

## 🚀 快速上手

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装与启动

1. **克隆仓库与安装依赖**：
   ```bash
   git clone https://github.com/MD2-9/Web.git
   cd Web
   npm install
   ```

2. **启动本地开发展厅**（支持全网段访问与热重载）：
   ```bash
   npm run dev
   ```
   访问本地服务：`http://localhost:8080`

3. **编译全量 M2.9 CSS 样式包**：
   ```bash
   npm run build:css
   ```
   产物将输出至 `dist/m29-bundle.css`。

4. **生产构建**：
   ```bash
   npm run dist
   ```

5. **部署至 Cloudflare Workers & Pages (支持 Git 自动化部署)**：
   详情请查阅完整 [Cloudflare 部署指南](CLOUDFLARE.md)。
   ```bash
   npm run deploy
   ```

---

## 📁 核心组件包概览

| 模块包名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `@material/navigation-rail` | 🆕 扩展 | 竖排标题导航轨、多级菜单联动 |
| `@material/monet` | 🆕 扩展 | Monet 动态取色算法与全套主题变量 |
| `@material/picker` | 🆕 扩展 | Material 经典 Date & Time 时钟选择器 |
| `@material/segmented-button` | 🆕 扩展 | 分段选择按钮与紧凑布局 |
| `@material/expansion-panel` | 🆕 扩展 | 展开折叠面板容器 |
| `@material/badge` | 🆕 扩展 | 状态角标与未读徽标 |
| `@material/divider` | 🆕 扩展 | 极简直角分割线 |
| `@material/tooltip` | 🆕 扩展 | 现代文字提示悬浮气泡 |
| `@material/ripple` | ⚡ 增强 | 隔离目标精确涟漪、AOSP EdgeEffect 边缘泛光 |
| `@material/tabs` | ⚡ 增强 | 方向感知滑动扩散水波纹与指示条联动 |
| `@material/slider` | ⚡ 增强 | 水滴气泡指针离散数值滑块 |
| `@material/textfield` | ⚡ 增强 | 纯直角描边缺口、图标绝对居中 |
| `@material/button` / `fab` | ⚡ 增强 | 直角按钮、胶囊形 Extended FAB |

---

## 🛠️ 技术栈与依赖

- **样式与构建**：Sass (SCSS), PostCSS, Autoprefixer, esbuild
- **打包工具**：Webpack, Lerna, Babel (ES2015+)
- **测试框架**：Karma, Mocha, Chai, Istanbul
- **字体与图标**：Google Sans Flex (OFL-1.1), Material Icons (CC-BY 4.0 / Apache-2.0)
- **边缘部署**：Cloudflare Workers, Wrangler

---

## 📄 开源许可与致谢

本项目遵循 [Apache License 2.0](LICENSE) 开源协议。

### 上游基础
本项目基于 Google Inc. 开源项目 [material-components-web](https://github.com/material-components/material-components-web) (v0.34.1) 构建。所有未标注个人版权的原版文件保持原有 Google Inc. 声明。

### 致谢与第三方归属
本项目在演进过程中参考并融合了以下优秀开源项目的理念与实现，特此致谢：
- **[MDUI](https://github.com/zdhxiong/mdui)** (MIT License, zdhxiong) - 水滴形滑块、方向感知 Tabs 滑动及组件交互灵感。
- **[Android Open Source Project (AOSP)](https://source.android.com/)** (Apache-2.0, Google LLC) - EdgeEffect 边缘泛光水波纹状态机。
- **[Focus Trap](https://github.com/focus-trap/focus-trap)** (MIT License, David Clark) - 模态焦点捕获机制。

详细版权与引用说明请参阅 [NOTICE](NOTICE) 文件。
