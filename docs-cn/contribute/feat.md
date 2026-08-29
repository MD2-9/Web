# 新功能开发流程规范 (Feature Workflow)

---

## 1. 流程步骤

1. **Issue 讨论**：提交 Feature Request Issue，明确需求背景、交互规范与几何要求。
2. **分支创建**：基于最新 `main` 创建特性分支：`git checkout -b feat/your-feature-name`。
3. **开发与实现**：
   - 编写 SCSS 样式与 Foundation / Component 逻辑。
   - 更新 Demo 页面验证响应式交互。
4. **文档同步**：
   - 更新 `COMPONENTS.md`。
   - 在 `docs/` 与 `docs-cn/` 中更新对应的技术文档与使用示例。
5. **提交 PR**：提交 Pull Request 并关联对应 Issue。
