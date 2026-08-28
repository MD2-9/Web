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
/* 抽屉栏在标题栏下方留空（移动端 & 桌面超宽屏适配） */
.mdui-appbar-with-toolbar .mdui-drawer:not(.mdui-drawer-full-height) {
  top: 56px !important;
}
@media (min-width: 600px) {
  .mdui-appbar-with-toolbar .mdui-drawer:not(.mdui-drawer-full-height) {
    top: 64px !important;
  }
}
@media (orientation: landscape) and (max-width: 959.9px) {
  .mdui-appbar-with-toolbar .mdui-drawer:not(.mdui-drawer-full-height) {
    top: 48px !important;
  }
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

/* 主题背景 Tab 条在宽屏/大屏响应式自适应居中 */
@media (min-width: 600px) {
  .mdui-tab.mdui-tab-scrollable,
  .mdui-tab.mdui-tab-centered {
    display: -webkit-box !important;
    display: -webkit-flex !important;
    display: -ms-flexbox !important;
    display: flex !important;
    -webkit-box-pack: center !important;
    -webkit-justify-content: center !important;
    -ms-flex-pack: center !important;
    justify-content: center !important;
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

/* Monet 页面背景与文字色 (MD3 Background: 亮色 Tone 98 / 暗色 Tone 6 优雅种子微调底色) */
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

/* Monet 卡片着色 (MD3 Surface Container: 亮色 Tone 94 / 暗色 Tone 12，绝非死灰 #212121) */
.mdui-theme-monet .mdui-card,
.mdui-theme-monet.mdui-card,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-card,
.mdui-theme-monet .mdui-theme-layout-dark .mdui-card {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
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
}
.mdui-theme-monet .mdui-dialog,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-dialog {
  background-color: var(--mdui-monet-surface-container-high) !important;
  color: var(--mdui-monet-on-surface) !important;
}
.mdui-theme-monet .mdui-menu,
.mdui-theme-monet .mdui-select-menu,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-menu {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
}
.mdui-theme-monet .mdui-panel-item,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-panel-item {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
}
.mdui-theme-monet .mdui-table,
.mdui-theme-monet.mdui-theme-layout-dark .mdui-table {
  background-color: var(--mdui-monet-surface-container) !important;
  color: var(--mdui-monet-on-surface) !important;
}

/* Monet 全局主色与强调色强制优先注入 */
body.mdui-theme-monet .mdui-color-theme,
.mdui-theme-monet .mdui-color-theme,
.mdui-theme-monet.mdui-color-theme {
  background-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
  color: var(--mdui-monet-on-primary, #ffffff) !important;
}
body.mdui-theme-monet .mdui-color-theme-accent,
.mdui-theme-monet .mdui-color-theme-accent,
.mdui-theme-monet.mdui-color-theme-accent {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-tertiary, #ff4081)) !important;
  color: var(--mdui-monet-on-tertiary, #ffffff) !important;
}

body.mdui-theme-monet .mdui-text-color-theme,
.mdui-theme-monet .mdui-text-color-theme,
.mdui-theme-monet.mdui-text-color-theme {
  color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
}
body.mdui-theme-monet .mdui-text-color-theme-accent,
.mdui-theme-monet .mdui-text-color-theme-accent,
.mdui-theme-monet.mdui-text-color-theme-accent {
  color: var(--mdui-monet-accent-a400, var(--mdui-monet-tertiary, #ff4081)) !important;
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
                if (!$tab.hasClass('mdui-tab-active')) {
                    this$1.triggerEvent('change', this$1.$element, {
                        index: this$1.activeIndex,
                        id: targetId.substr(1),
                    });
                    this$1.triggerEvent('show', $tab);
                    $tab.addClass('mdui-tab-active');
                }
                $(targetId).show();
                this$1.setIndicatorPosition();
            }
            else {
                $tab.removeClass('mdui-tab-active');
                $(targetId).hide();
            }`;

  const targetNew = `            if (index === this$1.activeIndex && !this$1.isDisabled($tab)) {
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
