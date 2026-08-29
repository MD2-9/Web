# 莫奈色彩体系与主题定制指南 (Theming & Monet)

MDC-Web M2.9 深度融合了 **Material Design 3 (Material You)** 核心的 **CAM16 & HCT (Hue-Chroma-Tone)** 动态取色色彩空间算法，摆脱了传统 RGB/HSL 颜色模型在人眼感知亮度上的失真缺陷。

---

## 1. 莫奈色彩引擎架构 (`@material/monet`)

### 1.1 色彩角色矩阵
系统自动由 1~3 个基准种子色（Source Colors）实时派生出 5 组感知色阶调色盘（Tonal Palettes），每组调色盘包含 0 到 100 共 13 个精确色阶：

1. **Primary (主色)**：核心关键控件、FAB、高亮选中状态。
2. **Secondary (次色)**：辅助控件、筛选标签、次要操作。
3. **Tertiary (第三色 / 强调色)**：对比强调、平衡画面冷暖视觉。
4. **Neutral (中性色)**：页面背景、卡片 Surface 容器。
5. **Neutral Variant (中性变体色)**：边框描边、低强调文本与图标。

### 1.2 亮色 / 暗色模式色调映射 (Tonal Mapping)

| 色彩角色 | 亮色模式 (Light Mode) | 暗色模式 (Dark Mode) |
| :--- | :--- | :--- |
| `primary` | Tone 40 | Tone 80 |
| `on-primary` | Tone 100 (纯白) | Tone 20 |
| `primary-container` | Tone 90 | Tone 30 |
| `on-primary-container` | Tone 10 | Tone 90 |
| `surface` | Tone 98 | Tone 6 |
| `on-surface` | Tone 10 | Tone 90 |
| `surface-container` | Tone 94 | Tone 12 |

---

## 2. 调色盘组件使用与 1/2/3 色模式

M2.9 提供了内置的 3-Step 交互式调色盘组件 `MdcMonetPicker`：

### 2.1 JavaScript 调用示例
```javascript
import { MdcMonetEngine, MdcMonetPicker } from '@material/monet';

// 1. 基于十六进制颜色动态计算全色阶并注入 CSS 变量
MdcMonetEngine.applyTheme({
  primary: '#6750A4',
  secondary: '#625B71',
  tertiary: '#7D5260'
}, {
  target: document.documentElement,
  dark: false
});

// 2. 挂载 3-Step 调色盘
const picker = new MdcMonetPicker({
  container: document.getElementById('themeGrid'),
  stepTitle: document.getElementById('pickerStepTitle'),
  stepSub: document.getElementById('pickerStepSub'),
  onComplete: (palette) => {
    console.log('用户配置完成:', palette);
  }
});
```

### 2.2 调色步骤模式说明
- **单色模式 (1-Color)**：选择主色，次色与第三色由 HCT 算法根据色彩和谐规则自动派生。
- **双色模式 (2-Color)**：分别选择主色与次色，第三色自动计算。
- **三色模式 (3-Color)**：自定义配置主色、次色与第三色。

---

## 3. CSS 变量使用指南

在业务开发中，直接使用系统注入的 CSS 变量：

```css
.my-custom-card {
  background-color: var(--mdc-theme-surface, #ffffff);
  color: var(--mdc-theme-on-surface, #1d1b20);
  border: 1px solid var(--mdc-theme-outline, rgba(0, 0, 0, 0.12));
}

.my-action-btn {
  background-color: var(--mdc-theme-primary, #6750a4);
  color: var(--mdc-theme-on-primary, #ffffff);
}
```
