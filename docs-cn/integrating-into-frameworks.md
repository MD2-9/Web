# 前端框架集成指南 (Integrating into Frameworks)

由于 MDC-Web 采用 Foundation / Adapter 架构设计，你可以非常轻松地将其集成进任意现代前端框架（如 React、Vue、Angular 等）。

---

## 1. 基础概念

- **包装原生 Component**：最简单直接的方式，在组件挂载生命周期（如 `componentDidMount` 或 `onMounted`）中调用原生 `new MDCComponent(ref)`，在卸载时调用 `.destroy()`。
- **重写 Adapter**：深度集成方式，利用框架自身的响应式状态系统与 Virtual DOM 实现 Adapter，直接驱动 Foundation。

---

## 2. 在 React 中使用

### 示例：包装 MDC 按钮与水波纹
```jsx
import React, { useEffect, useRef } from 'react';
import { MDCRipple } from '@material/ripple';

export function MaterialButton({ children, raised = false, onClick }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    let ripple;
    if (buttonRef.current) {
      ripple = new MDCRipple(buttonRef.current);
    }
    return () => {
      if (ripple) ripple.destroy();
    };
  }, []);

  const className = `mdc-button ${raised ? 'mdc-button--raised' : ''}`;

  return (
    <button ref={buttonRef} className={className} onClick={onClick}>
      {children}
    </button>
  );
}
```

---

## 3. 在 Vue 3 中使用

### 示例：M2.9 时间选择器组件封装
```vue
<template>
  <div ref="pickerRoot" class="mdc-time-picker">
    <!-- TimePicker HTML Structure -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MdcTimePicker } from '@material/picker';

const emit = defineEmits(['select']);
const pickerRoot = ref(null);
let pickerInstance = null;

onMounted(() => {
  if (pickerRoot.value) {
    pickerInstance = new MdcTimePicker(pickerRoot.value, {
      onSelect: (time) => emit('select', time)
    });
  }
});

onUnmounted(() => {
  if (pickerInstance) {
    pickerInstance.destroy?.();
  }
});
</script>
```
