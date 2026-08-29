# Monet Theme Engine (@material/monet)

The Monet Theme Engine brings Material Design 3 (Material You) dynamic color generation (based on CAM16 and HCT color spaces) to MDC-Web M2.9.

## Installation

```bash
npm install @material/monet
```

## Usage

### CSS / SCSS
```scss
@import "@material/monet/mdc-monet";
```

### JavaScript
```javascript
import { MdcMonetEngine, MdcMonetPicker, MONET_PALETTES } from '@material/monet';

// Generate dynamic palette from seed colors
MdcMonetEngine.applyTheme({
  primary: '#6750A4',
  secondary: '#625B71',
  tertiary: '#7D5260'
}, {
  target: document.documentElement,
  dark: false
});

// Initialize 3-Step Monet Theme Picker
const picker = new MdcMonetPicker({
  container: document.getElementById('themeGrid'),
  stepTitle: document.getElementById('stepTitle'),
  stepSub: document.getElementById('stepSub'),
  onComplete: (colors) => console.log('Palette selected:', colors)
});
```

## CSS Classes
- `.theme-grid`: Container for the 3-step color swatch grid.
- `.theme-swatch`: Individual color swatch circle with ripple effect.
- `.theme-swatch.is-active`: Active/selected color swatch.
