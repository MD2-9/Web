# MDUI (MD1 纯直角&圆形版 + 莫奈取色双主题系统)

MDUI 是一个轻量级、无依赖、高性能的 Material Design 前端组件库。

本分支/版本专为 **Android 5-8 (MD1) 纯直角 & 圆形设计语言** 重构，并集成了 Google **Material Color Utilities (Monet / HCT)** 动态取色系统，与原 MD 19 色调色板系统并存。

## 特性
- 📐 **MD1 纯直角规范**：卡片、对话框、菜单、普通按钮、Snackbar、Tooltip、线性进度条等全面直角化（`border-radius: 0`）。
- ⚪ **纯圆形与胶囊规范**：FAB、图标按钮、头像、单选框、开关、滑块手柄、环形 Spinner 保持 50% 纯圆与药丸胶囊形。
- 🔤 **Google Sans Flex 变量字体**：排版全面适配 Google 官方最新可变字体。
- 🎨 **双主题系统并存**：
  - 原生 19 色主题调色板（`mdui-theme-primary-*`, `mdui-theme-accent-*`）；
  - 莫奈（Monet）动态取色引擎（`mdui.monet.setColor()`, `mdui.monet.fromImage()`），支持从颜色或图片生成 5 组 Tonal Palettes。
- ⚡ **无外部运行时依赖**：核心算法与组件打包单文件分发。

详细的使用文档与完整 API，请参阅 [GUIDE.md](./GUIDE.md)。

## 快速预览
直接在浏览器中打开 `demo.html` 即可体验。
