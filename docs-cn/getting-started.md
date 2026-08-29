# 快速入门指南 (Getting Started)

本指南将帮助你从零开始快速在 Web 项目中安装并使用 **MDC-Web M2.9**。

---

## 1. 安装方式

### 方式 A：NPM 安装 (推荐)
```bash
npm install material-components-web
```
或者按需安装单个组件包：
```bash
npm install @material/button @material/card @material/monet @material/picker
```

### 方式 B：CDN / 本地静态引入
```html
<!-- 引入 M2.9 全量样式表 -->
<link rel="stylesheet" href="./dist/material-components-web.css">

<!-- 引入 Material Icons 字体图标与 Google Sans Flex 变量字体 -->
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap">

<!-- 引入 M2.9 全量 JavaScript 脚本 -->
<script src="./dist/material-components-web.js"></script>
```

---

## 2. 样式引入与 Sass 编译

### 使用 SCSS 变量自定义与按需编译
```scss
// 引入全局主题变量
@import "@material/theme/mdc-theme";

// 自定义主色调 (或由 Monet 引擎自动注入)
$mdc-theme-primary: #6750a4;
$mdc-theme-secondary: #625b71;

// 引入全量或指定组件
@import "@material/material-components-web/material-components-web";
```

---

## 3. JavaScript 实例化与自动挂载

### 自动初始化 (Auto Init)
在 HTML 元素上添加 `data-mdc-auto-init` 属性：
```html
<button class="mdc-button mdc-button--raised" data-mdc-auto-init="MDCRipple">
  Raised Button
</button>
```
在页面加载完毕后执行：
```javascript
import { autoInit } from 'material-components-web';

// 扫描 DOM 并自动实例化所有声明了 data-mdc-auto-init 的组件
autoInit();
```

### 手动实例化组件
```javascript
import { MDCRipple } from '@material/ripple';
import { MdcDatePicker, MdcTimePicker } from '@material/picker';

// 实例化水波纹
const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));

// 实例化日历选择器
const datePicker = new MdcDatePicker(document.getElementById('myDatePicker'), {
  onChange: (date) => console.log('当前选择日期:', date)
});
```
