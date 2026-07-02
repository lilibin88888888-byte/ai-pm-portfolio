# AI 产品经理个人作品集

这是一个适合部署到 GitHub Pages 的静态个人作品集网站，包含展示页、项目详情页和个人中心。

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

## 文件说明

- `index.html`：展示页
- `project-detail.html`：项目详情页
- `project-admin.html`：个人中心
- `style.css`：页面样式
- `script.js`：页面渲染与个人中心逻辑
- `site-config.json`：线上展示内容配置
- `assets/resume.pdf`：简历下载文件
