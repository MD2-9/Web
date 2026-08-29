# 组件开发指南 (Authoring Components)

本指南面向 MDC-Web 核心贡献者及希望开发兼容 MDC 生态的自定义组件开发者。

---

## 1. 组件架构核心模型 (Foundation / Adapter 模式)

MDC-Web 将每个动态组件拆分为两个核心层面：

```
┌─────────────────────────────────────────────────────────────┐
│                    Component (组件外壳)                     │
│  - 负责直接与 Host DOM 交互 (Vanilla JS / React / Vue)      │
│  - 继承自 MDCComponent                                      │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│  提供 Adapter 适配器实现     │  调用 Foundation 业务方法    │
│  (如 addClass, getAttr)      │  (如 handleClick, activate)  │
│                              │                              │
├──────────────────────────────┴──────────────────────────────┤
│                    Foundation (核心逻辑层)                  │
│  - 纯 JavaScript 业务逻辑与状态机                           │
│  - 绝对不包含任何直接 DOM 操作与 window / document 引用     │
│  - 继承自 MDCFoundation                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 为什么要使用 Foundation / Adapter 模式？
- **跨前端框架无缝复用**：核心交互算法（如水波纹物理扩散、选择器角度计算）只需在 Foundation 中编写一次，即可通过编写轻量级 Adapter 适配到 React、Vue、Angular、Svelte 等任意框架。
- **高测试覆盖度与可测性**：Foundation 可以进行 100% 纯逻辑单元测试，无需庞大的真实浏览器 DOM 环境。

---

## 2. 开发组件的标准步骤

1. **确定 HTML 语义结构与 BEM 类名规范**：
   - 遵循 `mdc-[component-name]__[element]--[modifier]` 命名约定。
2. **定义 Foundation 常量 (constants.js)**：
   - 将所有 CSS 类名、事件名、字符串与数字阈值定义在 `cssClasses`、`strings`、`numbers` 常量字典中。
3. **声明 Adapter 接口 (adapter.js)**：
   - 定义 Foundation 所需的抽象 DOM 操作方法（如 `addClass(className)`、`registerInteractionHandler(type, handler)`）。
4. **实现 Foundation 逻辑 (foundation.js)**：
   - 编写状态流转与事件响应逻辑，通过 `this.adapter_` 间接操作界面。
5. **实现 Component 外壳 (index.js)**：
   - 继承 `MDCComponent`，在 `getDefaultFoundation()` 中提供针对 Vanilla JS 的 Adapter 具体实现。
   - 提供静态工厂方法 `static attachTo(root)`。
6. **编写 SCSS 样式表 (mdc-[component].scss)**：
   - 引入主题变量 `@import "@material/theme/mdc-theme"`。
   - 遵循 M2.9 的 0px 纯直角与 50% 纯圆几何骨架规范。

---

## 3. 标准目录结构

每个独立组件包置于 `packages/mdc-[component-name]/` 目录下：

```
packages/mdc-my-component/
├── README.md               # 英文说明文档
├── package.json            # NPM 包配置
├── index.js                # 组件入口与 Vanilla Component 实现
├── foundation.js           # 核心 Foundation 逻辑
├── adapter.js              # Adapter 接口定义
├── constants.js            # 字符串与 CSS 常量定义
├── mdc-my-component.scss   # 根样式入口
└── _mixins.scss            # 混入与尺寸变量
```
