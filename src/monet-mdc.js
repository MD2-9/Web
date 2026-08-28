//
// Copyright 2026 unjal <unjal29@outlook.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Material Components for Web (MDC-Web) - Monet Dynamic Color Engine
// Crafted by unjal <unjal29@outlook.com>
//

import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  Hct,
  QuantizerCelebi,
  Score,
  TonalPalette,
  SchemeTonalSpot,
  SchemeVibrant,
  SchemeExpressive,
  SchemeNeutral,
  SchemeRainbow,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeContent,
  SchemeFidelity,
  SchemeAndroid
} from '@material/material-color-utilities';

/**
 * Material Components for Web (MDC-Web) - Monet Dynamic Color Engine
 * Binds CAM16/HCT Dynamic Schemes directly to --mdc-theme-* CSS custom properties.
 */

function rgbaFromArgb(argb, alpha = 1) {
  const r = (argb >> 16) & 255;
  const g = (argb >> 8) & 255;
  const b = argb & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseColorToArgb(color) {
  if (typeof color === 'number') return color;
  if (typeof color === 'string') {
    const trimmed = color.trim();
    if (trimmed.startsWith('#')) return argbFromHex(trimmed);
    const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return (255 << 24) | (r << 16) | (g << 8) | b;
    }
    return argbFromHex(trimmed);
  }
  throw new Error('Unsupported color: ' + color);
}

function createMd3Surfaces(palettes, isDark = false) {
  const n = palettes.neutral || palettes.neutral1;
  const nv = palettes.neutralVariant || palettes.neutral2 || palettes.neutral;

  if (!isDark) {
    return {
      surface: hexFromArgb(n.tone(98)),
      surfaceDim: hexFromArgb(n.tone(87)),
      surfaceBright: hexFromArgb(n.tone(98)),
      surfaceContainerLowest: hexFromArgb(n.tone(100)),
      surfaceContainerLow: hexFromArgb(n.tone(96)),
      surfaceContainer: hexFromArgb(n.tone(94)),
      surfaceContainerHigh: hexFromArgb(n.tone(92)),
      surfaceContainerHighest: hexFromArgb(n.tone(90)),
      onSurface: hexFromArgb(n.tone(10)),
      surfaceVariant: hexFromArgb(nv.tone(90)),
      onSurfaceVariant: hexFromArgb(nv.tone(30)),
      background: hexFromArgb(n.tone(98)),
      onBackground: hexFromArgb(n.tone(10)),
      outline: hexFromArgb(nv.tone(50)),
      outlineVariant: hexFromArgb(nv.tone(80))
    };
  } else {
    // 暗色模式：卡片略黑于背景，背景为 Tone 20，卡片为 Tone 12
    return {
      surface: hexFromArgb(n.tone(12)),
      surfaceDim: hexFromArgb(n.tone(6)),
      surfaceBright: hexFromArgb(n.tone(24)),
      surfaceContainerLowest: hexFromArgb(n.tone(4)),
      surfaceContainerLow: hexFromArgb(n.tone(10)),
      surfaceContainer: hexFromArgb(n.tone(12)),
      surfaceContainerHigh: hexFromArgb(n.tone(10)),
      surfaceContainerHighest: hexFromArgb(n.tone(8)),
      onSurface: hexFromArgb(n.tone(90)),
      surfaceVariant: hexFromArgb(nv.tone(30)),
      onSurfaceVariant: hexFromArgb(nv.tone(80)),
      background: hexFromArgb(n.tone(20)),
      onBackground: hexFromArgb(n.tone(90)),
      outline: hexFromArgb(nv.tone(60)),
      outlineVariant: hexFromArgb(nv.tone(30))
    };
  }
}

const variantConstructors = {
  tonal_spot: SchemeTonalSpot,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  neutral: SchemeNeutral,
  rainbow: SchemeRainbow,
  fruit_salad: SchemeFruitSalad,
  monochrome: SchemeMonochrome,
  content: SchemeContent,
  fidelity: SchemeFidelity,
  android: SchemeAndroid
};

export class MdcMonetEngine {
  static generateTheme(colorInput, options = {}) {
    const isDark = Boolean(options.dark);
    const variantName = options.variant || 'tonal_spot';

    let primaryArgb;
    let secondaryArgb = null;
    let tertiaryArgb = null;

    if (typeof colorInput === 'object' && colorInput !== null && !Array.isArray(colorInput)) {
      primaryArgb = parseColorToArgb(colorInput.primary || '#6200ee');
      if (colorInput.secondary) secondaryArgb = parseColorToArgb(colorInput.secondary);
      if (colorInput.tertiary) tertiaryArgb = parseColorToArgb(colorInput.tertiary);
    } else {
      primaryArgb = parseColorToArgb(colorInput || '#6200ee');
    }

    const primaryHct = Hct.fromInt(primaryArgb);
    const SchemeClass = variantConstructors[variantName] || SchemeTonalSpot;
    const dynamicScheme = new SchemeClass(primaryHct, isDark, 0.0);

    const primaryPalette = secondaryArgb ? TonalPalette.fromInt(primaryArgb) : dynamicScheme.primaryPalette;
    const secondaryPalette = secondaryArgb ? TonalPalette.fromInt(secondaryArgb) : dynamicScheme.secondaryPalette;
    const tertiaryPalette = tertiaryArgb ? TonalPalette.fromInt(tertiaryArgb) : dynamicScheme.tertiaryPalette;
    const neutralPalette = dynamicScheme.neutralPalette;
    const neutralVariantPalette = dynamicScheme.neutralVariantPalette;

    const palettes = {
      primary: primaryPalette,
      secondary: secondaryPalette,
      tertiary: tertiaryPalette,
      neutral: neutralPalette,
      neutralVariant: neutralVariantPalette
    };

    const surfaces = createMd3Surfaces(palettes, isDark);

    // 生成 MDC-Web 原生 CSS 变量字典
    const mdcVariables = {
      '--mdc-theme-primary': hexFromArgb(primaryPalette.tone(isDark ? 80 : 40)),
      '--mdc-theme-secondary': hexFromArgb(secondaryPalette.tone(isDark ? 80 : 40)),
      '--mdc-theme-tertiary': hexFromArgb(tertiaryPalette.tone(isDark ? 80 : 40)),
      '--mdc-theme-background': surfaces.background,
      '--mdc-theme-surface': surfaces.surface,
      '--mdc-theme-on-primary': hexFromArgb(primaryPalette.tone(isDark ? 20 : 100)),
      '--mdc-theme-on-secondary': hexFromArgb(secondaryPalette.tone(isDark ? 20 : 100)),
      '--mdc-theme-on-surface': surfaces.onSurface,
      '--mdc-theme-text-primary-on-background': surfaces.onBackground,
      '--mdc-theme-text-secondary-on-background': surfaces.onSurfaceVariant,
      '--mdc-theme-text-hint-on-background': hexFromArgb(neutralVariantPalette.tone(isDark ? 60 : 40)),
      '--mdc-theme-text-disabled-on-background': hexFromArgb(neutralVariantPalette.tone(isDark ? 50 : 70)),
      '--mdc-theme-text-icon-on-background': hexFromArgb(neutralVariantPalette.tone(isDark ? 70 : 50)),
      '--mdc-theme-surface-container': surfaces.surfaceContainer,
      '--mdc-theme-surface-container-high': surfaces.surfaceContainerHigh
    };

    return {
      isDark,
      surfaces,
      variables: mdcVariables,
      sourceColors: {
        primary: hexFromArgb(primaryArgb),
        secondary: secondaryArgb ? hexFromArgb(secondaryArgb) : null,
        tertiary: tertiaryArgb ? hexFromArgb(tertiaryArgb) : null
      }
    };
  }

  static applyTheme(colorInput, options = {}) {
    const theme = this.generateTheme(colorInput, options);
    const target = options.target || (typeof document !== 'undefined' ? document.documentElement : null);

    if (target && target.style) {
      for (const [key, value] of Object.entries(theme.variables)) {
        target.style.setProperty(key, value);
      }
    }
    return theme;
  }

  static async fromImage(imageElement, options = {}) {
    const quantizer = await QuantizerCelebi.fromImage(imageElement);
    const rankedMap = Score.score(quantizer);
    const rankedArgbs = Array.from(rankedMap.keys());
    const count = Math.min(options.count || 3, rankedArgbs.length);

    const payload = {
      primary: rankedArgbs[0] ? hexFromArgb(rankedArgbs[0]) : '#6200ee',
      secondary: count >= 2 && rankedArgbs[1] ? hexFromArgb(rankedArgbs[1]) : null,
      tertiary: count >= 3 && rankedArgbs[2] ? hexFromArgb(rankedArgbs[2]) : null
    };

    return this.applyTheme(payload, options);
  }
}

if (typeof window !== 'undefined') {
  window.mdc = window.mdc || {};
  window.mdc.monet = MdcMonetEngine;
}
