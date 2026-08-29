# Date & Time Pickers (@material/picker)

MDC-Web M2.9 DatePicker and TimePicker components built to 0px straight-angle and 50% round Material geometry specifications.

## Installation

```bash
npm install @material/picker
```

## Usage

### SCSS
```scss
@import "@material/picker/mdc-picker";
```

### JavaScript
```javascript
import { MdcDatePicker, MdcTimePicker } from '@material/picker';

// DatePicker
const datePicker = new MdcDatePicker(document.getElementById('myDatePicker'), {
  onChange: (date) => console.log('Date:', date)
});

// TimePicker
const timePicker = new MdcTimePicker(document.getElementById('myTimePicker'), {
  mode: 'hour',
  hour: 9,
  minute: 30,
  isPM: false,
  onSelect: (time) => console.log('Time:', time)
});
```

## Features
- **TimePicker 24h & 12h Dial**: Smooth dragging with inverted color indicator.
- **Dynamic 1:1 Responsive Scaling**: Center, radius, and clock hand dynamically scale with container dimensions.
- **Narrow Auto-Hide**: Automatically hides AM/PM toggle when right available space is less than 32%.
