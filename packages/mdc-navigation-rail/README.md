# Navigation Rail (@material/navigation-rail)

The Navigation Rail provides a persistent vertical navigation rail for desktop viewports (>= 600px) with hover expansion and centered secondary overlay panels.

## Installation

```bash
npm install @material/navigation-rail
```

## Usage

### HTML
```html
<nav class="mdc-navigation-rail" id="app-rail">
  <div class="rail-header">
    <div class="rail-header-avatar">M</div>
    <span class="rail-header-text">M2.9 Web</span>
  </div>
  <div class="rail-nav-list">
    <a href="#section-overview" class="rail-nav-item is-active">
      <i class="material-icons rail-item-icon">home</i>
      <span class="rail-item-text">Home</span>
    </a>
  </div>
</nav>
```

### SCSS
```scss
@import "@material/navigation-rail/mdc-navigation-rail";
```

### JavaScript
```javascript
import { MdcNavigationRail } from '@material/navigation-rail';

const rail = new MdcNavigationRail(document.getElementById('app-rail'), {
  expandOnHover: true
});
```

## CSS Classes
- `.mdc-navigation-rail`: Root rail container (80px collapsed, 256px on hover).
- `.secondary-overlay-panel`: Secondary panel sliding from right with centered layout.
- `.rail-nav-item`: Navigation link item.
- `.rail-nav-item.is-active`: Currently active route item.
