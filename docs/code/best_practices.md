# Best Practices

MDC Web follows naming and documentation best practices to keep our code
consistent, and our APIs user friendly. We follow isolation best practices to
keep our code loosely coupled. And we follow performace best practices to keep
our components fast.

### Naming & Prefixes

*  **Official MDC Components**: Retain the `mdc-[component]` standard prefix (e.g. `.mdc-button`, `.mdc-card`, `.mdc-dialog`).
*  **M2.9 Extended & New Components**: **Strictly use the `m29-[component]` prefix** (e.g. `.m29-segmented-button`, `.m29-badge-container`, `.m29-tooltip-wrapper`, `.m29-divider`, `.m29-expansion-panel`, `.m29-tabs-bar`, `.m29-slider`, `.m29-switch`, `M29NavigationRail`, `M29MobileDrawer`, `M29DatePicker`, `M29TimePicker`, `M29MonetEngine`).
*  Use the [BEM naming convention](http://getbem.com/naming/) for CSS classes.

### Documentation

* Keep documentation short, don't use ten words when one will do
* Let Material Design guidelines cover when/why to use a component

### Isolation

*  Never reference [element](https://developer.mozilla.org/en-US/docs/Web/API/Element) directly in the Foundation

TODO: Add more notes about how to isolate subsystems from component specifics

### Performance

*  Only animate properties that will run on the GPU
*  Use `requestAnimationFrame`
*  Avoid constant synchronous DOM reads/writes
*  Reduce the number of composite layers
