import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

const __dirname = path.resolve();

// 1. Build Monet bundle (IIFE)
console.log('1. Building Monet core engine...');
await esbuild.build({
  entryPoints: ['src/monet.js'],
  bundle: true,
  format: 'iife',
  globalName: 'mdui_monet_bundle',
  outfile: 'dist/monet.iife.js',
  minify: false
});

const monetIifeRaw = fs.readFileSync('dist/monet.iife.js', 'utf8');

// 2. Modify and update CSS
console.log('2. Updating CSS (Google Sans Flex + Pure Angular & Circle + Monet Dynamic Colors + Tab Content Animation + Isolation + Menu Fix)...');
let css = fs.readFileSync('css/mdui.css', 'utf8');

// A. Replace font-family: Roboto with Google Sans Flex
css = css.replace(
  /font-family:\s*Roboto,\s*Noto,\s*Helvetica,\s*Arial,\s*sans-serif;/g,
  "font-family: 'Google Sans Flex', 'GoogleSansFlex', Roboto, Noto, Helvetica, Arial, sans-serif;"
);

// Replace Roboto @font-face block with Google Sans Flex @font-face
const robotoFontFaceRegex = /\/\*\*\s*\n\s*\* =+\s*\n\s*\* \*+   Roboto 字体   \*+\s*\n\s*\* =+\s*\n\s*\*\/[\s\S]*?src:\s*local\('Roboto BlackItalic'\)[\s\S]*?\}/;

const googleSansFlexFontFace = `/**
 * =============================================================================
 * ************   Google Sans Flex 字体   ************
 * =============================================================================
 */
@font-face {
  font-family: 'Google Sans Flex';
  font-style: normal;
  font-weight: 100 1000;
  font-stretch: 100%;
  font-display: swap;
  src: local('Google Sans Flex'), local('GoogleSansFlex'),
       url('../fonts/google-sans-flex/GoogleSansFlex.woff2') format('woff2'),
       url('../fonts/google-sans-flex/GoogleSansFlex.ttf') format('truetype');
}
@font-face {
  font-family: 'GoogleSansFlex';
  font-style: normal;
  font-weight: 100 1000;
  font-stretch: 100%;
  font-display: swap;
  src: local('Google Sans Flex'), local('GoogleSansFlex'),
       url('../fonts/google-sans-flex/GoogleSansFlex.woff2') format('woff2'),
       url('../fonts/google-sans-flex/GoogleSansFlex.ttf') format('truetype');
}`;

if (robotoFontFaceRegex.test(css)) {
  css = css.replace(robotoFontFaceRegex, googleSansFlexFontFace);
}

// B. MD1 Pure Angular & Circle transformation
css = css.replace(/border-radius:\s*2px;/g, 'border-radius: 0;');

// C. Fix Drawer Top under Appbar for all screens including ultra-wide desktop
const drawerAppbarFix = `
/* =============================================================================
 * 侧边栏三大形态系统 (1. 边缘悬浮唤出 / 2. 固定单图标 Rail / 3. 原版侧边栏)
 * ============================================================================= */
.mdui-drawer {
  top: 0 !important;
  height: 100% !important;
  margin: 0 !important;
  border-radius: 0 !important;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 屏幕最左侧悬浮感应热区 (用于模式 1: 边缘悬浮唤出) */
#drawer-edge-hover-zone {
  position: fixed;
  top: 0;
  left: 0;
  width: 16px;
  height: 100%;
  z-index: 9998;
  display: none;
  background: transparent;
}
body.drawer-mode-edge #drawer-edge-hover-zone {
  display: block;
}

/* 模式 1: 边缘悬浮唤出 (未 Hover 时完全收在屏幕外 translateX(-100%)，Hover 到边缘立即滑出并进入完整 260px 展开态) */
body.drawer-mode-edge {
  padding-left: 0 !important;
}
body.drawer-mode-edge .mdui-drawer {
  width: 260px !important;
  transform: translateX(-100%) !important;
  box-shadow: 2px 0 16px rgba(0,0,0,0.2) !important;
  z-index: 9999 !important;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
body.drawer-mode-edge .mdui-drawer.edge-hover-active {
  transform: translateX(0) !important;
  box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important;
}
/* 模式 1 展开时拥有与模式 2 展开态完全一致的全部文本与二级折叠菜单 */
body.drawer-mode-edge .mdui-drawer .drawer-header-text,
body.drawer-mode-edge .mdui-drawer .mdui-list-item-content,
body.drawer-mode-edge .mdui-drawer .mdui-collapse-item-arrow,
body.drawer-mode-edge .mdui-drawer .mdui-subheader,
body.drawer-mode-edge .mdui-drawer .drawer-footer-text {
  opacity: 1 !important;
}
body.drawer-mode-edge .mdui-drawer .drawer-rail-hidden {
  display: block !important;
}

/* 模式 2: 固定显示单图标 (Persistent Mini Rail) */
body.drawer-mode-rail .mdui-drawer {
  width: 72px !important;
  transform: translateX(0) !important;
  overflow-x: hidden !important;
  box-shadow: 1px 0 3px rgba(0,0,0,0.08) !important;
  z-index: 100 !important;
}

/* 桌面常驻时根据 Rail / Expanded 自动适配主内容左边距 */
body.drawer-mode-rail {
  padding-left: 72px !important;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
body.drawer-mode-expanded {
  padding-left: 260px !important;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (max-width: 1023.9px) {
  body.drawer-mode-rail,
  body.drawer-mode-expanded {
    padding-left: 0 !important;
  }
}

/* 仅在经典模式下桌面常驻（body-left 且非全高）时，挂载在标题栏下方 */
body.drawer-mode-classic .mdui-drawer-body-left:not(.mdui-drawer-full-height) .mdui-drawer:not(.mdui-drawer-overlay):not(.mdui-drawer-close) {
  top: 56px !important;
  height: calc(100% - 56px) !important;
}
@media (min-width: 600px) {
  body.drawer-mode-classic .mdui-drawer-body-left:not(.mdui-drawer-full-height) .mdui-drawer:not(.mdui-drawer-overlay):not(.mdui-drawer-close) {
    top: 64px !important;
    height: calc(100% - 64px) !important;
  }
}
@media (orientation: landscape) and (max-width: 959.9px) {
  body.drawer-mode-classic .mdui-drawer-body-left:not(.mdui-drawer-full-height) .mdui-drawer:not(.mdui-drawer-overlay):not(.mdui-drawer-close) {
    top: 48px !important;
    height: calc(100% - 48px) !important;
  }
}

/* 在模式 1 (边缘) 与模式 2 (Rail) 下强制 Drawer 为满高 */
body.drawer-mode-edge .mdui-drawer,
body.drawer-mode-rail .mdui-drawer {
  top: 0 !important;
  height: 100% !important;
}

/* 模式 2-A: 支持配置 Hover 后展开 (当开启 enable-hover-expand 时) */
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded {
  width: 260px !important;
  box-shadow: 4px 0 20px rgba(0,0,0,0.25) !important;
  z-index: 9999 !important;
}

/* 模式 2 下单图标收纳状态隐藏文本，展开时平滑显示 */
body.drawer-mode-rail .drawer-header-text,
body.drawer-mode-rail .mdui-list-item-content,
body.drawer-mode-rail .mdui-collapse-item-arrow,
body.drawer-mode-rail .mdui-subheader,
body.drawer-mode-rail .drawer-footer-text {
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .drawer-header-text,
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .mdui-list-item-content,
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .mdui-collapse-item-arrow,
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .mdui-subheader,
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .drawer-footer-text,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .drawer-header-text,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .mdui-list-item-content,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .mdui-collapse-item-arrow,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .mdui-subheader,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .drawer-footer-text {
  opacity: 1;
}

body.drawer-mode-rail .mdui-list-item-icon {
  margin-right: 0 !important;
  margin-left: 8px !important;
}
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .mdui-list-item-icon,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .mdui-list-item-icon {
  margin-left: 0 !important;
  margin-right: 16px !important;
}

body.drawer-mode-rail .drawer-rail-hidden {
  display: none !important;
}
body.drawer-mode-rail.drawer-hover-expand-enabled .mdui-drawer:hover .drawer-rail-hidden,
body.drawer-mode-rail .mdui-drawer.is-manually-expanded .drawer-rail-hidden {
  display: block !important;
}

/* 当启用模式 1 (边缘悬浮) 或模式 2 (单图标 Rail) 时，顶部标题栏彻底隐藏 */
body.drawer-mode-edge .mdui-appbar,
body.drawer-mode-rail .mdui-appbar {
  display: none !important;
}
body.drawer-mode-edge,
body.drawer-mode-rail {
  padding-top: 0 !important;
}

/* 侧边栏底部绝对定位固定宽度 (防止 72px 收拢时内容被挤压错乱) */
.drawer-footer-absolute {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 260px;
  background: inherit;
  z-index: 10;
}
/* 抽屉上部滚动区域需留出底部空间 */
.drawer-scroll-area {
  height: calc(100% - 150px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 侧边栏竖排文字标题系统 (writing-mode: vertical-rl) */
.rail-vertical-title {
  display: none;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 4px;
  font-size: 13px;
  font-weight: bold;
  opacity: 0.85;
  padding: 12px 0;
  margin: 0 auto;
  user-select: none;
}
/* 在模式 2 (72px 单图标收拢) 且配置为上方竖排时展示 */
body.drawer-mode-rail.title-pos-top .mdui-drawer:not(:hover):not(.is-manually-expanded) .rail-vertical-title {
  display: block !important;
}

/* 侧边栏底部横排标题展示位 */
.rail-bottom-title {
  display: none;
  font-size: 12px;
  font-weight: bold;
  opacity: 0.85;
  text-align: center;
  padding: 6px 0;
  border-top: 1px dashed rgba(0,0,0,0.08);
}
body.title-pos-bottom .rail-bottom-title {
  display: block !important;
}

/* 抽屉二级菜单缩进与样式 */
.drawer-submenu .mdui-list-item {
  padding-left: 56px !important;
  font-size: 13px !important;
}

/* 菜单图层置顶修复，防止被卡片或相邻按钮遮挡 */
.mdui-menu {
  z-index: 99999 !important;
  border-radius: 0 !important;
  box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12) !important;
}

/* 纯直角折叠面板 (Expansion Panels) */
.mdui-panel-item,
.mdui-panel-item-header,
.mdui-panel-item-body {
  border-radius: 0 !important;
}

/* 主题背景 Tab 条在宽屏/大屏响应式自适应居中与纯直角规范 */
.mdui-tab.mdui-tab-centered,
.mdui-tab-centered {
  display: -webkit-box !important;
  display: -webkit-flex !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-pack: center !important;
  -webkit-justify-content: center !important;
  -ms-flex-pack: center !important;
  justify-content: center !important;
  text-align: center !important;
}
.mdui-tab.mdui-tab-centered > a,
.mdui-tab-centered > a {
  float: none !important;
  display: -webkit-inline-box !important;
  display: -webkit-inline-flex !important;
  display: -ms-inline-flexbox !important;
  display: inline-flex !important;
}

@media (min-width: 600px) {
  .mdui-tab.mdui-tab-scrollable.mdui-tab-centered,
  .mdui-tab.mdui-tab-scrollable.mdui-tab-responsive-centered {
    display: -webkit-box !important;
    display: -webkit-flex !important;
    display: -ms-flexbox !important;
    display: flex !important;
    -webkit-box-pack: center !important;
    -webkit-justify-content: center !important;
    -ms-flex-pack: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  .mdui-tab.mdui-tab-scrollable.mdui-tab-centered > a,
  .mdui-tab.mdui-tab-scrollable.mdui-tab-responsive-centered > a {
    float: none !important;
    display: -webkit-inline-box !important;
    display: -webkit-inline-flex !important;
    display: -ms-inline-flexbox !important;
    display: inline-flex !important;
  }
}

/* MDUI Tab 绑定内容容器平滑切换动画 (Material Fade & Slide-In) */
.mdui-tab-panel-active {
  animation: mduiTabPanelFadeIn 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
}
@keyframes mduiTabPanelFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

if (!css.includes('抽屉栏在标题栏下方留空')) {
  css += '\n' + drawerAppbarFix;
} else if (!css.includes('mduiTabPanelFadeIn')) {
  css = css.replace('.mdui-menu {', '/* Tab 切换动画 */\n.mdui-tab-panel-active {\n  animation: mduiTabPanelFadeIn 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n@keyframes mduiTabPanelFadeIn {\n  0% { opacity: 0; transform: translateY(10px); }\n  100% { opacity: 1; transform: translateY(0); }\n}\n\n.mdui-menu {');
}

// D. Monet Dynamic Color Theme CSS (Placed at the VERY END with absolute priority)
const monetCssBlock = `
/**
 * =============================================================================
 * ************   Monet (Material You) 动态取色主题系统   ************
 * =============================================================================
 */
:root {
  --mdui-monet-primary: #3F51B5;
  --mdui-monet-on-primary: #FFFFFF;
  --mdui-monet-primary-container: #E8DEF8;
  --mdui-monet-on-primary-container: #1D192B;
  --mdui-monet-secondary: #625B71;
  --mdui-monet-on-secondary: #FFFFFF;
  --mdui-monet-secondary-container: #E8DEF8;
  --mdui-monet-on-secondary-container: #1D192B;
  --mdui-monet-tertiary: #7D5260;
  --mdui-monet-on-tertiary: #FFFFFF;
  --mdui-monet-tertiary-container: #FFD8E4;
  --mdui-monet-on-tertiary-container: #31111D;
  --mdui-monet-surface: #FEF7FF;
  --mdui-monet-surface-dim: #DED8E1;
  --mdui-monet-surface-bright: #FEF7FF;
  --mdui-monet-surface-container-lowest: #FFFFFF;
  --mdui-monet-surface-container-low: #F7F2FA;
  --mdui-monet-surface-container: #F3EDF7;
  --mdui-monet-surface-container-high: #ECE6F0;
  --mdui-monet-surface-container-highest: #E6E0E9;
  --mdui-monet-on-surface: #1D1B20;
  --mdui-monet-surface-variant: #E7E0EC;
  --mdui-monet-on-surface-variant: #49454F;
  --mdui-monet-background: #FEF7FF;
  --mdui-monet-on-background: #1D1B20;
  --mdui-monet-outline: #79747E;
  --mdui-monet-outline-variant: #CAC4D0;
  --mdui-monet-shadow: #000000;
  --mdui-monet-scrim: #000000;

  --mdui-monet-primary-50: #EEF0FA;
  --mdui-monet-primary-100: #D5DAF3;
  --mdui-monet-primary-200: #9FA8DA;
  --mdui-monet-primary-300: #7986CB;
  --mdui-monet-primary-400: #5C6BC0;
  --mdui-monet-primary-500: #3F51B5;
  --mdui-monet-primary-600: #3949AB;
  --mdui-monet-primary-700: #303F9F;
  --mdui-monet-primary-800: #283593;
  --mdui-monet-primary-900: #1A237E;
  --mdui-monet-accent-a100: #8C9EFF;
  --mdui-monet-accent-a200: #536DFE;
  --mdui-monet-accent-a400: #3D5AFE;
  --mdui-monet-accent-a700: #304FFE;
}

/* Monet 页面背景与文字色 (Material Web M3 Background: 亮色 Tone 98 / 暗色 Tone 10 种子优雅微醺底色) */
body.mdui-theme-monet,
.mdui-theme-monet,
body.mdui-theme-monet.mdui-theme-layout-dark,
.mdui-theme-monet.mdui-theme-layout-dark,
.mdui-theme-monet .mdui-theme-layout-dark {
  background-color: var(--mdui-monet-background) !important;
  color: var(--mdui-monet-on-background) !important;
}

/* Monet 标题栏 (Appbar & Toolbar) 动态主色着色 (最高优先级) */
body.mdui-theme-monet .mdui-appbar,
.mdui-theme-monet .mdui-appbar,
.mdui-theme-monet .mdui-appbar .mdui-toolbar,
.mdui-theme-monet .mdui-toolbar.mdui-color-theme,
.mdui-theme-monet.mdui-toolbar.mdui-color-theme,
body.mdui-theme-monet .mdui-toolbar.mdui-color-theme {
  background-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
  color: var(--mdui-monet-on-primary, #ffffff) !important;
}

/* Monet 卡片着色 (Material Web M3 Surface Container: 亮色 Tone 94 / 暗色 Tone 12，带精美 Outline 边框) */
.mdui-theme-monet .mdui-card,
.mdui-theme-monet.mdui-card,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-card,
.mdui-theme-monet .mdui-theme-layout-dark .mdui-card {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
  border: 1px solid var(--mdui-monet-outline-variant, rgba(0, 0, 0, 0.08)) !important;
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12) !important;
}
.mdui-theme-monet .mdui-card-header-subtitle,
.mdui-theme-monet .mdui-card-primary-subtitle {
  color: var(--mdui-monet-on-surface-variant) !important;
}

/* Monet 抽屉栏、对话框、菜单、折叠面板着色 (MD3 Surface Container Hierarchy) */
.mdui-theme-monet .mdui-drawer,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-drawer {
  background-color: var(--mdui-monet-surface-container-low, var(--mdui-monet-surface)) !important;
  color: var(--mdui-monet-on-surface) !important;
  border-right: 1px solid var(--mdui-monet-outline-variant, rgba(0, 0, 0, 0.08)) !important;
}
.mdui-theme-monet .mdui-dialog,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-dialog {
  background-color: var(--mdui-monet-surface-container-high) !important;
  color: var(--mdui-monet-on-surface) !important;
  border: 1px solid var(--mdui-monet-outline-variant, rgba(0, 0, 0, 0.1)) !important;
}
.mdui-theme-monet .mdui-menu,
.mdui-theme-monet .mdui-select-menu,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-menu {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
  border: 1px solid var(--mdui-monet-outline-variant, rgba(0, 0, 0, 0.08)) !important;
}
.mdui-theme-monet .mdui-panel-item,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-panel-item {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
  border: 1px solid var(--mdui-monet-outline-variant, rgba(0, 0, 0, 0.06)) !important;
}
.mdui-theme-monet .mdui-table,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-table {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
  border: 1px solid var(--mdui-monet-outline-variant, rgba(0, 0, 0, 0.08)) !important;
}

/* Monet 全局主色与强调色强制优先注入 (亮色使用 Tone 40，暗色使用明亮柔和的 Tone 80 与深色文字 Tone 20) */
body.mdui-theme-monet .mdui-color-theme,
.mdui-theme-monet .mdui-color-theme,
.mdui-theme-monet.mdui-color-theme {
  background-color: var(--mdui-monet-primary-main, var(--mdui-monet-primary)) !important;
  color: var(--mdui-monet-primary-contrast, var(--mdui-monet-on-primary, #ffffff)) !important;
}

body.mdui-theme-monet .mdui-color-theme-accent,
.mdui-theme-monet .mdui-color-theme-accent,
.mdui-theme-monet.mdui-color-theme-accent {
  background-color: var(--mdui-monet-accent-main, var(--mdui-monet-tertiary, #ff4081)) !important;
  color: var(--mdui-monet-accent-contrast, var(--mdui-monet-on-tertiary, #ffffff)) !important;
}

body.mdui-theme-monet .mdui-text-color-theme,
.mdui-theme-monet .mdui-text-color-theme,
.mdui-theme-monet.mdui-text-color-theme {
  color: var(--mdui-monet-primary-main, var(--mdui-monet-primary)) !important;
}
body.mdui-theme-monet .mdui-text-color-theme-accent,
.mdui-theme-monet .mdui-text-color-theme-accent,
.mdui-theme-monet.mdui-text-color-theme-accent {
  color: var(--mdui-monet-accent-main, var(--mdui-monet-tertiary, #ff4081)) !important;
}

/* 暗色模式下标题栏与各组件配色联动 */
body.mdui-theme-monet.mdui-theme-layout-dark .mdui-appbar,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-appbar,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-toolbar.mdui-color-theme,
body.mdui-theme-monet.mdui-theme-layout-dark .mdui-toolbar.mdui-color-theme {
  background-color: var(--mdui-monet-surface-container-high, #2b2930) !important;
  color: var(--mdui-monet-on-surface, #e6e1e5) !important;
  border-bottom: 1px solid var(--mdui-monet-outline-variant, rgba(255, 255, 255, 0.08)) !important;
}

/* Monet 阶度色彩 classes */
.mdui-theme-monet .mdui-color-theme-50 { background-color: var(--mdui-monet-primary-50) !important; }
.mdui-theme-monet .mdui-color-theme-100 { background-color: var(--mdui-monet-primary-100) !important; }
.mdui-theme-monet .mdui-color-theme-200 { background-color: var(--mdui-monet-primary-200) !important; }
.mdui-theme-monet .mdui-color-theme-300 { background-color: var(--mdui-monet-primary-300) !important; }
.mdui-theme-monet .mdui-color-theme-400 { background-color: var(--mdui-monet-primary-400) !important; }
.mdui-theme-monet .mdui-color-theme-500 { background-color: var(--mdui-monet-primary-500) !important; }
.mdui-theme-monet .mdui-color-theme-600 { background-color: var(--mdui-monet-primary-600) !important; }
.mdui-theme-monet .mdui-color-theme-700 { background-color: var(--mdui-monet-primary-700) !important; }
.mdui-theme-monet .mdui-color-theme-800 { background-color: var(--mdui-monet-primary-800) !important; }
.mdui-theme-monet .mdui-color-theme-900 { background-color: var(--mdui-monet-primary-900) !important; }

.mdui-theme-monet .mdui-color-theme-a100 { background-color: var(--mdui-monet-accent-a100) !important; }
.mdui-theme-monet .mdui-color-theme-a200 { background-color: var(--mdui-monet-accent-a200) !important; }
.mdui-theme-monet .mdui-color-theme-a400 { background-color: var(--mdui-monet-accent-a400) !important; }
.mdui-theme-monet .mdui-color-theme-a700 { background-color: var(--mdui-monet-accent-a700) !important; }

.mdui-theme-monet .mdui-text-color-theme-50 { color: var(--mdui-monet-primary-50) !important; }
.mdui-theme-monet .mdui-text-color-theme-100 { color: var(--mdui-monet-primary-100) !important; }
.mdui-theme-monet .mdui-text-color-theme-200 { color: var(--mdui-monet-primary-200) !important; }
.mdui-theme-monet .mdui-text-color-theme-300 { color: var(--mdui-monet-primary-300) !important; }
.mdui-theme-monet .mdui-text-color-theme-400 { color: var(--mdui-monet-primary-400) !important; }
.mdui-theme-monet .mdui-text-color-theme-500 { color: var(--mdui-monet-primary-500) !important; }
.mdui-theme-monet .mdui-text-color-theme-600 { color: var(--mdui-monet-primary-600) !important; }
.mdui-theme-monet .mdui-text-color-theme-700 { color: var(--mdui-monet-primary-700) !important; }
.mdui-theme-monet .mdui-text-color-theme-800 { color: var(--mdui-monet-primary-800) !important; }
.mdui-theme-monet .mdui-text-color-theme-900 { color: var(--mdui-monet-primary-900) !important; }

.mdui-theme-monet .mdui-text-color-theme-a100 { color: var(--mdui-monet-accent-a100) !important; }
.mdui-theme-monet .mdui-text-color-theme-a200 { color: var(--mdui-monet-accent-a200) !important; }
.mdui-theme-monet .mdui-text-color-theme-a400 { color: var(--mdui-monet-accent-a400) !important; }
.mdui-theme-monet .mdui-text-color-theme-a700 { color: var(--mdui-monet-accent-a700) !important; }

/* 暗色模式下的背景与文字色适配 */
.mdui-theme-monet.mdui-theme-layout-dark,
.mdui-theme-monet .mdui-theme-layout-dark {
  background-color: var(--mdui-monet-background, #121212) !important;
  color: var(--mdui-monet-on-background, rgba(255, 255, 255, 0.87)) !important;
}

/* 暗色模式下的卡片色阶与阴影 */
.mdui-theme-monet.mdui-theme-layout-dark .mdui-card,
.mdui-theme-monet .mdui-theme-layout-dark .mdui-card {
  background-color: var(--mdui-monet-surface-container, #1d1b20) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5) !important;
}
.mdui-theme-monet.mdui-theme-layout-dark .mdui-dialog,
.mdui-theme-monet .mdui-theme-layout-dark .mdui-dialog,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-menu,
.mdui-theme-monet .mdui-theme-layout-dark .mdui-menu {
  background-color: var(--mdui-monet-surface-container-high, #2b2930) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
}

/* Monet 各组件动态样式 */
.mdui-theme-monet .mdui-tab-indicator {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, var(--mdui-monet-primary))) !important;
}

.mdui-theme-monet .mdui-textfield-focus .mdui-textfield-input,
.mdui-theme-monet .mdui-textfield-focus .mdui-textfield-label {
  border-bottom-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
  color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
}

.mdui-theme-monet .mdui-checkbox input[type="checkbox"]:checked + .mdui-checkbox-icon::after {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, #ff4081)) !important;
  border-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, #ff4081)) !important;
}

.mdui-theme-monet .mdui-radio input[type="radio"]:checked + .mdui-radio-icon {
  border-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, #ff4081)) !important;
}
.mdui-theme-monet .mdui-radio input[type="radio"]:checked + .mdui-radio-icon::before {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, #ff4081)) !important;
}

.mdui-theme-monet .mdui-switch input[type="checkbox"]:checked + .mdui-switch-icon {
  background-color: var(--mdui-monet-accent-a200, rgba(255, 64, 129, 0.5)) !important;
}
.mdui-theme-monet .mdui-switch input[type="checkbox"]:checked + .mdui-switch-icon::before {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-tertiary, #ff4081)) !important;
}

.mdui-theme-monet .mdui-slider-track-fill {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, #ff4081)) !important;
}
.mdui-theme-monet .mdui-slider-thumb {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-primary-500, #ff4081)) !important;
}

.mdui-theme-monet .mdui-progress-indeterminate .mdui-progress-item,
.mdui-theme-monet .mdui-progress-determinate {
  background-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
}

.mdui-theme-monet .mdui-spinner-layer-1,
.mdui-theme-monet .mdui-spinner-layer-2,
.mdui-theme-monet .mdui-spinner-layer-3,
.mdui-theme-monet .mdui-spinner-layer-4 {
  border-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
}

.mdui-theme-monet .mdui-chip {
  background-color: var(--mdui-monet-surface-variant, #e0e0e0);
  color: var(--mdui-monet-on-surface-variant, rgba(0, 0, 0, 0.87));
}

/**
 * =============================================================================
 * ************   原生 MD 19 色局部容器保护 (双主题共存隔离)   ************
 * =============================================================================
 * 仅在具有 .split-box 或 .mdui-theme-classic-isolated 的局部容器内锁定原生 19 色
 */
.split-box.mdui-theme-primary-amber .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-amber .mdui-color-theme { background-color: #FFC107 !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-primary-blue .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-blue .mdui-color-theme { background-color: #2196F3 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-blue-grey .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-blue-grey .mdui-color-theme { background-color: #607D8B !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-brown .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-brown .mdui-color-theme { background-color: #795548 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-cyan .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-cyan .mdui-color-theme { background-color: #00BCD4 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-deep-orange .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-deep-orange .mdui-color-theme { background-color: #FF5722 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-deep-purple .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-deep-purple .mdui-color-theme { background-color: #673AB7 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-green .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-green .mdui-color-theme { background-color: #4CAF50 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-grey .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-grey .mdui-color-theme { background-color: #9E9E9E !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-indigo .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-indigo .mdui-color-theme { background-color: #3F51B5 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-light-blue .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-light-blue .mdui-color-theme { background-color: #03A9F4 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-light-green .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-light-green .mdui-color-theme { background-color: #8BC34A !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-primary-lime .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-lime .mdui-color-theme { background-color: #CDDC39 !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-primary-orange .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-orange .mdui-color-theme { background-color: #FF9800 !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-primary-pink .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-pink .mdui-color-theme { background-color: #E91E63 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-purple .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-purple .mdui-color-theme { background-color: #9C27B0 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-red .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-red .mdui-color-theme { background-color: #F44336 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-teal .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-teal .mdui-color-theme { background-color: #009688 !important; color: #ffffff !important; }
.split-box.mdui-theme-primary-yellow .mdui-color-theme, .mdui-theme-classic-isolated.mdui-theme-primary-yellow .mdui-color-theme { background-color: #FFEB3B !important; color: rgba(0, 0, 0, 0.87) !important; }

/* 19 色 Accent 保护 */
.split-box.mdui-theme-accent-amber .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-amber .mdui-color-theme-accent { background-color: #FFD54F !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-blue .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-blue .mdui-color-theme-accent { background-color: #448AFF !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-cyan .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-cyan .mdui-color-theme-accent { background-color: #18FFFF !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-deep-orange .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-deep-orange .mdui-color-theme-accent { background-color: #FF6E40 !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-deep-purple .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-deep-purple .mdui-color-theme-accent { background-color: #7C4DFF !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-green .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-green .mdui-color-theme-accent { background-color: #69F0AE !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-indigo .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-indigo .mdui-color-theme-accent { background-color: #536DFE !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-light-blue .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-light-blue .mdui-color-theme-accent { background-color: #40C4FF !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-light-green .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-light-green .mdui-color-theme-accent { background-color: #B2FF59 !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-lime .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-lime .mdui-color-theme-accent { background-color: #EEFF41 !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-orange .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-orange .mdui-color-theme-accent { background-color: #FFAB40 !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-pink .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-pink .mdui-color-theme-accent { background-color: #FF4081 !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-purple .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-purple .mdui-color-theme-accent { background-color: #E040FB !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-red .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-red .mdui-color-theme-accent { background-color: #FF5252 !important; color: #ffffff !important; }
.split-box.mdui-theme-accent-teal .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-teal .mdui-color-theme-accent { background-color: #64FFDA !important; color: rgba(0, 0, 0, 0.87) !important; }
.split-box.mdui-theme-accent-yellow .mdui-color-theme-accent, .mdui-theme-classic-isolated.mdui-theme-accent-yellow .mdui-color-theme-accent { background-color: #FFFF00 !important; color: rgba(0, 0, 0, 0.87) !important; }
`;

if (!css.includes('Monet (Material You) 动态取色主题系统')) {
  css += '\n' + monetCssBlock;
} else {
  css = css.replace(/\/\*\*\s*\n\s*\* =+\s*\n\s*\* \*+   Monet \(Material You\) 动态取色主题系统[\s\S]*$/, monetCssBlock.trim());
}

fs.writeFileSync('css/mdui.css', css, 'utf8');
console.log('Saved css/mdui.css');

// Minify css
console.log('Minifying css/mdui.min.css...');
const minifiedCss = await esbuild.transform(css, { loader: 'css', minify: true });
fs.writeFileSync('css/mdui.min.css', minifiedCss.code, 'utf8');
console.log('Saved css/mdui.min.css');

// 3. Integrate Monet into JS bundles & inject Tab content animation
console.log('3. Integrating Monet & Tab content animation into JS bundles...');

function updateTabSetActiveInJs(rawJs) {
  const targetOld = `            if (index === this$1.activeIndex && !this$1.isDisabled($tab)) {
                var $target = $(targetId);
                if (!$tab.hasClass('mdui-tab-active')) {
                    this$1.triggerEvent('change', this$1.$element, {
                        index: this$1.activeIndex,
                        id: targetId.substr(1),
                    });
                    this$1.triggerEvent('show', $tab);
                    $tab.addClass('mdui-tab-active');
                    if ($target.length) {
                        $target.removeClass('mdui-tab-panel-active');
                        if ($target[0]) void $target[0].offsetWidth;
                        $target.addClass('mdui-tab-panel-active');
                    }
                }
                $target.show();
                this$1.setIndicatorPosition();
            }
            else {
                $tab.removeClass('mdui-tab-active');
                $(targetId).hide().removeClass('mdui-tab-panel-active');
            }`;

  const targetNew = `            var isHashTarget = targetId && targetId.indexOf('#') === 0 && targetId.length > 1;
            if (index === this$1.activeIndex && !this$1.isDisabled($tab)) {
                if (!$tab.hasClass('mdui-tab-active')) {
                    this$1.triggerEvent('change', this$1.$element, {
                        index: this$1.activeIndex,
                        id: isHashTarget ? targetId.substr(1) : '',
                    });
                    this$1.triggerEvent('show', $tab);
                    $tab.addClass('mdui-tab-active');
                    if (isHashTarget) {
                        try {
                            var $target = $(targetId);
                            if ($target.length) {
                                $target.removeClass('mdui-tab-panel-active');
                                if ($target[0]) void $target[0].offsetWidth;
                                $target.addClass('mdui-tab-panel-active');
                            }
                        } catch(e) {}
                    }
                }
                if (isHashTarget) {
                    try { $(targetId).show(); } catch(e) {}
                }
                this$1.setIndicatorPosition();
            }
            else {
                $tab.removeClass('mdui-tab-active');
                if (isHashTarget) {
                    try { $(targetId).hide().removeClass('mdui-tab-panel-active'); } catch(e) {}
                }
            }`;

  return rawJs.replace(targetOld, targetNew);
}

// A. js/mdui.js
let js = fs.readFileSync('js/mdui.js', 'utf8');
js = updateTabSetActiveInJs(js);

const iifeMonetInner = `
  // === Monet Dynamic Theme Module ===
  (function() {
    ${monetIifeRaw}
    if (typeof mdui_monet_bundle !== 'undefined') {
      mdui.monet = mdui_monet_bundle.monet || mdui_monet_bundle.default || mdui_monet_bundle;
    }
  })();
`;

if (!js.includes('// === Monet Dynamic Theme Module ===')) {
  js = js.replace('return mdui;', `${iifeMonetInner}\n  return mdui;`);
} else {
  js = js.replace(/\/\/ === Monet Dynamic Theme Module ===[\s\S]*?return mdui;/, `${iifeMonetInner}\n  return mdui;`);
}
fs.writeFileSync('js/mdui.js', js, 'utf8');
console.log('Saved js/mdui.js');

// B. js/mdui.esm.js
let esm = fs.readFileSync('js/mdui.esm.js', 'utf8');
esm = updateTabSetActiveInJs(esm);

const esmMonetInner = `
// === Monet Dynamic Theme Module ===
const monet = (() => {
  ${monetIifeRaw}
  return mdui_monet_bundle.monet || mdui_monet_bundle.default || mdui_monet_bundle;
})();
mdui.monet = monet;
`;

if (!esm.includes('// === Monet Dynamic Theme Module ===')) {
  esm = esm.replace('export default mdui;', `${esmMonetInner}\nexport { monet };\nexport default mdui;`);
} else {
  esm = esm.replace(/\/\/ === Monet Dynamic Theme Module ===[\s\S]*?export default mdui;/, `${esmMonetInner}\nexport { monet };\nexport default mdui;`);
}
fs.writeFileSync('js/mdui.esm.js', esm, 'utf8');
console.log('Saved js/mdui.esm.js');

// C. Minify js/mdui.min.js
console.log('Minifying js/mdui.min.js...');
const minifiedJs = await esbuild.transform(js, { minify: true });
fs.writeFileSync('js/mdui.min.js', minifiedJs.code, 'utf8');
console.log('Saved js/mdui.min.js');

console.log('All builds completed successfully!');
