# 发布 keymaster-connect

仓库根目录发布 `keymaster-connect`，当前版本 `0.4.0`，wire 保持 v1。当前源码以完整记录字符串传递 `publicationProof` 建连证明（SDK 只读取入口记录并整体传递，不设证明专用长度上限，解码与验签归钱包），包含带挑战码的显式登录／启动、链尖订阅与批量交易查询、可恢复 MSFile 读取，不提供连接恢复或 App 存储。源码变更须发布新包才影响消费方。`doc/` 为私有文档子项目，不发布；许可证沿用 LICENSE。

## 发布前验证

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm --dir ../BSV8_Engineering run parity:keymaster-connect
pnpm --dir ../BSV8_Engineering run e2e:app-connect:browser -- --candidate demo-start
```

发布包只包含 dist、README、LICENSE 及 npm 必需的 package.json。候选 tarball 安装到仓库外的隔离钱包和 Demo，验证真实官方 Client/Receiver、授权、Worker 和数据后端；消费方仍锁定已公共发布版本，不长期使用 vendor 或相邻源码。候选验证不代表注册表发布。

## 发布者本人执行授权及发布

准备工作不执行 login/publish。发布须另行明确授权，并完成 npm 本人的有效授权；不能把令牌或验证码放入代码、日志或聊天。同一 npm 版本不能覆盖，版本已存在时先核对，不擅自改名或升版。

```sh
pnpm whoami --registry=https://registry.npmjs.org/
pnpm publish --access public --tag latest --registry=https://registry.npmjs.org/
```

## 发布后升级消费方

```sh
pnpm view keymaster-connect@0.4.0 name version dist.integrity --registry=https://registry.npmjs.org/
```

确认注册表已存在正确版本后，钱包 contracts/plugin-connect、Demo、Publish 与 Aunel 才精确升级到 `0.4.0`，更新锁文件并复跑独立构建及针对性 E2E；不提前依赖不存在的 npm 版本。其他消费方继续锁定各自当前的正式版本，按独立发布安排升级。钱包按实际安装的官方 SDK 方法表公开方法，旧 SDK 不会开放候选方法。
