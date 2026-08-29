# Cloudflare Workers & Pages 部署指南

本项目 **M2.9 (MDC-Web Extended)** 已完全适配 **Cloudflare Workers** (支持 Workers Static Assets) 与 **Cloudflare Pages**。

- 署名：**安秋** ([github.com/unjal29](https://github.com/unjal29))
- 开源协议：修改与扩展组件遵循 **MIT License** | 原版 Google MDC 基础遵循 **Apache License 2.0**
- 上游官方基准库：[Google MDC-Web (github.com/material-components/material-components-web)](https://github.com/material-components/material-components-web)
- 参考说明：部分 UI 借用与参考自 [MDUI (github.com/zdhxiong/mdui)](https://github.com/zdhxiong/mdui)
- 字体声明：排版演示采用 **Google Sans Flex** 变量字体，版权归 **Google LLC** 所有。

---

## 方式一：使用 Wrangler CLI 一键部署 (推荐)

### 1. 前置准备
确保已安装 Node.js 与 Wrangler CLI：
```bash
# 全局安装 wrangler (如未安装)
npm install -g wrangler

# 登录 Cloudflare 账户
npx wrangler login
```

### 2. 构建静态资源与全局 CSS
部署前确保已生成最新版本的 CSS 样式包：
```bash
node scripts/build-css.js
```

### 3. 本地预览 (Local Preview)
在本地模拟 Cloudflare Workers 边缘环境运行：
```bash
npm run preview
# 或 npx wrangler dev
```
启动后可在控制台输出的地址（如 `http://localhost:8787`）进行测试，所有组件和资源路径均与线上环境完全一致。

### 4. 发布上线 (Deploy to Production)
执行部署命令：
```bash
npm run deploy
# 或 npx wrangler deploy
```
发布成功后，Wrangler 会输出你的专属线上域名，例如：
`https://m2-9-showroom.<your-subdomain>.workers.dev`

---

## 方式二：Cloudflare Pages Git 自动化部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 进入 **Compute (Workers) > Workers & Pages > Create application**；
3. 选择 **Pages** 选项卡并连接您的 GitHub 仓库 `M2.9`；
4. 配置构建参数：
   - **Framework preset**: `None`
   - **Build command**: `node scripts/build-css.js`
   - **Build output directory**: `.` (根目录)
5. 点击 **Save and Deploy**，后续每次 `git push` 均会自动构建并部署至全球 CDN 边缘节点。

---

## 核心配置文件说明

- [wrangler.toml](file:///c:/Users/unjal/Documents/Git/M2.9/wrangler.toml)：Cloudflare Workers 根配置文件，开启了 `[assets]` 静态托管与 `nodejs_compat`。
- [worker.js](file:///c:/Users/unjal/Documents/Git/M2.9/worker.js)：边缘路由拦截器，自动将根路径 `/` 路由到 `/demos/index.html`，并支持 `/assets/*` 别名映射与 CORS 跨域头。
- [scripts/build-css.js](file:///c:/Users/unjal/Documents/Git/M2.9/scripts/build-css.js)：组件库 SCSS 编译与全量 CSS 打包脚本。
