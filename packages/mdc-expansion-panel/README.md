# Expansion Panel (@material/expansion-panel)

Accordion expansion panel component for collapsible content blocks.

## Installation

```bash
npm install @material/expansion-panel
```

## Usage

### HTML
```html
<div class="mdc-expansion-panel">
  <div class="mdc-expansion-panel__header">
    <span class="mdc-expansion-panel__title">Panel Title</span>
    <i class="material-icons mdc-expansion-panel__icon">expand_more</i>
  </div>
  <div class="mdc-expansion-panel__content">
    <div class="mdc-expansion-panel__body">
      Panel collapsible content goes here.
    </div>
  </div>
</div>
```

### SCSS
```scss
@import "@material/expansion-panel/mdc-expansion-panel";
```

### JavaScript
```javascript
import { MdcExpansionPanel } from '@material/expansion-panel';

const panel = new MdcExpansionPanel(document.querySelector('.mdc-expansion-panel'));
```
