# UI/UX 设计师个人作品集

这是一个适合部署到 GitHub Pages 的静态个人 UI/UX 作品集网站，包含展示页、项目详情页和个人中心。

## 本地预览

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/index.html
```

## GitHub Pages 部署

1. 在 GitHub 新建仓库，例如 `ai-pm-portfolio`。
2. 把本目录所有文件提交并推送到仓库的 `main` 分支。
3. 进入 GitHub 仓库的 `Settings -> Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/root`，保存。
6. 等待 GitHub Pages 发布完成。

发布后的地址通常是：

```text
https://你的GitHub用户名.github.io/仓库名/
```

## 后续编辑内容

展示页优先读取根目录的 `site-config.json`。

当前个人中心会把编辑后的内容保存到浏览器本地，并支持复制完整配置：

1. 打开展示页。
2. 点击 `个人中心`。
3. 输入通行证。
4. 编辑内容并点击 `保存全部内容`，可先本地预览。
5. 点击 `复制 site-config.json`。
6. 到 GitHub 仓库里打开 `site-config.json`。
7. 点击编辑，把复制的内容整体替换进去并提交。
8. GitHub Pages 会自动重新发布。

## 一键发布到 GitHub

项目已提供 Cloudflare Worker 后端示例：`worker/cloudflare-worker.js`。

它的作用是接收个人中心发来的配置内容，然后安全地调用 GitHub API 更新仓库里的 `site-config.json`。GitHub Token 只放在 Cloudflare Worker 环境变量里，不会暴露在前端网页源码中。

### 1. 创建 GitHub Token

建议创建 fine-grained token：

- Repository access：只选择 `ai-pm-portfolio`
- Permissions：`Contents` 选择 `Read and write`

### 2. 创建 Cloudflare Worker

在 Cloudflare Workers 新建一个 Worker，把 `worker/cloudflare-worker.js` 的代码复制进去。

### 3. 配置 Worker 环境变量

在 Worker 的 Settings / Variables 中添加：

```text
GITHUB_TOKEN=你的 GitHub fine-grained token
GITHUB_OWNER=lilibin88888888-byte
GITHUB_REPO=ai-pm-portfolio
GITHUB_BRANCH=main
PUBLISH_SECRET=你自己设置的一串发布密钥
ALLOWED_ORIGIN=https://lilibin88888888-byte.github.io
```

如果你的 GitHub Pages 实际访问地址带仓库路径，这是正常的，`ALLOWED_ORIGIN` 只需要填域名来源，不包含路径。

### 4. 在个人中心发布

1. 打开个人中心。
2. 编辑内容。
3. `Worker 发布接口` 填 Cloudflare Worker 地址，例如：

```text
https://你的-worker.你的账号.workers.dev
```

4. `发布密钥` 填 Cloudflare Worker 里的 `PUBLISH_SECRET`。
5. 点击 `保存并发布到 GitHub`。

发布成功后，Worker 会更新 GitHub 仓库中的 `site-config.json`，GitHub Pages 会稍后自动更新。

## 文件说明

- `index.html`：展示页
- `project-detail.html`：项目详情页
- `project-admin.html`：个人中心
- `style.css`：页面样式
- `script.js`：页面渲染与个人中心逻辑
- `site-config.json`：线上展示内容配置
- `worker/cloudflare-worker.js`：一键发布到 GitHub 的安全后端
- `assets/resume.pdf`：简历下载文件
