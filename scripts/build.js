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
console.log('2. Updating CSS (Google Sans Flex + Pure Angular & Circle + Monet Dynamic Colors)...');
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
// Replace border-radius: 2px; with border-radius: 0; across rectangular components
css = css.replace(/border-radius:\s*2px;/g, 'border-radius: 0;');

// C. Append Monet Dynamic Color Theme CSS
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

/* Monet 动态主色与强调色适配 */
.mdui-theme-monet .mdui-color-theme,
.mdui-theme-monet.mdui-color-theme {
  background-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
  color: var(--mdui-monet-on-primary, #ffffff) !important;
}
.mdui-theme-monet .mdui-color-theme-accent,
.mdui-theme-monet.mdui-color-theme-accent {
  background-color: var(--mdui-monet-accent-a400, var(--mdui-monet-tertiary, #ff4081)) !important;
  color: var(--mdui-monet-on-tertiary, #ffffff) !important;
}

.mdui-theme-monet .mdui-text-color-theme,
.mdui-theme-monet.mdui-text-color-theme {
  color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
}
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
  background-color: var(--mdui-monet-background, #121212);
  color: var(--mdui-monet-on-background, rgba(255, 255, 255, 0.87));
}

/* Monet 各组件动态样式 */
.mdui-theme-monet .mdui-appbar.mdui-color-theme {
  background-color: var(--mdui-monet-primary-500, var(--mdui-monet-primary)) !important;
  color: var(--mdui-monet-on-primary, #ffffff) !important;
}

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
`;

if (!css.includes('Monet (Material You) 动态取色主题系统')) {
  css += '\n' + monetCssBlock;
}

fs.writeFileSync('css/mdui.css', css, 'utf8');
console.log('Saved css/mdui.css');

// Minify css
console.log('Minifying css/mdui.min.css...');
const minifiedCss = await esbuild.transform(css, { loader: 'css', minify: true });
fs.writeFileSync('css/mdui.min.css', minifiedCss.code, 'utf8');
console.log('Saved css/mdui.min.css');

// 3. Integrate Monet into JS bundles
console.log('3. Integrating Monet into JS bundles...');

// A. js/mdui.js
let js = fs.readFileSync('js/mdui.js', 'utf8');
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
  fs.writeFileSync('js/mdui.js', js, 'utf8');
  console.log('Saved js/mdui.js');
}

// B. js/mdui.esm.js
let esm = fs.readFileSync('js/mdui.esm.js', 'utf8');
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
  fs.writeFileSync('js/mdui.esm.js', esm, 'utf8');
  console.log('Saved js/mdui.esm.js');
}

// C. Minify js/mdui.min.js
console.log('Minifying js/mdui.min.js...');
const minifiedJs = await esbuild.transform(js, { minify: true });
fs.writeFileSync('js/mdui.min.js', minifiedJs.code, 'utf8');
console.log('Saved js/mdui.min.js');

console.log('All builds completed successfully!');
