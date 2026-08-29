# 贡献指南 (Contributing)

感谢你对 **MDC-Web M2.9** 的关注与贡献！

---

## 1. 开发环境准备

1. **克隆仓库**：
   ```bash
   git clone https://github.com/MD2-9/Web.git
   cd Web
   ```
2. **安装依赖**：
   ```bash
   npm install
   ```
3. **启动本地开发服务器**：
   ```bash
   node server.js
   ```
   访问 `http://127.0.0.1:2929` 即可预览实时 Demo。

4. **编译样式产物**：
   ```bash
   node scripts/build-css.js
   ```

---

## 2. 贡献分类与指南索引

- [新功能开发规范 (Feature Workflow)](./feat.md)
- [缺陷修复规范 (Bug Fix Workflow)](./bug_fix.md)
- [代码评审规范 (Code Review)](./code_review.md)
