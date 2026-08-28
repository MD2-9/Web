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
 * MDUI Monet Dynamic Color Theme Engine
 * Strict Material Design 3 (M3 / Material Web 1.x) Specification
 * - Real CAM16/HCT Dynamic Schemes with authentic Chroma tinting (never pure dead black #000/#121212)
 * - M3 Official Dark Surface Tier System:
 *     Surface: Tone 10 (~#141218 with seed hue tint)
 *     Surface Container Lowest: Tone 4 (~#0F0D13)
 *     Surface Container Low: Tone 10 (~#1D1B20)
 *     Surface Container (Cards/Panels): Tone 12 (~#211F26)
 *     Surface Container High (Dialogs/Toolbars): Tone 17 (~#2B2930)
 *     Surface Container Highest (Highlights/Pickers): Tone 22 (~#36343B)
 *     Surface Bright: Tone 24 (~#3B383E)
 * - OnSurface: Tone 90 (~#E6E1E5)
 * - OnSurfaceVariant: Tone 80 (~#CAC4D0)
 * - Outline: Tone 60 (~#938F99)
 * - OutlineVariant: Tone 30 (~#49454F)
 */

function rgbaFromArgb(argb, alpha = 1) {
  const r = (argb >> 16) & 255;
  const g = (argb >> 8) & 255;
  const b = argb & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseColorToArgb(color) {
  if (typeof color === 'number') {
    return color;
  }
  if (typeof color === 'string') {
    const trimmed = color.trim();
    if (trimmed.startsWith('#')) {
      return argbFromHex(trimmed);
    }
    const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return (255 << 24) | (r << 16) | (g << 8) | b;
    }
    const hctMatch = trimmed.match(/^hct\((\d+),\s*(\d+),\s*(\d+)/i);
    if (hctMatch) {
      const hct = Hct.from(parseFloat(hctMatch[1]), parseFloat(hctMatch[2]), parseFloat(hctMatch[3]));
      return hct.toInt();
    }
    return argbFromHex(trimmed);
  }
  throw new Error('Unsupported color format: ' + color);
}

// Map Tonal Palettes to MDUI 50..900 & A100..A700 shades
function createMduiToneMap(palette, isDark = false) {
  return {
    50: hexFromArgb(palette.tone(95)),
    100: hexFromArgb(palette.tone(90)),
    200: hexFromArgb(palette.tone(80)),
    300: hexFromArgb(palette.tone(70)),
    400: hexFromArgb(palette.tone(60)),
    500: hexFromArgb(palette.tone(isDark ? 80 : 40)),
    600: hexFromArgb(palette.tone(isDark ? 70 : 35)),
    700: hexFromArgb(palette.tone(isDark ? 60 : 30)),
    800: hexFromArgb(palette.tone(isDark ? 50 : 20)),
    900: hexFromArgb(palette.tone(isDark ? 40 : 10)),
    a100: hexFromArgb(palette.tone(90)),
    a200: hexFromArgb(palette.tone(80)),
    a400: hexFromArgb(palette.tone(isDark ? 80 : 40)),
    a700: hexFromArgb(palette.tone(isDark ? 60 : 30))
  };
}

/**
 * Generate Material 3 (Material Web / Android 14) Official Surface System
 */
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
    // Official M3 / Material Web Dark Surface tokens
    return {
      surface: hexFromArgb(n.tone(10)),
      surfaceDim: hexFromArgb(n.tone(6)),
      surfaceBright: hexFromArgb(n.tone(24)),
      surfaceContainerLowest: hexFromArgb(n.tone(4)),
      surfaceContainerLow: hexFromArgb(n.tone(10)),
      surfaceContainer: hexFromArgb(n.tone(12)),
      surfaceContainerHigh: hexFromArgb(n.tone(17)),
      surfaceContainerHighest: hexFromArgb(n.tone(22)),
      onSurface: hexFromArgb(n.tone(90)),
      surfaceVariant: hexFromArgb(nv.tone(30)),
      onSurfaceVariant: hexFromArgb(nv.tone(80)),
      background: hexFromArgb(n.tone(10)),
      onBackground: hexFromArgb(n.tone(90)),
      outline: hexFromArgb(nv.tone(60)),
      outlineVariant: hexFromArgb(nv.tone(30))
    };
  }
}

// Variant Scheme Factory
const variantConstructors = {
  tonal_spot: SchemeTonalSpot,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  neutral: SchemeNeutral,
  spritz: SchemeNeutral,
  rainbow: SchemeRainbow,
  fruit_salad: SchemeFruitSalad,
  monochrome: SchemeMonochrome,
  content: SchemeContent,
  fidelity: SchemeFidelity,
  android: SchemeAndroid
};

let activeTheme = null;
let activeSourceColors = { primary: '#3F51B5', secondary: null, tertiary: null };
let activeColorMode = 'single';
let activeVariant = 'tonal_spot';
let activeIsDark = false;

export const monet = {
  argbFromHex,
  hexFromArgb,
  rgbaFromArgb,
  Hct,
  TonalPalette,

  normalizeColors(input) {
    if (!input) return { primary: '#3F51B5', secondary: null, tertiary: null, mode: 'single' };
    if (typeof input === 'string' || typeof input === 'number') {
      return { primary: input, secondary: null, tertiary: null, mode: 'single' };
    }
    if (Array.isArray(input)) {
      const mode = input.length >= 3 ? 'triple' : (input.length === 2 ? 'dual' : 'single');
      return {
        primary: input[0] || '#3F51B5',
        secondary: input[1] || null,
        tertiary: input[2] || null,
        mode
      };
    }
    if (typeof input === 'object') {
      let mode = input.mode;
      if (!mode) {
        mode = (input.primary && input.secondary && input.tertiary) ? 'triple' : (input.secondary ? 'dual' : 'single');
      }
      return {
        primary: input.primary || '#3F51B5',
        secondary: input.secondary || null,
        tertiary: input.tertiary || null,
        mode
      };
    }
    return { primary: '#3F51B5', secondary: null, tertiary: null, mode: 'single' };
  },

  generateTheme(sourceInput, options = {}) {
    const { variant = activeVariant || 'tonal_spot', contrastLevel = 0 } = options;
    const norm = this.normalizeColors(sourceInput);
    const primaryArgb = parseColorToArgb(norm.primary);
    const primaryHct = Hct.fromInt(primaryArgb);

    let lightSchemeObj;
    let darkSchemeObj;
    const SchemeClass = variantConstructors[variant] || SchemeTonalSpot;

    try {
      lightSchemeObj = new SchemeClass(primaryHct, false, contrastLevel);
      darkSchemeObj = new SchemeClass(primaryHct, true, contrastLevel);
    } catch (e) {
      const fallback = themeFromSourceColor(primaryArgb);
      lightSchemeObj = fallback.schemes.light;
      darkSchemeObj = fallback.schemes.dark;
    }

    // Authentic HCT Palettes from Scheme
    const palettes = {
      primary: lightSchemeObj.primaryPalette || TonalPalette.fromHueAndChroma(primaryHct.hue, Math.max(28, primaryHct.chroma)),
      secondary: lightSchemeObj.secondaryPalette || TonalPalette.fromHueAndChroma(primaryHct.hue, 16),
      tertiary: lightSchemeObj.tertiaryPalette || TonalPalette.fromHueAndChroma((primaryHct.hue + 60) % 360, 24),
      neutral: lightSchemeObj.neutralPalette || TonalPalette.fromHueAndChroma(primaryHct.hue, 6),
      neutralVariant: lightSchemeObj.neutralVariantPalette || TonalPalette.fromHueAndChroma(primaryHct.hue, 10)
    };

    if (norm.secondary) {
      const secArgb = parseColorToArgb(norm.secondary);
      const secHct = Hct.fromInt(secArgb);
      palettes.secondary = TonalPalette.fromHueAndChroma(secHct.hue, Math.max(16, secHct.chroma));
    }

    if (norm.tertiary) {
      const tertArgb = parseColorToArgb(norm.tertiary);
      const tertHct = Hct.fromInt(tertArgb);
      palettes.tertiary = TonalPalette.fromHueAndChroma(tertHct.hue, Math.max(24, tertHct.chroma));
    }

    palettes.accent1 = palettes.primary;
    palettes.accent2 = palettes.secondary;
    palettes.accent3 = palettes.tertiary;
    palettes.neutral1 = palettes.neutral;
    palettes.neutral2 = palettes.neutralVariant;

    const primaryHex = hexFromArgb(primaryArgb);
    const secondaryHex = norm.secondary ? hexFromArgb(parseColorToArgb(norm.secondary)) : hexFromArgb(palettes.secondary.tone(40));
    const tertiaryHex = norm.tertiary ? hexFromArgb(parseColorToArgb(norm.tertiary)) : hexFromArgb(palettes.tertiary.tone(40));

    const lightPrimaryMap = createMduiToneMap(palettes.primary, false);
    const darkPrimaryMap = createMduiToneMap(palettes.primary, true);
    const lightSecondaryMap = createMduiToneMap(palettes.secondary, false);
    const darkSecondaryMap = createMduiToneMap(palettes.secondary, true);
    const lightTertiaryMap = createMduiToneMap(palettes.tertiary, false);
    const darkTertiaryMap = createMduiToneMap(palettes.tertiary, true);

    const lightSurfaces = createMd3Surfaces(palettes, false);
    const darkSurfaces = createMd3Surfaces(palettes, true);

    const lightScheme = {
      primary: hexFromArgb(palettes.primary.tone(40)),
      onPrimary: hexFromArgb(palettes.primary.tone(100)),
      primaryContainer: hexFromArgb(palettes.primary.tone(90)),
      onPrimaryContainer: hexFromArgb(palettes.primary.tone(10)),
      secondary: hexFromArgb(palettes.secondary.tone(40)),
      onSecondary: hexFromArgb(palettes.secondary.tone(100)),
      secondaryContainer: hexFromArgb(palettes.secondary.tone(90)),
      onSecondaryContainer: hexFromArgb(palettes.secondary.tone(10)),
      tertiary: hexFromArgb(palettes.tertiary.tone(40)),
      onTertiary: hexFromArgb(palettes.tertiary.tone(100)),
      tertiaryContainer: hexFromArgb(palettes.tertiary.tone(90)),
      onTertiaryContainer: hexFromArgb(palettes.tertiary.tone(10)),
      ...lightSurfaces
    };

    const darkScheme = {
      primary: hexFromArgb(palettes.primary.tone(80)),
      onPrimary: hexFromArgb(palettes.primary.tone(20)),
      primaryContainer: hexFromArgb(palettes.primary.tone(30)),
      onPrimaryContainer: hexFromArgb(palettes.primary.tone(90)),
      secondary: hexFromArgb(palettes.secondary.tone(80)),
      onSecondary: hexFromArgb(palettes.secondary.tone(20)),
      secondaryContainer: hexFromArgb(palettes.secondary.tone(30)),
      onSecondaryContainer: hexFromArgb(palettes.secondary.tone(90)),
      tertiary: hexFromArgb(palettes.tertiary.tone(80)),
      onTertiary: hexFromArgb(palettes.tertiary.tone(20)),
      tertiaryContainer: hexFromArgb(palettes.tertiary.tone(30)),
      onTertiaryContainer: hexFromArgb(palettes.tertiary.tone(90)),
      ...darkSurfaces
    };

    return {
      sourceColor: primaryHex,
      sourceColors: {
        primary: primaryHex,
        secondary: secondaryHex,
        tertiary: tertiaryHex
      },
      colorMode: norm.mode,
      variant,
      palettes,
      schemes: {
        light: lightScheme,
        dark: darkScheme
      },
      surfaces: {
        light: lightSurfaces,
        dark: darkSurfaces
      },
      mduiTones: {
        light: {
          primary: lightPrimaryMap,
          secondary: lightSecondaryMap,
          tertiary: lightTertiaryMap,
          accent: lightTertiaryMap
        },
        dark: {
          primary: darkPrimaryMap,
          secondary: darkSecondaryMap,
          tertiary: darkTertiaryMap,
          accent: darkTertiaryMap
        }
      }
    };
  },

  setColor(colors, options = {}) {
    const {
      target = (typeof document !== 'undefined' ? document.documentElement : null),
      dark = activeIsDark,
      variant = activeVariant || 'tonal_spot',
      apply = true
    } = options;

    const norm = this.normalizeColors(colors);
    activeSourceColors = norm;
    activeColorMode = norm.mode;
    activeVariant = variant;
    activeIsDark = Boolean(dark);
    const theme = this.generateTheme(norm, { variant });
    activeTheme = theme;

    if (apply && target) {
      this.applyTheme(theme, { target, dark: activeIsDark });
    }
    return theme;
  },

  setSingleColor(primary, options = {}) {
    return this.setColor({ primary, secondary: null, tertiary: null, mode: 'single' }, options);
  },

  setDualColors(primary, secondary, options = {}) {
    return this.setColor({ primary, secondary, tertiary: null, mode: 'dual' }, options);
  },

  setTripleColors(primary, secondary, tertiary, options = {}) {
    return this.setColor({ primary, secondary, tertiary, mode: 'triple' }, options);
  },

  setVariant(variant, target = (typeof document !== 'undefined' ? document.documentElement : null)) {
    activeVariant = variant;
    if (activeSourceColors) {
      return this.setColor(activeSourceColors, { target, variant: activeVariant, dark: activeIsDark });
    }
  },

  async fromImage(imageSource, options = {}) {
    if (typeof document === 'undefined') {
      throw new Error('fromImage requires browser environment');
    }

    const { count = 3, maxColors = 3, variant = activeVariant || 'tonal_spot' } = options;
    const targetCount = count || maxColors || 3;

    let imgElement;
    if (typeof imageSource === 'string') {
      imgElement = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Failed to load image for Monet color extraction: ' + imageSource));
        img.src = imageSource;
      });
    } else {
      imgElement = imageSource;
    }

    let topColors = [];
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = 128;
      const scale = Math.min(1, maxDim / Math.max(imgElement.width || 1, imgElement.height || 1));
      canvas.width = Math.max(1, Math.floor((imgElement.width || maxDim) * scale));
      canvas.height = Math.max(1, Math.floor((imgElement.height || maxDim) * scale));
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = [];
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        if (a >= 255) {
          pixels.push((255 << 24) | (r << 16) | (g << 8) | b);
        }
      }
      const quantized = QuantizerCelebi.quantize(pixels, 128);
      const ranked = Score.score(quantized);
      topColors = ranked.slice(0, Math.min(3, targetCount)).map(argb => hexFromArgb(argb));
    } catch (err) {
      topColors = ['#3F51B5'];
    }

    if (topColors.length === 0) topColors = ['#3F51B5'];

    const mode = targetCount === 1 ? 'single' : (targetCount === 2 ? 'dual' : 'triple');

    return this.setColor({
      primary: topColors[0],
      secondary: targetCount >= 2 ? (topColors[1] || null) : null,
      tertiary: targetCount >= 3 ? (topColors[2] || null) : null,
      mode
    }, { ...options, variant });
  },

  setDarkMode(isDark, target = (typeof document !== 'undefined' ? document.documentElement : null)) {
    activeIsDark = Boolean(isDark);
    if (activeTheme && target) {
      this.applyTheme(activeTheme, { target, dark: activeIsDark });
    }
  },

  applyTheme(theme, options = {}) {
    const {
      target = (typeof document !== 'undefined' ? document.documentElement : null),
      dark = activeIsDark
    } = options;

    if (!target || !target.style) return;

    activeIsDark = Boolean(dark);
    const mode = activeIsDark ? 'dark' : 'light';
    const scheme = theme.schemes[mode];
    const tones = theme.mduiTones[mode];

    target.classList.add('mdui-theme-monet');
    if (activeIsDark) {
      target.classList.add('mdui-theme-layout-dark');
    } else {
      target.classList.remove('mdui-theme-layout-dark');
    }

    const style = target.style;
    style.setProperty('--mdui-monet-source', theme.sourceColor);
    style.setProperty('--mdui-monet-source-primary', theme.sourceColors.primary);
    style.setProperty('--mdui-monet-source-secondary', theme.sourceColors.secondary);
    style.setProperty('--mdui-monet-source-tertiary', theme.sourceColors.tertiary);
    style.setProperty('--mdui-monet-color-mode', theme.colorMode || 'single');
    style.setProperty('--mdui-monet-variant', theme.variant || 'tonal_spot');
    style.setProperty('--mdui-monet-mode', mode);

    // Scheme roles & MD3 Surface Containers
    for (const [role, hex] of Object.entries(scheme)) {
      const kebab = role.replace(/([A-Z])/g, '-$1').toLowerCase();
      style.setProperty(`--mdui-monet-${kebab}`, hex);
    }

    // MDUI 50..900 Primary Tones (Accent 1)
    for (const [degree, hex] of Object.entries(tones.primary)) {
      style.setProperty(`--mdui-monet-primary-${degree}`, hex);
    }

    // MDUI 50..900 Secondary Tones (Accent 2)
    for (const [degree, hex] of Object.entries(tones.secondary)) {
      style.setProperty(`--mdui-monet-secondary-${degree}`, hex);
    }

    // MDUI 50..900 Tertiary Tones (Accent 3)
    for (const [degree, hex] of Object.entries(tones.tertiary)) {
      style.setProperty(`--mdui-monet-tertiary-${degree}`, hex);
    }

    // MDUI A100..A700 Accent Tones
    for (const [degree, hex] of Object.entries(tones.accent)) {
      style.setProperty(`--mdui-monet-accent-${degree}`, hex);
    }

    // Shortcuts
    style.setProperty('--mdui-monet-primary-main', scheme.primary);
    style.setProperty('--mdui-monet-primary-contrast', scheme.onPrimary);
    style.setProperty('--mdui-monet-secondary-main', scheme.secondary);
    style.setProperty('--mdui-monet-secondary-contrast', scheme.onSecondary);
    style.setProperty('--mdui-monet-tertiary-main', scheme.tertiary);
    style.setProperty('--mdui-monet-tertiary-contrast', scheme.onTertiary);
    style.setProperty('--mdui-monet-accent-main', scheme.tertiary || scheme.secondary);
    style.setProperty('--mdui-monet-accent-contrast', scheme.onTertiary || scheme.onSecondary);
    style.setProperty('--mdui-monet-bg', scheme.background);
    style.setProperty('--mdui-monet-surface-bg', scheme.surfaceContainer || scheme.surface);
    style.setProperty('--mdui-monet-text-main', scheme.onSurface);
  },

  reset(target = (typeof document !== 'undefined' ? document.documentElement : null)) {
    if (!target || !target.style) return;
    target.classList.remove('mdui-theme-monet');

    const toRemove = [];
    for (let i = 0; i < target.style.length; i++) {
      const prop = target.style[i];
      if (prop && prop.startsWith('--mdui-monet-')) {
        toRemove.push(prop);
      }
    }
    toRemove.forEach(prop => target.style.removeProperty(prop));
    activeTheme = null;
  },

  getTheme() {
    return activeTheme;
  },

  getSourceColors() {
    return activeSourceColors;
  },

  getColorMode() {
    return activeColorMode;
  },

  getVariant() {
    return activeVariant;
  },

  isDarkMode() {
    return activeIsDark;
  }
};

export default monet;
