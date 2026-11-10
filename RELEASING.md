# 发布 keymaster-connect

仓库根目录发布 `keymaster-connect`，wire 保持 v1。当前注册表版本为 `0.1.4`；源码 `0.1.5` 候选增加 `storage.encrypted.put/get` 与客户端可选加密方法，尚未公共发布。`doc/` 为私有文档子项目，不发布；许可证沿用 LICENSE。

## 发布前验证

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

发布包只包含 dist、README、LICENSE 及 npm 必需的 package.json。候选 tarball 安装到仓库外的隔离钱包和 Demo，验证真实官方 Client/Receiver、授权、Worker 和数据后端；消费方仍锁定已公共发布版本，不长期使用 vendor 或相邻源码。候选验证不代表注册表发布。

## 发布者本人执行授权及发布

准备工作不执行 login/publish。发布须另行明确授权，并完成 npm 本人的有效授权；不能把令牌或验证码放入代码、日志或聊天。同一 npm 版本不能覆盖，版本已存在时先核对，不擅自改名或升版。

```sh
npm whoami --registry=https://registry.npmjs.org/
npm publish --access public --tag latest --auth-type=web --registry=https://registry.npmjs.org/
```

## 发布后升级消费方

```sh
npm view keymaster-connect@0.1.5 name version dist.integrity --registry=https://registry.npmjs.org/
```

确认注册表已存在正确版本后，钱包 contracts/plugin-protocol 和 Demo 才精确升级到 `0.1.5`，更新锁文件并复跑独立构建及针对性 E2E；不提前依赖不存在的 npm 版本。钱包按实际安装的官方 SDK 方法表公开方法，旧 SDK 不会开放候选加密方法。
