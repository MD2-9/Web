# M2.9 Expansion Panel (@material/expansion-panel)

Accordion expansion panel component for collapsible content blocks.

## Installation

```bash
npm install @material/expansion-panel
```

## Usage

### HTML
```html
<div class="m29-expansion-panel">
  <div class="m29-expansion-header">
    <span class="m29-expansion-title">Panel Title</span>
    <i class="material-icons m29-expansion-arrow">expand_more</i>
  </div>
  <div class="m29-expansion-body">
    Panel collapsible content goes here.
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
