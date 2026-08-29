# Cloudflare Workers & Pages 完整部署指南

本项目 **M2.9 (MDC-Web Extended)** 全面适配了 **Cloudflare Workers (支持 Workers Static Assets 与 Workers Builds)** 与 **Cloudflare Pages**。

- 署名：**安秋** ([github.com/unjal29](https://github.com/unjal29))
- 开源协议：全部组件统一遵循 **Apache License 2.0**
- 上游官方基准库：[Google MDC-Web](https://github.com/material-components/material-components-web)
- 参考说明：部分 UI 借用与参考自 [MDUI](https://github.com/zdhxiong/mdui)
- 字体声明：排版演示采用 **Google Sans Flex** 变量字体，版权归 **Google LLC** 所有。

---

## 目录
1. [故障排除：Pages/Workers 构建报错原因与修复说明](#一故障排除pages--workers-构建报错原因与修复说明)
2. [方式一：Cloudflare Workers Git 自动化部署 (官方 Workers Builds)](#方式一cloudflare-workers-git-自动化部署-官方-workers-builds)
3. [方式二：GitHub Actions CI/CD 自动部署 Workers (推荐)](#方式二github-actions-cicd-自动部署-workers-推荐)
4. [方式三：Cloudflare Pages Git 自动化部署](#方式三cloudflare-pages-git-自动化部署)
5. [方式四：Wrangler 本地 CLI 一键部署](#方式四wrangler-本地-cli-一键部署)
6. [核心配置文件说明](#核心配置文件说明)

---

## 一、故障排除：Pages / Workers 构建报错原因与修复说明

### 1. 报错原因分析
在现代 CI 环境（如 Cloudflare 默认提供的 Node.js v20 / v22）中：
- 旧版 `package.json` 包含 2017 年的 `node-sass@4.8.3`，该依赖需要 Python 2 和 C++ 编译（LibSass），在 Node.js 16+ / 22+ 上必然发生 `gyp: Undefined variable standalone_static_library` 崩溃。
- `wrangler.toml` 缺少 `pages_build_output_dir` 声明，导致 Pages 解析配置提示警告。

### 2. 现已完成的优化与修复
1. **现代化构建**：移除了废弃的 C++ 原生 `node-sass`，构建脚本 `scripts/build-css.js` 采用 100% 纯原生 Node.js ES 模块，**0 外部 npm 依赖**，在任何 Node.js 版本（18/20/22/24+）均可在 0.05 秒内秒级构建。
2. **配置文件双模适配**：`wrangler.toml` 中配置了 `pages_build_output_dir = "."`，同时兼容 Workers 与 Pages。
3. **路由回退与重定向**：根目录新增了 `index.html` 与 `_redirects`，在 Pages 静态分发与 Workers 边缘代理环境下均能准确重定向至 `/demos/index.html`。

---

## 方式一：Cloudflare Workers Git 自动化部署 (官方 Workers Builds)

Cloudflare Workers 现已原生支持 Git 仓库连接与自动化持续构建（Workers Builds）：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 导航至 **Compute (Workers) > Workers & Pages > Create application**；
3. 点击 **Workers** 选项卡，选择 **Connect to Git**（或在已有 Worker 的 **Settings > Build** 中关联 Git 仓库）；
4. 授权并选择您的 GitHub 仓库 `M2.9`；
5. 设置构建配置：
   - **Build command (构建命令)**: `node scripts/build-css.js` (或 `npm run build`)
   - **Deploy configuration (部署配置)**: 保持读取仓库根目录的 `wrangler.toml`
6. 点击 **Save and Deploy**。之后每次向 `main`/`master` 分支 `git push` 代码，Cloudflare 边缘系统都会自动拉取、编译 CSS 并发布最新版本。

---

## 方式二：GitHub Actions CI/CD 自动部署 Workers (推荐)

仓库已内置开箱即用的 GitHub Actions 配置文件 [`.github/workflows/deploy-workers.yml`](file:///.github/workflows/deploy-workers.yml)。

### 1. 获取 Cloudflare 凭证
- **API Token**: 登录 Cloudflare Dashboard -> **My Profile > API Tokens > Create Token** -> 选择 **Edit Cloudflare Workers** 模板创建 Token。
- **Account ID**: 进入 Workers 概览页，在右侧侧边栏即可复制 **Account ID**。

### 2. 配置 GitHub Secrets
进入 GitHub 仓库页面：
1. **Settings > Secrets and variables > Actions > New repository secret**；
2. 添加以下两个 Secret：
   - `CLOUDFLARE_API_TOKEN`: 填入你的 API Token
   - `CLOUDFLARE_ACCOUNT_ID`: 填入你的 Account ID

### 3. 自动触发部署
配置完成后，每次向 `main` 或 `master` 分支推送代码，GitHub Actions 将自动执行：
- 拉取代码并设置 Node.js 环境
- 执行 `node scripts/build-css.js` 生成全量 CSS 包
- 调用 `cloudflare/wrangler-action` 将 Worker 与静态资源秒级推送到全球 CDN 节点

---

## 方式三：Cloudflare Pages Git 自动化部署

若您更倾向于使用 Cloudflare Pages 进行静态托管：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 进入 **Compute (Workers) > Workers & Pages > Create application > Pages**；
3. 选择 **Connect to Git** 并关联 `M2.9` 仓库；
4. 配置构建设置：
   - **Framework preset**: `None`
   - **Build command**: `node scripts/build-css.js`
   - **Build output directory**: `.` (直接填入英文点号代表项目根目录)
5. 点击 **Save and Deploy** 即可顺利完成构建上线。

---

## 方式四：Wrangler 本地 CLI 一键部署

### 1. 本地前置准备
```bash
# 登录 Cloudflare 账户
npx wrangler login
```

### 2. 本地边缘预览 (Local Preview)
```bash
npm run preview
# 相当于: node scripts/build-css.js && wrangler dev
```
可在控制台输出的本地边缘模拟端口（如 `http://localhost:8787`）进行全真环境调试。

### 3. 一键发布上线
```bash
npm run deploy
# 相当于: node scripts/build-css.js && wrangler deploy
```

---

## 核心配置文件说明

| 文件 | 作用说明 |
| :--- | :--- |
| [`wrangler.toml`](file:///wrangler.toml) | Cloudflare Workers & Pages 统一根配置，包含 `[assets]` 静态绑定、`pages_build_output_dir`、`nodejs_compat` 兼容性标志。 |
| [`worker.js`](file:///worker.js) | Cloudflare Workers 边缘拦截器，负责 `/` 根路由到 `/demos/index.html` 的智能重写、`/assets/*` 别名映射与 CORS 请求头增强。 |
| [`.github/workflows/deploy-workers.yml`](file:///.github/workflows/deploy-workers.yml) | GitHub Actions CI/CD 流水线，实现提交代码自动部署 Workers。 |
| [`scripts/build-css.js`](file:///scripts/build-css.js) | 现代化纯原生 SCSS/CSS 全局编译与打包脚本，零第三方 npm 依赖。 |
| [`_redirects`](file:///_redirects) & [`index.html`](file:///index.html) | Pages 静态路由回退与根路径即时跳转配置文件。 |
