# Keymaster Connect 文档子项目

本目录是私有文档工程，不发布 npm。客户端、接收端及公开契约位于仓库根目录 `../src`；文档生成不需要 Keymaster 钱包源码。

## 目录与入口

- 仓库根目录 `..`：主项目 SDK，npm 包名 `keymaster-connect`。
  - `keymaster-connect`：浏览器 Client、二进制工具、公开类型。
  - `keymaster-connect/protocol`：纯公开契约及常量。
  - `keymaster-connect/server`：生产 Receiver、请求校验、App proof 密码学验证。
- `site`：接入指南、会话语义及同仓源码生成的 API 手册。
- 测试与验收过程按项目规则位于相邻 `BSV8_Engineering/test/KeymasterConnect`、`e2e/KeymasterConnectDemo`、`todo/KeymasterConnect`；不属于第三方运行时依赖。

钱包 `keymaster.cc` 消费本包的 Receiver，不再自建公开协议校验/绑定/封包。授权审批、UI、私钥、UTXO、签名、持久付款幂等及 Storage/MSFile 业务仍在钱包，不进入 SDK。SDK 的 `assertCurrent` 不替代钱包在不可逆 I/O 前的授权/世代复核。

## 仓库安装与 SDK 构建

Node.js >=22，pnpm 11.5.1：

```sh
cd ..
pnpm install --frozen-lockfile
npm run typecheck
npm run build
```

SDK 已从仓库根目录公共发布无 scope 的 `keymaster-connect@0.1.1`；第三方统一从 npm 安装，不维护长期 vendor 安装包。发布者本人执行授权及发布，见 [发布操作说明](../RELEASING.md)。

```ts
import { KeymasterConnectClient } from "keymaster-connect";
const client = new KeymasterConnectClient({ targetOrigin: "https://keymaster.cc" });
const session = await client.login({ text: "连接当前钱包" });
console.log(session.networkIdentity);
```

首次连接无需知道公钥或网络；业务参数不能选择钱包或网络。连接重置、Worker 世代变化后，旧 binding 永久失效，App 必须显式重连。产品尚未上线，wire 固定为 v1，不因 npm 包版本变化提升为 v2。

Receiver 的宿主装配接口见SDK [README](../README.md) 与生成 API。只创建 Receiver 不代表授权已完成；钱包业务必须明确处理接受的请求并回复结果或错误。

## 文档

```sh
pnpm api:generate
pnpm build
pnpm preview
```

在本 `doc/` 目录执行以上文档命令。`api:generate` 从 `api-entry.ts` 读取仓库根目录 `../src` 的公开接口，不接收钱包源码目录。站点构建使用已生成的 `site/api`，静态产物为 `site/.vitepress/dist`。子路径部署可设置 `DOCS_BASE`。

- [接入指南](site/guide/getting-started.md)
- [会话](site/concepts/sessions.md)
- [错误处理](site/guide/errors.md)
- [发布说明](site/release-notes.md)

`DOCS_REPOSITORY_URL` / `DOCS_REPOSITORY_BRANCH` 设置文档仓库链接，`DOCS_SOURCE_REPOSITORY_URL` / `DOCS_SOURCE_REPOSITORY_BRANCH` 设置源码链接；源码默认指向仓库根目录的 `src`；文档编辑链接指向 `doc/site`。
