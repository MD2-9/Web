# Android 扁平化边界弧形动效指南 (Flat Arc EdgeEffect)

MDC-Web M2.9 在 Web 端 1:1 严格复刻了 Android 5.0 (Lollipop) 至 Android 11.0 (R) 经典系统的 `android.widget.EdgeEffect` 扁平化半椭圆弧顶临界触碰动效。

---

## 1. 动效设计与 AOSP 对齐

1. **色彩与透明度**：
   - 采用与 Material Ripple 相同的主题色彩，纯色微透无外发光或模糊光晕。
2. **物理阻尼与临界拉伸 (`onPull` / 触摸屏)**：
   - 支持触点横向偏置（`mDisplacement`），弧顶中心随触摸位置动态横向移动。
   - **阻尼曲线与临界高度/宽度调校**：
     - **上下垂直临界**：水波纹高度严格按当前容器宽度 ($W$) 计算，最大拉伸采用 **21% 宽度 ~ 29% 宽度动态曲线**（窄容器最高 **29%**，宽容器最高 **21%**），倍率为 **滚动距离 × 12%**，移动难度为 **3 倍**（基准 `300px`）。
     - **左右水平临界**：水波纹宽度严格按当前容器高度 ($H$) 计算，最大拉伸采用 **8% 高度 ~ 12% 高度动态曲线**（低高度容器最高 **12%**，高容器最高 **8%**），倍率为 **滚动距离 × 3%**。
3. **内容水波纹与组件水波纹独立隔离**：
   - 页面主体内容与右侧常驻组件栏采用独立水波纹计算体系，宽度按当前容器实际净可用宽度动态计算，在单栏、多栏以及组件栏折叠/展开等任意布局状态下均 100% 精确对齐。
4. **惯性吸能与鼠标滚轮 (`onAbsorb` / 鼠标滚轮)**：
   - 快速滑动或鼠标滚轮触碰边界时：
     - **上下垂直**：采用 **12% 宽度 ~ 16% 宽度动态曲线**（窄容器最高 **16%**，宽容器最高 **12%**，倍率 12%）；
     - **左右水平**：采用 **6% 高度 ~ 8% 高度动态曲线**（倍率 3%），并在 0.35s 内平滑展开并回弹消退。

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
