# 发布 keymaster-connect

仓库根目录就是发布对象 **keymaster-connect@0.1.2（候选）**；`doc/` 是私有文档子项目，不发布。无 npm scope/org；协议保持 v1，许可证沿用原 LICENSE（AGPL v3）。

`0.1.1` 已公共发布，wire 仍固定为 1；不要重复发布已存在的版本。当前 0.1.2 是完整钱包连接候选，尚未执行公共发布。需完成候选回归，再由发布者执行有效的 npm 授权及发布。

## 发布前检查

在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm sdk:typecheck
pnpm sdk:build
```

包目录的 `prepublishOnly` 在发布时再次执行类型检查和构建。发布文件白名单只包含 dist、README、LICENSE 和 npm 必需的 package.json，不发布钱包源码、测试、文档站、凭据或 node_modules。

建议发布前审核并提交源码，确保 Git 来源可追溯；npm 的同一版本不能覆盖。工程测试命令为 `npm run test:connect`、`npm run typecheck:connect`、`npm run test:connect:e2e -- --candidate`（在相邻 `BSV8_Engineering` 执行）。候选包测试在临时隔离目录安装真实 tarball，构建真实 Demo 与钱包、执行 Demo 单元和双产品 Playwright 回归；不是长期本地包消费方式，也不代表注册表已发布。双产品测试状态见工程仓 `todo/keymaster.cc/2026-10-28-connect-login-e2e/`。

## 发布者本人执行授权及发布

```sh
cd /data/home/Workspaces/KeymasterConnect
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish --access public --tag latest --auth-type=web --registry=https://registry.npmjs.org/
```

使用支持网页发布授权的新版 npm CLI，在交互终端执行；按 npm 提示打开网页并完成授权/双重验证，不把 token 或验证码贴入代码或聊天。在仓库根目录发布，不要进入私有的 `doc/` 子项目发布。若名称不可用或版本已存在，停止核对，不擅自换名或提版本。

准备工作不执行 login/publish；不会用长期本地安装包替代 npm 分发。

## 发布后再迁移消费方

```sh
npm view keymaster-connect@0.1.2 name version dist.integrity dist-tags --registry=https://registry.npmjs.org/
```

确认注册表已有正确的 `keymaster-connect@0.1.2` 后，在 Demo 执行 `npm install --save-exact keymaster-connect@0.1.2` 更新依赖与 lockfile。钱包消费方升级另行安排。精确依赖为：

```json
{ "dependencies": { "keymaster-connect": "0.1.2" } }
```

同时更新 lockfile，删除长期 vendor 安装包、相关更新脚本和钱包对本地 SDK workspace 的依赖/构建钩子，复跑独立构建及集成回归。公开版本尚不存在时不提前切换，以免再次破坏安装。

`npm pack --dry-run` 只用于正常的发布内容检查，不代表采用本地安装包消费方案。SDK 测试通过也不等于钱包所有业务验收通过；钱包现有失败回归必须继续如实保留。
