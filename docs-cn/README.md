# MDC-Web · M2.9 中文开发文档 (Documentation)

欢迎查阅 **Material Components for Web (MDC-Web) · M2.9** 官方中文技术文档。本项目基于官方 Material Components Web 深度重构与定制扩展，融合了 **0px 纯直角 & 50% 纯圆几何规范**、**Google Sans Flex 变量字体**、**Material You (CAM16 & HCT) 莫奈动态色彩体系** 以及一系列现代交互组件。

---

## 📚 文档目录索引

### 1. 新手入门与基础指南
- [快速入门 (Getting Started)](./getting-started.md)：环境搭建、NPM 安装、SCSS 编译与 JavaScript 引入。
- [莫奈动态色彩体系 (Theming & Monet)](./theming.md)：深入理解 HCT/CAM16 算法、三色模式、调色盘与 CSS 变量系统。
- [框架集成指南 (Framework Integration)](./integrating-into-frameworks.md)：在 React、Vue、Angular 等现代前端框架中使用 MDC-Web。

### 2. M2.9 核心扩展与定制组件指南
- [侧边栏与移动端抽屉 (Navigation Rail & Mobile Drawer)](./navigation-rail-and-drawer.md)：桌面端悬浮导轨与移动端底端对齐抽屉架构与规范。
- [日历与时钟选择器 (Date & Time Pickers)](./pickers.md)：0px 直角日历与 1:1 动态表盘时间选择器调用指南。
- [扁平化边界动效 (Flat Arc EdgeEffect)](./overscroll-edge-effect.md)：1:1 复刻 Android 原生边界水波纹吸能与回弹规范。
- [组件全景规范手册 (Components Catalog)](../COMPONENTS.md)：全部组件的 API 速查与 HTML 结构规范。

### 3. 代码架构与开发规范 (`/code`)
- [架构全景解析 (Architecture)](./code/architecture.md)：Subsystem、Component、Foundation 与 Adapter 核心解耦模式。
- [最佳实践 (Best Practices)](./code/best_practices.md)：Sass、CSS 类名、JavaScript 代码组织与性能优化。
- [组件开发指南 (Authoring Components)](./authoring-components.md)：如何从零构建符合 MDC 规范的标准组件。
- [README 编写标准 (README Standards)](./code/readme_standards.md)：包说明文档模板与书写规范。

### 4. 社区贡献与协作流程 (`/contribute`)
- [贡献指南 (Contributing)](./contribute/README.md)：环境构建、单元测试与工作流。
- [新功能开发规范 (Feature Workflow)](./contribute/feat.md)：功能立项与实现流程。
- [缺陷修复规范 (Bug Fix Workflow)](./contribute/bug_fix.md)：Issue 追踪与 Bug 修复准则。
- [代码评审规范 (Code Review)](./contribute/code_review.md)：PR 审查标准与合并准则。
