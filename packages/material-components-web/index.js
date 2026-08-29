/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2026 安秋 <github.com/unjal29> (Extended under Apache-2.0)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import autoInit from '@material/auto-init/index';
import * as base from '@material/base/index';
import * as checkbox from '@material/checkbox/index';
import * as chips from '@material/chips/index';
import * as dialog from '@material/dialog/index';
import * as drawer from '@material/drawer/index';
import * as navigationRail from '@material/navigation-rail/index';
import * as monet from '@material/monet/index';
import * as expansionPanel from '@material/expansion-panel/index';
import * as floatingLabel from '@material/floating-label/index';
import * as formField from '@material/form-field/index';
import * as gridList from '@material/grid-list/index';
import * as iconToggle from '@material/icon-toggle/index';
import * as linearProgress from '@material/linear-progress/index';
import { MduiLinearProgress } from '@material/linear-progress/mdui-linear-progress';
import * as lineRipple from '@material/line-ripple/index';
import * as menu from '@material/menu/index';
import * as notchedOutline from '@material/notched-outline/index';
import * as picker from '@material/picker/index';
import { MdcTimePicker, MdcDatePicker } from '@material/picker/index';
import * as radio from '@material/radio/index';
import * as ripple from '@material/ripple/index';
import { createRipple, attachRipples } from '@material/ripple/mdui-ripple';
import { 
  MduiFlatEdgeEffect,
  MduiFlatEdgeEffectManager,
  attachFlatEdgeEffect,
  MduiEdgeEffect,
  MduiEdgeEffectManager,
  attachEdgeEffect,
  MduiOverscrollGlow,
  attachOverscrollGlow
} from '@material/ripple/mdui-overscroll-glow';
import * as select from '@material/select/index';
import * as selectionControl from '@material/selection-control/index';
import * as slider from '@material/slider/index';
import { Md1Slider } from '@material/slider/md1-slider';
import * as snackbar from '@material/snackbar/index';
import * as tabs from '@material/tabs/index';
import { Md1Tabs } from '@material/tabs/md1-tabs';
import * as textField from '@material/textfield/index';
import * as toolbar from '@material/toolbar/index';
import * as topAppBar from '@material/top-app-bar/index';

// Register all components
autoInit.register('MDCCheckbox', checkbox.MDCCheckbox);
autoInit.register('MDCChip', chips.MDCChip);
autoInit.register('MDCChipSet', chips.MDCChipSet);
autoInit.register('MDCDialog', dialog.MDCDialog);
autoInit.register('MDCPersistentDrawer', drawer.MDCPersistentDrawer);
autoInit.register('MDCTemporaryDrawer', drawer.MDCTemporaryDrawer);
autoInit.register('MDCNavigationRail', navigationRail.MdcNavigationRail);
autoInit.register('MDCFloatingLabel', floatingLabel.MDCFloatingLabel);
autoInit.register('MDCFormField', formField.MDCFormField);
autoInit.register('MDCRipple', ripple.MDCRipple);
autoInit.register('MDCGridList', gridList.MDCGridList);
autoInit.register('MDCIconToggle', iconToggle.MDCIconToggle);
autoInit.register('MDCLineRipple', lineRipple.MDCLineRipple);
autoInit.register('MDCLinearProgress', linearProgress.MDCLinearProgress);
autoInit.register('MDCNotchedOutline', notchedOutline.MDCNotchedOutline);
autoInit.register('MDCRadio', radio.MDCRadio);
autoInit.register('MDCSnackbar', snackbar.MDCSnackbar);
autoInit.register('MDCTab', tabs.MDCTab);
autoInit.register('MDCTabBar', tabs.MDCTabBar);
autoInit.register('MDCTextField', textField.MDCTextField);
autoInit.register('MDCMenu', menu.MDCMenu);
autoInit.register('MDCSelect', select.MDCSelect);
autoInit.register('MDCSlider', slider.MDCSlider);
autoInit.register('MDCToolbar', toolbar.MDCToolbar);
autoInit.register('MDCTopAppBar', topAppBar.MDCTopAppBar);
autoInit.register('Md1Slider', Md1Slider);
autoInit.register('Md1Tabs', Md1Tabs);
autoInit.register('MduiLinearProgress', MduiLinearProgress);
autoInit.register('MdcExpansionPanel', expansionPanel.MdcExpansionPanel);
autoInit.register('MdcTimePicker', picker.MdcTimePicker);
autoInit.register('MdcDatePicker', picker.MdcDatePicker);

// Export all components
export {
  autoInit,
  base,
  checkbox,
  chips,
  dialog,
  drawer,
  navigationRail,
  monet,
  expansionPanel,
  floatingLabel,
  formField,
  gridList,
  iconToggle,
  lineRipple,
  linearProgress,
  MduiLinearProgress,
  menu,
  notchedOutline,
  picker,
  MdcTimePicker,
  MdcDatePicker,
  radio,
  ripple,
  createRipple,
  attachRipples,
  MduiFlatEdgeEffect,
  MduiFlatEdgeEffectManager,
  attachFlatEdgeEffect,
  MduiEdgeEffect,
  MduiEdgeEffectManager,
  attachEdgeEffect,
  MduiOverscrollGlow,
  attachOverscrollGlow,
  select,
  selectionControl,
  slider,
  Md1Slider,
  snackbar,
  tabs,
  Md1Tabs,
  textField,
  toolbar,
  topAppBar,
};
