import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  themeFromImage,
  applyTheme as mcuApplyTheme,
  Hct,
  QuantizerCelebi,
  Score,
  TonalPalette
} from '@material/material-color-utilities';

/**
 * MDUI Monet Dynamic Color Theme Engine
 * Powered by Google Material Color Utilities (HCT & CAM16)
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
  // MDUI Degrees: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
  // In Light mode, 50 is lightest (tone 95), 500 is primary (tone 40), 900 is darkest (tone 10)
  // In Dark mode, 50 is tone 95, 500 is primary (tone 80), 900 is tone 10
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

let activeTheme = null;
let activeSourceColor = '#3F51B5';
let activeIsDark = false;

export const monet = {
  argbFromHex,
  hexFromArgb,
  rgbaFromArgb,
  Hct,
  TonalPalette,

  /**
   * Generate full Monet theme object from source color
   * @param {string|number} sourceColor - Hex, RGB, or ARGB color
   * @returns {Object} theme data including palettes and schemes
   */
  generateTheme(sourceColor) {
    const argb = parseColorToArgb(sourceColor);
    const mcuTheme = themeFromSourceColor(argb);
    const hex = hexFromArgb(argb);

    const lightPrimaryMap = createMduiToneMap(mcuTheme.palettes.primary, false);
    const darkPrimaryMap = createMduiToneMap(mcuTheme.palettes.primary, true);
    const lightAccentMap = createMduiToneMap(mcuTheme.palettes.tertiary, false);
    const darkAccentMap = createMduiToneMap(mcuTheme.palettes.tertiary, true);

    const lightScheme = {};
    for (const [key, value] of Object.entries(mcuTheme.schemes.light.toJSON())) {
      lightScheme[key] = hexFromArgb(value);
    }
    const darkScheme = {};
    for (const [key, value] of Object.entries(mcuTheme.schemes.dark.toJSON())) {
      darkScheme[key] = hexFromArgb(value);
    }

    return {
      sourceColor: hex,
      sourceArgb: argb,
      palettes: mcuTheme.palettes,
      schemes: {
        light: lightScheme,
        dark: darkScheme
      },
      mduiTones: {
        light: {
          primary: lightPrimaryMap,
          accent: lightAccentMap
        },
        dark: {
          primary: darkPrimaryMap,
          accent: darkAccentMap
        }
      }
    };
  },

  /**
   * Set Monet seed color and apply theme
   * @param {string|number} color - Hex, RGB string or ARGB
   * @param {Object} [options] - Options: target, dark, apply
   */
  setColor(color, options = {}) {
    const {
      target = (typeof document !== 'undefined' ? document.documentElement : null),
      dark = activeIsDark,
      apply = true
    } = options;

    activeSourceColor = color;
    activeIsDark = Boolean(dark);
    const theme = this.generateTheme(color);
    activeTheme = theme;

    if (apply && target) {
      this.applyTheme(theme, { target, dark: activeIsDark });
    }
    return theme;
  },

  /**
   * Extract Monet theme from image element, canvas or image URL
   * @param {HTMLImageElement|HTMLCanvasElement|string} imageSource
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async fromImage(imageSource, options = {}) {
    if (typeof document === 'undefined') {
      throw new Error('fromImage requires browser environment');
    }

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

    // Extract dominant / seed color via Canvas and QuantizerCelebi
    let seedArgb;
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
      seedArgb = ranked[0] || pixels[0] || 0xff3f51b5;
    } catch (err) {
      // Fallback
      seedArgb = 0xff3f51b5;
    }

    const hex = hexFromArgb(seedArgb);
    return this.setColor(hex, options);
  },

  /**
   * Toggle or set dark mode for Monet theme
   * @param {boolean} isDark
   * @param {HTMLElement} [target]
   */
  setDarkMode(isDark, target = (typeof document !== 'undefined' ? document.documentElement : null)) {
    activeIsDark = Boolean(isDark);
    if (activeTheme && target) {
      this.applyTheme(activeTheme, { target, dark: activeIsDark });
    }
  },

  /**
   * Apply theme data as CSS variables to target DOM node
   * @param {Object} theme
   * @param {Object} [options]
   */
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

    // Ensure .mdui-theme-monet class is present
    target.classList.add('mdui-theme-monet');
    if (activeIsDark) {
      target.classList.add('mdui-theme-layout-dark');
    } else {
      target.classList.remove('mdui-theme-layout-dark');
    }

    // Set Material You / Monet CSS custom properties
    const style = target.style;
    style.setProperty('--mdui-monet-source', theme.sourceColor);
    style.setProperty('--mdui-monet-mode', mode);

    // Core Scheme roles
    for (const [role, hex] of Object.entries(scheme)) {
      const kebab = role.replace(/([A-Z])/g, '-$1').toLowerCase();
      style.setProperty(`--mdui-monet-${kebab}`, hex);
    }

    // MDUI 50..900 Primary Tones
    for (const [degree, hex] of Object.entries(tones.primary)) {
      style.setProperty(`--mdui-monet-primary-${degree}`, hex);
    }

    // MDUI A100..A700 Accent Tones
    for (const [degree, hex] of Object.entries(tones.accent)) {
      style.setProperty(`--mdui-monet-accent-${degree}`, hex);
    }

    // Base shortcuts
    style.setProperty('--mdui-monet-primary-main', scheme.primary);
    style.setProperty('--mdui-monet-primary-contrast', scheme.onPrimary);
    style.setProperty('--mdui-monet-accent-main', scheme.tertiary || scheme.secondary);
    style.setProperty('--mdui-monet-accent-contrast', scheme.onTertiary || scheme.onSecondary);
    style.setProperty('--mdui-monet-bg', scheme.background);
    style.setProperty('--mdui-monet-surface-bg', scheme.surface);
    style.setProperty('--mdui-monet-text-main', scheme.onSurface);
  },

  /**
   * Reset target and remove Monet theme (reverting to MD 19 colors)
   * @param {HTMLElement} [target]
   */
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

  /**
   * Get active theme data
   */
  getTheme() {
    return activeTheme;
  },

  /**
   * Get current source color
   */
  getSourceColor() {
    return activeSourceColor;
  },

  /**
   * Check if dark mode is active
   */
  isDarkMode() {
    return activeIsDark;
  }
};

export default monet;
