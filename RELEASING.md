# 发布 keymaster-connect

仓库根目录就是发布对象 **keymaster-connect@0.1.0**；`doc/` 是私有文档子项目，不发布。无 npm scope/org；协议保持 v1，许可证沿用原 LICENSE（AGPL v3）。

`0.1.0` 已由发布者完成公共发布，不要重复发布该版本。以下保留发布流程说明；后续版本号须另行确认。

## 发布前检查

在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm sdk:typecheck
pnpm sdk:build
```

包目录的 `prepublishOnly` 在发布时再次执行类型检查和构建。发布文件白名单只包含 dist、README、LICENSE 和 npm 必需的 package.json，不发布钱包源码、测试、文档站、凭据或 node_modules。

建议发布前审核并提交源码，确保 Git 来源可追溯；npm 的同一版本不能覆盖。工程测试与预检证据位于相邻工程仓 `todo/KeymasterConnect/2026-10-26-release-0.1.0/`。

## 发布者本人执行授权及发布

```sh
cd /data/home/Workspaces/KeymasterConnect
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish --access public --tag latest --registry=https://registry.npmjs.org/
```

按 npm 提示打开网页并完成授权/双重验证，不把 token 或验证码贴入代码或聊天。在仓库根目录发布，不要进入私有的 `doc/` 子项目发布。若名称不可用或版本已存在，停止核对，不擅自换名或提版本。

准备工作不执行 login/publish；不会用长期本地安装包替代 npm 分发。

## 发布后再迁移消费方

```sh
npm view keymaster-connect@0.1.0 name version dist.integrity dist-tags --registry=https://registry.npmjs.org/
```

确认注册表已有正确的 `keymaster-connect@0.1.0` 后，再把 Demo 和钱包消费方统一改为精确版本：

```json
{ "dependencies": { "keymaster-connect": "0.1.0" } }
```

同时更新 lockfile，删除长期 vendor 安装包、相关更新脚本和钱包对本地 SDK workspace 的依赖/构建钩子，复跑独立构建及集成回归。公开版本尚不存在时不提前切换，以免再次破坏安装。

`npm pack --dry-run` 只用于正常的发布内容检查，不代表采用本地安装包消费方案。SDK 测试通过也不等于钱包所有业务验收通过；钱包现有失败回归必须继续如实保留。
