# 缺陷修复流程规范 (Bug Fix Workflow)

---

## 1. 流程步骤

1. **复现与定位**：提交 Bug Report，附带环境信息、视口尺寸、复现截图或录屏。
2. **分支创建**：基于最新 `main` 创建修复分支：`git checkout -b fix/issue-description`。
3. **修复与验证**：
   - 修复 CSS / JS 代码。
   - 在桌面端与移动端双向测试，避免破坏现有响应式状态。
4. **编译与验证**：
   - 运行 `node scripts/build-css.js` 重新编译样式包。
   - 本地 `http://127.0.0.1:2929` 完整回归测试。
5. **提交 PR**：发起代码合并请求。
