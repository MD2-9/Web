# 架构全景解析 (Architecture)

MDC-Web M2.9 采用高度工程化的多包单仓（Monorepo）架构，每个包都是独立的子系统（Subsystem）或组件（Component）。

---

## 1. 模块分类

1. **Subsystem (子系统)**：
   - 跨越多个组件的通用能力。例如 `@material/theme`（颜色系统与莫奈动态色彩）、`@material/typography`（排版与 Google Sans Flex）、`@material/animation`（动效曲线与持续时间）、`@material/ripple`（水波纹与边界弧形动效）。
2. **Component (独立组件)**：
   - 具有明确视觉与交互边界的独立实体。例如 `@material/button`、`@material/card`、`@material/picker`、`@material/navigation-rail`、`@material/mobile-drawer`。

> **核心原则**：每个组件均可独立于其他组件使用与打包。

---

## 2. Sass 样式体系

- 所有的 CSS 均由 Sass (SCSS) 编译生成。
- 子系统提供 Sass mixin，组件通过引入 mixin 复用样式声明。
- 每个独立组件包均能独立编译出属于该组件的单体 CSS 文件，同时也汇聚于总包 `@material/material-components-web` 中。

---

## 3. JavaScript 核心分层：Foundation & Adapter

```
              ┌────────────────────────┐
              │    MDCComponent        │
              │  (Vanilla JS 组件包装)  │
              └───────────┬────────────┘
                          │ implements
                          ▼
              ┌────────────────────────┐
              │     MDCAdapter         │
              │  (DOM 接口定义与桥接)  │
              └───────────▲────────────┘
                          │ uses
                          │
              ┌───────────┴────────────┐
              │    MDCFoundation       │
              │   (纯粹核心业务逻辑)   │
              └────────────────────────┘
```

1. **MDCFoundation**：实现 Material Design 交互规范的核心逻辑，不保留对 DOM 的直接硬编码依赖。
2. **MDCAdapter**：纯接口定义，描述 Foundation 与宿主环境交互所需的抽象方法。
3. **MDCComponent**：面向 Vanilla JS 开发者的标准包装，内部注入具体的 DOM 操作 Adapter 并管理事件监听。
