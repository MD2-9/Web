# Android 扁平化边界弧形动效指南 (Flat Arc EdgeEffect)

MDC-Web M2.9 在 Web 端 1:1 严格复刻了 Android 5.0 (Lollipop) 至 Android 11.0 (R) 经典系统的 `android.widget.EdgeEffect` 扁平化半椭圆弧顶临界触碰动效。

---

## 1. 动效设计与 AOSP 对齐

1. **色彩与透明度**：
   - 采用与 Material Ripple 相同的主题色彩，纯色微透无外发光或模糊光晕。
2. **物理阻尼与临界拉伸 (`onPull`)**：
   - 支持触点横向偏置（`mDisplacement`），弧顶中心随触摸位置动态横向移动。
   - 阻尼阈值精细调校：左右两侧临界阈值比例为 **10%**，上下两侧临界阈值比例为 **20%**，产生扎实、可控的物理弹性手感。
3. **惯性吸能与回弹 (`onAbsorb` & `onRelease`)**：
   - 快速滑动触碰边界时，根据冲击速度瞬间拉满弧顶并在 0.35s 内平滑回弹消退。

---

## 2. 代码调用与自动挂载

### 2.1 全局自动挂载
```javascript
import { attachFlatEdgeEffect } from '@material/ripple';

// 自动为 window、document 以及所有标注了 data-m29-overscroll 的滚动容器挂载边界动效
const edgeManager = attachFlatEdgeEffect();
```

### 2.2 为特定内部滚动卡片手动绑定
```html
<div class="my-scrollable-card" data-m29-overscroll style="overflow-y: auto; height: 300px;">
  <!-- 卡片长内容 -->
</div>
```

```javascript
import { M29FlatEdgeEffect } from '@material/ripple';

const cardEl = document.querySelector('.my-scrollable-card');
const edgeEffect = new M29FlatEdgeEffect(cardEl);
```
