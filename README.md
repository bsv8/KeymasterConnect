# keymaster-connect

Keymaster Connect v1 的独立生产协议栈，包含 Client、公开契约和 Receiver，不依赖钱包源码或 WebLoom。

无 scope 的 `keymaster-connect`，本包版本为 **0.1.8**，包含完整应用发布证明与显式登录／启动；wire 始终保持 v1。安装：

```sh
npm install --save-exact keymaster-connect@0.1.8
```

支持钱包内嵌 iframe、钱包打开 App（appView）和 App 主动打开完整钱包（popup，默认）。App 主动连接打开完整钱包根页面 `/`，不打开独立协议页；错误和超时不关闭钱包窗口。完整说明见 [App 主动打开钱包](doc/site/concepts/popup-mode.md)。

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

## 钱包接收端

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";
```

宿主提供可信 peer 策略、当前钱包身份、生命周期世代和业务执行；Receiver 拥有来源校验、公开请求校验、连接绑定、在途请求关联、取消、结果/事件封包。`accept()` 返回的上下文是接收端签发的运行态权威，不能靠构造同形对象代替。

业务实现得到上下文后处理请求，再调用 `replyResult` 或 `replyError`。排队结束及不可逆业务前调用 `assertCurrent`；钱包自身仍必须在授权、签名、持久化和广播边界复核业务权威。Receiver 不拥有密码/私钥、资金审批、UTXO、幂等付款账本或业务存储。

`acceptReady` / `acceptCancel` 处理控制消息，`sendEvent` 只向当前有效绑定推送，`clear` 只清理协议运行态、不代表业务授权已撤销。未信任来源的消息不会得到响应。每个原请求只可回复一次，重复在途 ID 不会产生第二次业务执行。

应用根入口提供 Client、二进制工具和公开契约。SDK 不提供 publication/origin 公开入口及钱包存储、scope、HKDF；Client 内部只读取页面发布记录字符串并整体传递，不设置发布证明专用长度上限，解码、字段校验与验签全部由钱包负责，钱包同时核对可信来源。发布构建归独立 Publisher Vite 插件。

公开类型和纯常量也可从 `keymaster-connect/protocol` 引用；客户端入口不加载接收端代码。

仓库根目录是 SDK：`npm run typecheck` 检查类型，`npm run build` 只构建 SDK，`npm publish` 从根目录发布 SDK 新版本（已发布的版本不可覆盖）。发布命令见 [RELEASING.md](RELEASING.md)。

文档是私有的 [doc 子项目](doc/README.md)：根目录执行 `npm run api:generate` 生成 API，`npm run doc:build` 构建站点，`npm run doc:dev` 启动预览开发。文档不进入 npm 发布包。包版本与 wire 版本不是同一概念。

## 数据持久化

SDK 不提供 App 文件或对象存储接口。App 自行管理数据；独立 `cipher.encrypt/decrypt` 可用于加解密。

客户端页面卸载时，会发送带本次连接绑定的卸载通知，帮助钱包将刷新后的旧连接标记为结束；通知仅尽力发送，不恢复旧授权或重放业务。本包 0.1.8 已包含该通知。
