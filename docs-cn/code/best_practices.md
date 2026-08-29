# 代码最佳实践 (Best Practices)

为确保 MDC-Web M2.9 的代码质量、健壮性与可维护性，所有代码贡献均需遵循以下最佳实践：

---

## 1. CSS 与 Sass 规范

- **遵循 BEM 命名规范**：类名格式必须为 `mdc-[block]__[element]--[modifier]`。
- **0px 纯直角与 50% 纯圆几何**：常规容器、卡片、输入框、按钮等一律采用 `border-radius: 0`；圆形 FAB、头像、选择态一律采用 `border-radius: 50%`。
- **避免直接使用硬编码颜色**：一律使用 `var(--mdc-theme-*)` CSS 变量或 `@material/theme` 混入函数。
- **样式隔离与作用域**：避免对通用 HTML 标签（如 `button`、`div`）直接应用全局裸选择器。

---

## 2. JavaScript 规范

- **单向数据流与清晰生命周期**：在 `destroy()` 中必须清理所有事件监听器、定时器（`clearTimeout`/`clearInterval`）与 DOM 引用，防止内存泄漏。
- **严格 DOM 隔离**：Foundation 层严禁出现 `document.querySelector`、`window.addEventListener` 等硬编码，所有 DOM 操作必须抽象为 Adapter 接口方法。
- **动效硬件加速**：涉及移动、缩放与遮罩的动效，优先使用 `transform` 与 `opacity` 并合理声明 `will-change`。
