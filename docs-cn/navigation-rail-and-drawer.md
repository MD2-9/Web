# 侧边栏与移动端抽屉规范指南 (Navigation Rail & Mobile Drawer)

> **核心设计理念**：桌面端与移动端彻底解耦，桌面端追求高效悬浮与视觉上下居中，移动端追求贴合单手大拇指的靠底对齐与触控手势。

---

## 1. 响应式架构与分工

```
┌───────────────────────────────────┬────────────────────────────────────┐
│ 桌面端 (Viewport >= 600px)        │ 移动端 (Viewport < 600px)          │
├───────────────────────────────────┼────────────────────────────────────┤
│ • 组件：MdcNavigationRail         │ • 组件：MdcMobileDrawer            │
│ • DOM 容器：#app-rail             │ • DOM 容器：#app-mobile-drawer     │
│ • 状态：80px 常驻单图标导轨       │ • 状态：默认完全隐藏在屏幕左侧之外 │
│ • 展开机制：Hover 悬浮即时展开    │ • 唤出机制：左边缘右滑 / 悬浮按钮  │
│ • 二级面板对齐：上下居中对齐      │ • 二级面板对齐：向下对齐 (贴底)    │
│ • 页面跳转行为：即时生效          │ • 页面跳转行为：平滑滚动 + 0.39s收回│
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. 桌面端：竖向导航导轨 (`MdcNavigationRail`)

### 2.1 交互规范
1. **收起状态 (72px / 80px)**：仅显示图标，顶部展示圆形头像，底部展示暗色切换与主题配置等全局按钮。
2. **Hover 展开 (256px / 260px)**：鼠标移入导轨区域平滑展开，文字标签以 `opacity: 1; transition: opacity 0.3s;` 渐显；鼠标移出或单点空白处收回。
3. **单点空白区域返回**：
   - 处于二级抽屉面板时，点击任何空白区域（非按钮/链接/输入框）立即返回一级菜单；
   - 处于一级菜单时，点击空白区域立即收起侧边栏。
4. **右键返回机制 (Right-Click Context Menu Return)**：
   - 在侧边栏（一级导航栏、二级抽屉面板、右侧组件栏）任意区域右键点击，将自动拦截系统原生右键菜单，并立即触发返回上一级菜单或收起侧边栏操作。
5. **二级抽屉面板 (Secondary Overlay Panels)**：
   - 点击“组件目录”、“设置”、“关于”或“主题调色盘”时唤出。
   - 以点击坐标为原点扩散展开圆圈遮罩（`clip-path: circle()`）。
   - **上下居中规范**：二级面板内的列表（`.rail-nav-list`）、自定义卡片（`.secondary-overlay-content`）及调色盘色块（`.theme-grid`）在桌面端统一采用**上下居中对齐**（`margin: auto 0; justify-content: center;`）。当内容超出高度时，自动触发内部纵向滚动。

---

## 3. 移动端：独立抽屉组件 (`MdcMobileDrawer`)

### 3.1 交互规范
1. **默认状态**：
   - 完全移出屏幕左侧（`transform: translateX(-100%)`），不占用页面宽度。
   - 桌面端 Navigation Rail 在移动端彻底隐藏（`display: none !important`）。
2. **唤出方式**：
   - **屏幕边缘右滑**：在屏幕左侧边缘（$X < 35\text{px}$）向右滑动超过 $45\text{px}$ 唤出。
   - **悬浮按钮**：页面静止 2.9 秒后，左下角自动浮现悬浮操作按钮（FAB），点击即唤出。
3. **收起方式**：
   - 在抽屉上向左反向滑动。
   - 单击遮罩层或右侧空白区域。
   - **0.39s 页面跳转延迟收回**：点击内部页面锚点导航项（`href="#section-..."`）时，页面平滑滚动至对应位置，并在**延迟 0.39 秒**后自动收回抽屉，给用户明确的操作反馈。
4. **向下对齐规范 (Bottom-to-Top)**：
   - 抽屉内一级列表与二级面板的所有按钮均采用**靠底向下对齐**（`justify-content: flex-end; margin-top: auto; margin-bottom: 0;`），置于单手大拇指最轻松触及的黄金操作区。

---

## 4. 代码调用示例

### 4.1 HTML 结构
```html
<!-- 桌面端 Navigation Rail -->
<nav class="mdc-navigation-rail" id="app-rail">
  <div class="rail-header">
    <div class="rail-header-avatar">M</div>
    <span class="rail-header-text">M2.9 Web</span>
  </div>
  <div class="rail-nav-list">
    <a href="#section-overview" class="rail-nav-item is-active">
      <i class="material-icons rail-item-icon">home</i>
      <span class="rail-item-text">首页</span>
    </a>
  </div>
</nav>

<!-- 移动端独立抽屉与遮罩 -->
<aside class="mdc-mobile-drawer" id="app-mobile-drawer"></aside>
<div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop"></div>
<button class="mobile-floating-menu-btn" id="mobileMenuBtn">
  <i class="material-icons">menu</i>
</button>
```

### 4.2 JavaScript 初始化
```javascript
import { MdcNavigationRail } from '@material/navigation-rail';
import { MdcMobileDrawer } from '@material/mobile-drawer';

// 初始化桌面端
const rail = new MdcNavigationRail(document.getElementById('app-rail'), {
  expandOnHover: true
});

// 初始化移动端
const drawer = new MdcMobileDrawer(document.getElementById('app-mobile-drawer'), {
  backdrop: document.getElementById('mobileDrawerBackdrop'),
  floatingBtn: document.getElementById('mobileMenuBtn'),
  navDelayMs: 390
});
```
