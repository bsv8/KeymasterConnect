# Keymaster Connect 使用手册

面向接入 Keymaster 的网页 App，使用 VitePress 提供指南和从公开 SDK 导出生成的 API 字段说明。

- [接入指南](site/guide/getting-started.md)
- [能力说明](site/guide/capabilities.md)
- [会话](site/concepts/sessions.md)
- [错误处理](site/guide/errors.md)
- [发布说明](site/release-notes.md)

## 安装、构建与预览

使用 Node.js 22 和 pnpm 11.5.1，在本仓库根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm dev
# 生成静态站点
pnpm build
pnpm preview
```

静态产物位于 `site/.vitepress/dist/`。指南、主题和生成的 `site/api/` 均保存在本仓库中，构建与预览不需要 Keymaster 主项目。

部署在子路径时使用 `DOCS_BASE`，例如 `DOCS_BASE=/connect/ pnpm build`。
设置 `DOCS_REPOSITORY_URL=https://github.com/bsv8/KeymasterConnect` 可启用仓库和编辑链接；`DOCS_REPOSITORY_BRANCH` 默认为 `main`。
SDK 源码链接默认指向 `https://github.com/bsv8/keymaster.cc` 的 `main` 分支，可通过 `DOCS_SOURCE_REPOSITORY_URL` 和 `DOCS_SOURCE_REPOSITORY_BRANCH` 修改。

## 更新 API 字段说明

SDK 和协议类型仍由 Keymaster 主项目维护，不在文档仓库复制。先在 SDK 源项目执行 `pnpm install --frozen-lockfile`，然后在本仓库执行：

```bash
pnpm api:generate /path/to/keymaster.cc
pnpm build
```

也可设置 `KEYMASTER_SOURCE_DIR` 后执行 `pnpm api:generate`。生成命令读取 `packages/connect/src/index.ts` 及其公开协议类型；使用哪个源码版本由传入的源码目录决定。更新后审核并提交 `site/api/` 的变更，使其他人仅克隆文档仓库即可构建相同版本。

TypeDoc 配置和字段概览主题分别位于 `typedoc.json`、`typedoc-interface-overview.mjs`。更新脚本先在临时目录生成，生成失败不会覆盖已有 API 页面。
