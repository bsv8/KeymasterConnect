# keymaster-connect

Keymaster Connect v1 的独立生产协议栈，包含 Client、公开契约和 Receiver，不依赖钱包源码或 WebLoom。

无 scope 的 `keymaster-connect`，本包版本为 **0.5.0**，包含完整应用发布证明、带挑战码的显式登录／启动、链尖订阅与批量交易查询、可恢复 MSFile 读取及 StreamSeed 直播跟随与节点读取；wire 始终保持 v1。安装：

```sh
pnpm add --save-exact keymaster-connect@0.5.0
```

支持钱包内嵌 iframe、钱包打开 App（appView）和 App 主动打开完整钱包（popup，默认）。App 主动连接打开完整钱包根页面 `/`，不打开独立协议页；错误和超时不关闭钱包窗口。完整说明见 [App 主动打开钱包](doc/site/concepts/popup-mode.md)。

需要站点会话时，App 后端先签发 32 字节一次性挑战码，再将 lowercase hex 作为 `loginChallenge` 传给 `login` 或 `launch`。钱包在结果中返回 `loginProof`；后端必须验证签名、挑战码、网络、公钥和本站 origin 后建立会话。挑战码不得写入日志或重复使用。

许可证沿用仓库原有 AGPL v3，见包内 LICENSE。

```ts
import { KeymasterConnectClient } from "keymaster-connect";
const client = new KeymasterConnectClient({ targetOrigin: "https://keymaster.cc" });
const connected = await client.login({ text: "连接钱包" });
console.log(connected.networkIdentity);
```

公开能力包括 Connect、Identity、Cipher、Payment（outputs 数组）、Channel 和 MSFile。首次连接不选择公钥或网络，后续业务使用接收端签发的连接绑定。钱包重置或 Worker 世代改变后旧绑定失效，App 必须显式重新连接。ready 只代表完整钱包已具备传输条件；logout 撤销连接授权，用户可直接关闭页签，无需调用 SDK 或等待回复。取消是尽力通知，不表示已签名/广播的业务可以回滚。产品未上线，wire 固定为 v1，不维护已删除字段兼容分支。

`connect()` 和 ready 只表示传输可用，`login` 或一次性 `launch` 成功后才能调用业务。SDK 不保存浏览器授权恢复记录、不自动重连。App 刷新或连接失效后，popup 模式重新登录，iframe/appView 模式从钱包重新打开。断开清空本地身份与绑定，不重放旧请求。长期应用操作许可由钱包保存，与运行连接分开。页面离开时 SDK 尽力发送带当前连接绑定的卸载通知，再清理本地监听器、计时器和等待任务，不等待远端回复。

`payment.pay` 为 outputs 模型：`{ clientRequestId, outputs: [{ amount, script }] }`，顺序即链上顺序，找零由钱包追加；旧 `channelId/paymentType/businessKind/amountSatoshis/recipient/feeRate` 字段与 `payment.channel.register`、`p2pkh.transfer` 已移除。脚本解释经独立子入口 `keymaster-connect/script`（`interpretLockingScript`）供钱包与 CLI Web 展示，不决定是否允许支付。

## AI 工具

`client.registerTools([...])` 让已连接 App 向钱包 AI 提供带 JSON Schema 的工具描述与本地执行回调；传 `[]` 注销。注册无需额外审批，仍不授予付款/签名许可。断线或绑定变化后必须重新注册，旧调用不重放。服务端提供 `KeymasterAiToolReceiver`；wire 继续为 v1。

使用示例、支持的 Schema 子集与取消边界见 [AI 工具](doc/site/concepts/ai-tools.md)。

## 域名查询

在支持域名查询的钱包中，应用建连后可以读取公开资料。钱包按当前 BSV 网络查询。Profile 默认使用 BSV8，域名查公钥按后缀选择服务，裸名称使用 `.bsv8`。可传 `{ serviceId, signal }` 指定已配置的第三方服务或取消查询。

```ts
const profile = await client.domain.profile(authorPublicKey);
const { results } = await client.domain.profiles(authorPublicKeys);
const publicKey = await client.domain.getPublicKey("alice");
```

Profile 包含 `publicKeyHex`、带后缀的主要域名 `domain`、`expiresAt`、可选公开文字 `text` 和 BitFS 图片引用 `avatar`、`header`。批量接口最多接收 100 个公钥，按输入顺序返回 `{ publicKeyHex, profile }` 或 `{ publicKeyHex, error: { code } }`。域名查询由 `0.3.0` 及以后的正式版本提供。

## 钱包接收端

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";
```

宿主提供可信 peer 策略、当前钱包身份、生命周期世代和业务执行；Receiver 拥有来源校验、公开请求校验、连接绑定、在途请求关联、取消、结果/事件封包。`accept()` 返回的上下文是接收端签发的运行态权威，不能靠构造同形对象代替。

业务实现得到上下文后处理请求，再调用 `replyResult` 或 `replyError`。排队结束及不可逆业务前调用 `assertCurrent`；钱包自身仍必须在授权、签名、持久化和广播边界复核业务权威。Receiver 不拥有密码/私钥、资金审批、UTXO、幂等付款账本或业务存储。

`acceptReady` / `acceptCancel` 处理控制消息，`sendEvent` 只向当前有效绑定推送，`clear` 只清理协议运行态、不代表业务授权已撤销。未信任来源的消息不会得到响应。每个原请求只可回复一次，重复在途 ID 不会产生第二次业务执行。

应用根入口提供 Client、二进制工具和公开契约。SDK 不提供 publication/origin 公开入口及钱包存储、scope、HKDF；Client 内部只读取页面发布记录字符串并整体传递，不设置发布证明专用长度上限，解码、字段校验与验签全部由钱包负责，钱包同时核对可信来源。发布构建归独立 Publisher Vite 插件。

公开类型和纯常量也可从 `keymaster-connect/protocol` 引用；客户端入口不加载接收端代码。

仓库根目录是 SDK：`pnpm run typecheck` 检查类型，`pnpm run build` 只构建 SDK，`pnpm publish` 从根目录发布 SDK 新版本（已发布的版本不可覆盖）。发布命令见 [RELEASING.md](RELEASING.md)。

文档是私有的 [doc 子项目](doc/README.md)：根目录执行 `pnpm run api:generate` 生成 API，`pnpm run doc:build` 构建站点，`pnpm run doc:dev` 启动预览开发。文档不进入 npm 发布包。包版本与 wire 版本不是同一概念。

## 数据持久化

SDK 不提供 App 文件或对象存储接口。App 自行管理数据；独立 `cipher.encrypt/decrypt` 可用于加解密。

客户端页面卸载时，会发送带本次连接绑定的卸载通知，帮助钱包将刷新后的旧连接标记为结束；通知仅尽力发送，不恢复旧授权或重放业务。本包 0.1.8 已包含该通知。

## Staged payments and application keys

`client.payment.prepare` freezes outputs and returns reserved input outpoints. A data-signature template specifies a byte offset in one zero-value data output and a prefix and suffix around the deterministic CBOR input list. `paymentSigningObject` from `keymaster-connect/signing` assembles the bytes for `client.payment.commit`. The wallet approves and signs the staged payment. Cancel and status use the original request identifiers.

`client.application.getPublicKey(purpose)` returns the wallet's public key for the requested purpose. `signMessage({ purpose, message })` uses a domain-separated message digest. `signPayment({ purpose, inputs, address, feeSatoshis, rawTxHex })` approves and signs a transaction spending P2PK outputs for that purpose and returns the exact signed bytes. The private key stays inside the wallet. Clients using the same wallet and purpose share the same key and need wallet approval for each signature or payment.

`client.chain` uses the session network for height, history, raw transactions, unspent outputs and broadcast.

`chain.subscribeHeight(handler)` returns an unsubscribe function. The listener receives `{ height, blockHash }` for the latest available chain tip and changes to either field. `chain.getHeight()` reads the same wallet cache once. Before the first successful sync, the read reports `internal_error` and the subscription waits for the first tip.

`client.chain.getTransactions({ txids, mode: "raw" | "status" })` 支持一次查询最多 20 个交易 ID。确认记录含区块高度和哈希。`raw` 模式同时返回原始交易，`status` 模式只返回观察状态。响应缺项可按原 ID 重试。

## MSFile

- `msfile.read(seedHashHex)` reads verified complete content by hash. The wallet checks local storage and can discover a BitFS seller and purchase the file.
- `msfile.stat({ seedHashHex })` checks availability in the wallet and at configured suppliers.
- `msfile.readSeed({ sourceId, seedHashHex })` reads the MasterSeed from the selected source.
- `msfile.readBlock({ sourceId, seedHashHex, blockHashHex })` reads a block from the selected source.
- `msfile.import({ fileName, content })` imports content and returns its seed hash once the seller can find it.
- `msfile.sellerStatus()` checks seller readiness.

Version `0.4.0` supports resumable reads. Save a `clientRequestId` before calling `msfile.read(seedHashHex, { clientRequestId })` or `msfile.openContent({ seedHashHex, clientRequestId })`. Use `msfile.readStatus(clientRequestId)` to look up the same read after reconnecting.

`readStatus` and `openContent` report `pending` while the wallet is working, `available` when the complete file is readable, and `stopped` when the app should stop waiting. `stopped` includes `error.code` and `error.message`. If the wallet has an interrupted purchase, the user can resume it there and the app can check the same read ID again. `funds` reports settlement separately.

`msfile.readRange({ clientRequestId, offset, length })` reads verified ranges while the complete file is still pending.

`msfile.downloadPrice()` reads the wallet's maximum manual full-block price. Pass `maxFullBlockPriceSatoshis` to `openContent` to choose the new download's initial full-block price ceiling. The app may call `downloadPrice({ clientRequestId, maxFullBlockPriceSatoshis })` for a running download that it was authorized to adjust. Seed prices follow the wallet's existing rules.

## StreamSeed live follow

`msfile.streamseed.follow({ clientRequestId, streamId, enabled, mode })` starts, queries or stops following a track. Keep a stable request ID per page and track; `mode` selects `live` or `replay`. The result reports whether the wallet follows the stream and the first playable node ID (`"0"`). Reconnecting with the same request ID and node IDs continues the original follow; different pages hold independent requests.

`msfile.streamseed.read({ clientRequestId, nodeId, blockOffset, length })` reads one verified node. Results report `pending`, `available` (node type, media block lengths and the requested bytes), `end` for the END node, or `stopped` when the follow is no longer active. Node IDs are decimal strings; one range is limited to 256 KiB.
