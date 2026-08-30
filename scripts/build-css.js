//
// Copyright 2026 安秋 <github.com/unjal29>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Build script to generate compiled CSS bundle from packages
//

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve();

// List of package SCSS/CSS files in dependency order
const packageFiles = [
  'packages/mdc-theme/mdc-theme.scss',
  'packages/mdc-typography/mdc-typography.scss',
  'packages/mdc-button/mdc-button.scss',
  'packages/mdc-fab/mdc-fab.scss',
  'packages/mdc-checkbox/mdc-checkbox.scss',
  'packages/mdc-radio/mdc-radio.scss',
  'packages/mdc-card/mdc-card.scss',
  'packages/mdc-navigation-rail/mdc-navigation-rail.scss',
  'packages/mdc-mobile-drawer/mdc-mobile-drawer.scss',
  'packages/mdc-monet/mdc-monet.scss',
  'packages/mdc-ripple/m29-ripple.scss',
  'packages/mdc-ripple/m29-overscroll-glow.scss',
  'packages/mdc-slider/m29-slider.scss',
  'packages/mdc-switch/m29-switch.scss',
  'packages/mdc-tabs/m29-tabs.scss',
  'packages/mdc-linear-progress/m29-linear-progress.scss',
  'packages/mdc-expansion-panel/mdc-expansion-panel.scss',
  'packages/mdc-segmented-button/mdc-segmented-button.scss',
  'packages/mdc-badge/mdc-badge.scss',
  'packages/mdc-tooltip/mdc-tooltip.scss',
  'packages/mdc-divider/mdc-divider.scss',
  'packages/mdc-select/mdc-select.scss',
  'packages/mdc-textfield/mdc-text-field.scss',
  'packages/mdc-picker/mdc-picker.scss',
  'packages/mdc-component-panel/mdc-component-panel.scss'
];

function cleanScssToCss(content) {
  let css = content
    .replace(/@import\s+[^;]+;/g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\$mdc-[a-zA-Z0-9_-]+:[^;]+;/g, '');

  return css;
}

function build() {
  let combinedCss = `/* =============================================================== *\n` +
                    ` * Material Components for Web (MDC-Web M2.9 Global Bundle)        *\n` +
                    ` * Copyright 2026 安秋 <github.com/unjal29>                         *\n` +
                    ` * Licensed under the Apache License, Version 2.0                 *\n` +
                    ` * =============================================================== */\n\n`;

  for (const relPath of packageFiles) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      combinedCss += `\n/* --- Component: ${relPath} --- */\n`;
      combinedCss += cleanScssToCss(content) + '\n';
    }
  }

  // Demo layout helpers
  const demoLayoutCss = `
/* =============================================================== */
/* Demo Catalog & Layout Helpers                                   */
/* =============================================================== */
.main-container {
  margin-left: 72px;
  padding: 28px 36px 80px 36px;
  max-width: 1200px;
  box-sizing: border-box;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🌟 核心网格布局：宽屏自适应多列/双列，窄屏自动单列 */
.component-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
  gap: 20px !important;
  margin-top: 16px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

@media (max-width: 639.9px) {
  .main-container {
    margin-left: 0 !important;
    padding: 16px 16px 80px 16px !important;
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden;
  }

  .component-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}
`;

  combinedCss += demoLayoutCss;

  // Write outputs
  const outPaths = [
    'dist/material-components-web.css',
    'demos/index.css',
    'demos/material-components-web.css'
  ];

  for (const outPath of outPaths) {
    const fullOut = path.join(ROOT_DIR, outPath);
    const dir = path.dirname(fullOut);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullOut, combinedCss, 'utf8');
    console.log(`[CSS Built] -> ${outPath}`);
  }
}

build();
