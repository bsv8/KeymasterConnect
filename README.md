# keymaster-connect

Keymaster Connect v1 的独立生产协议栈，包含 Client、公开契约和 Receiver，不依赖钱包源码或 WebLoom。

无 scope 的 `keymaster-connect`，当前版本为 **0.1.6**，包含可选加密存储、连接恢复与完整应用发布证明；wire 始终保持 v1。已发布版本安装：

```sh
npm install --save-exact keymaster-connect@0.1.6
```

支持钱包内嵌 iframe、钱包打开 App（appView）和 App 主动打开完整钱包（popup，默认）。App 主动连接打开完整钱包根页面 `/`，不打开独立协议页；`close()`、错误和超时不关闭钱包窗口。完整说明见 [App 主动打开钱包](doc/site/concepts/popup-mode.md)。

许可证沿用仓库原有 AGPL v3，见包内 LICENSE。

```ts
import { KeymasterConnectClient } from "keymaster-connect";
const client = new KeymasterConnectClient({ targetOrigin: "https://keymaster.cc" });
const connected = await client.login({ text: "连接钱包" });
console.log(connected.networkIdentity);
```

公开能力包括 Connect、Identity、Cipher、Payment（outputs 数组）、Channel、Storage 和 MSFile。首次连接不选择公钥或网络，后续业务使用接收端签发的连接绑定。钱包重置或 Worker 世代改变后旧绑定失效，App 必须显式重新连接。ready 只代表完整钱包已具备传输条件；logout 撤销连接授权，close 只关闭传输，不关闭用户的钱包窗口。取消是尽力通知，不表示已签名/广播的业务可以回滚。产品未上线，wire 固定为 v1，不维护已删除字段兼容分支。

`connect()` 只建立传输，不恢复授权；刷新恢复请使用 `resume()`，它先装载本地恢复记录再复用 `continueConnection()`。`login`／`launch`／`resume` 成功保存最近一条恢复记录（`sessionStorage`，键 `keymaster-connect:recovery:v1`，仅含版本、精确 origin、模式、授权引用和网络身份），`logout` 成功、明确授权失效或用户主动清除才删除；`close`、页面卸载、超时、窗口关闭均保留。`readConnectionRecovery()` 返回公开摘要（不含凭据），`clearConnectionRecovery()` 仅删本地材料；`KeymasterConnectOptions.recoveryStorage` 可替换存储，不降级到 `localStorage`。存储写入失败不影响已成功的登录，调用方可读 `client.recoverySaveError` 提示“已登录，但刷新恢复信息保存失败”。`connection_expired` 仅表达运行连接失效，保留记录；只有钱包返回 `authorization_expired` 或匹配的 `revoked` 才清除。

`payment.pay` 为 outputs 模型：`{ clientRequestId, outputs: [{ amount, script }] }`，顺序即链上顺序，找零由钱包追加；旧 `channelId/paymentType/businessKind/amountSatoshis/recipient/feeRate` 字段与 `payment.channel.register`、`p2pkh.transfer` 已移除。脚本解释经独立子入口 `keymaster-connect/script`（`interpretLockingScript`）供钱包与 CLI Web 展示，不决定是否允许支付。

## AI 工具

`client.registerTools([...])` 让已连接 App 向钱包 AI 提供带 JSON Schema 的工具描述与本地执行回调；传 `[]` 注销。注册无需额外审批，仍不授予付款/签名许可。断线或绑定变化后必须重新注册，旧调用不重放。服务端提供 `KeymasterAiToolReceiver`；wire 继续为 v1。

使用示例、支持的 Schema 子集与取消边界见 [AI 工具](doc/site/concepts/ai-tools.md)。

## 钱包接收端

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";
```

宿主提供可信 peer 策略、当前钱包身份、生命周期世代和业务执行；Receiver 拥有来源校验、公开请求校验、连接绑定、在途请求关联、取消、结果/事件封包。`accept()` 返回的上下文是接收端签发的运行态权威，不能靠构造同形对象代替。

业务实现得到上下文后处理请求，再调用 `replyResult` 或 `replyError`。排队结束及不可逆业务前调用 `assertCurrent`；钱包自身仍必须在授权、签名、持久化和广播边界复核业务权威。Receiver 不拥有密码/私钥、资金审批、UTXO、幂等付款账本或业务存储。

`acceptReady` / `acceptCancel` 处理控制消息，`sendEvent` 只向当前有效绑定推送，`clear` 只清理协议运行态、不代表业务授权已撤销。未信任来源的消息不会得到响应。每个原请求只可回复一次，重复在途 ID 不会产生第二次业务执行。

应用根入口提供 Client、连接恢复、二进制工具和公开契约。SDK 不提供 publication/origin 公开入口及钱包存储、scope、HKDF；Client 内部只读取页面 URL 证明并检查结构后传递，钱包负责可信来源比对和验签。发布构建归独立 Publisher Vite 插件。

公开类型和纯常量也可从 `keymaster-connect/protocol` 引用；客户端入口不加载接收端代码。

仓库根目录是 SDK：`npm run typecheck` 检查类型，`npm run build` 只构建 SDK，`npm publish` 从根目录发布 SDK 新版本（已发布的版本不可覆盖）。发布命令见 [RELEASING.md](RELEASING.md)。

文档是私有的 [doc 子项目](doc/README.md)：根目录执行 `npm run api:generate` 生成 API，`npm run doc:build` 构建站点，`npm run doc:dev` 启动预览开发。文档不进入 npm 发布包。包版本与 wire 版本不是同一概念。

## 数据持久化

SDK 不提供 App 文件或对象存储接口。App 自行管理数据；独立 `cipher.encrypt/decrypt` 可用于加解密。浏览器连接恢复记录仅用于恢复 Connect 连接，不是 App 存储服务。
