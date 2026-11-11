# keymaster-connect

Keymaster Connect v1 的独立生产协议栈，包含 Client、公开契约和 Receiver，不依赖钱包源码或 WebLoom。

无 scope 的 `keymaster-connect`，当前公共版本为 **0.1.4**，源码 **0.1.5** 为可选加密存储候选，尚未公共发布；wire 始终保持 v1。已发布版本安装：

```sh
npm install --save-exact keymaster-connect@0.1.4
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

`payment.pay` 为 outputs 模型：`{ clientRequestId, outputs: [{ amount, script }] }`，顺序即链上顺序，找零由钱包追加；旧 `channelId/paymentType/businessKind/amountSatoshis/recipient/feeRate` 字段与 `payment.channel.register`、`p2pkh.transfer` 已移除。脚本解释经独立子入口 `keymaster-connect/script`（`interpretLockingScript`）供钱包与 CLI Web 展示，不决定是否允许支付。

## AI 工具（0.1.4）

`client.registerTools([...])` 让已连接 App 向钱包 AI 提供带 JSON Schema 的工具描述与本地执行回调；传 `[]` 注销。注册无需额外审批，仍不授予付款/签名许可。断线或绑定变化后必须重新注册，旧调用不重放。服务端提供 `KeymasterAiToolReceiver`；wire 继续为 v1。

使用示例、支持的 Schema 子集与取消边界见 [AI 工具](doc/site/concepts/ai-tools.md)。

## 钱包接收端

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";
```

宿主提供可信 peer 策略、当前钱包身份、生命周期世代和业务执行；Receiver 拥有来源校验、公开请求校验、连接绑定、在途请求关联、取消、结果/事件封包。`accept()` 返回的上下文是接收端签发的运行态权威，不能靠构造同形对象代替。

业务实现得到上下文后处理请求，再调用 `replyResult` 或 `replyError`。排队结束及不可逆业务前调用 `assertCurrent`；钱包自身仍必须在授权、签名、持久化和广播边界复核业务权威。Receiver 不拥有密码/私钥、资金审批、UTXO、幂等付款账本或业务存储。

`acceptReady` / `acceptCancel` 处理控制消息，`sendEvent` 只向当前有效绑定推送，`clear` 只清理协议运行态、不代表业务授权已撤销。未信任来源的消息不会得到响应。每个原请求只可回复一次，重复在途 ID 不会产生第二次业务执行。

公开类型和纯常量也可从 `keymaster-connect/protocol` 引用；客户端入口不加载接收端和 proof 密码学代码。

仓库根目录是 SDK：`npm run typecheck` 检查类型，`npm run build` 只构建 SDK，`npm publish` 从根目录发布 SDK 新版本（已发布的版本不可覆盖）。发布命令见 [RELEASING.md](RELEASING.md)。

文档是私有的 [doc 子项目](doc/README.md)：根目录执行 `npm run api:generate` 生成 API，`npm run doc:build` 构建站点，`npm run doc:dev` 启动预览开发。文档不进入 npm 发布包。包版本与 wire 版本不是同一概念。

## App 文件存储

`storageList`、`storageDirectoryCreate`、`storageDirectoryDelete`、`storagePut`、`storageGet`、`storageDelete` 使用钱包配置的 S3 兼容服务。App 必须通过带 `storage` requirement 的 App 独立公钥签名身份连接，只提交自身目录内的相对路径；SDK 不配置或返回 S3 凭据、桶或物理对象根。钱包未配置 S3 时返回 `storage_not_configured`，不会回退到浏览器本地文件。钱包密钥及内部业务存储与 App S3 文件分离；旧 App 本地文件不自动迁移。

S3 文件从桶根按 `<网络>/<钱包公钥>/<App公钥>/files/<文件路径>` 保存，不配置 Root Prefix。每个 App 使用独立公钥，当前 proof 的 `publisherPublicKey` 字段承载该 App 公钥；App 编号和显示名不参与 S3 目录。同一网络、钱包公钥和 App 公钥在配置相同桶后访问同一远端目录；换浏览器仍须初始化/解锁钱包并重新连接。对象内容按 App 提交字节保存，敏感内容需要 App 自行加密。`revision` 是不透明版本标签，供 `storageGet({ path, ifMatch })` 条件读取；`storagePut({ path, content, overwrite: false })` 要求远端原子条件创建，冲突返回 `storage_conflict`。目录删除不递归，上传为单对象 put，不提供 multipart 或断点续传。取消或超时不证明远端写入未发生，App 应按自身业务标识对账。

以上为钱包配套实现的能力约定；SDK 类型和传输本身不能保证某个钱包部署已启用 S3。

### 可选加密存储（0.1.5 候选）

`client.storagePutEncrypted(params)` 对应 `storage.encrypted.put`，接收与普通 put 相同的明文参数，由钱包 Vault 加密后上传；`client.storageGetEncrypted(params)` 对应 `storage.encrypted.get`，由钱包解密后返回明文。密钥绑定钱包、网络、App 公钥和对象路径；App 私钥本身不能独立解密。文件路径仍可见，正文与原始 MIME 保存在密文中。App 编号或显示名变更不改存储身份，每个 App 应使用独立签名公钥；复用公钥即共享存储身份。

加密读取的 offset/length 和 totalSize 表示明文范围，revision/ifMatch 表示远端密文版本；普通 get 返回原始对象，list 的 size 是远端字节数。密文篡改、跨路径复制、错误密钥或把普通对象交给加密读取均报 `storage_provider_error`，不退回普通读取。两种对象共用原有目录、条件创建和删除接口；加密接口不改变普通 put/get。

这些新方法需钱包与 App 消费配套的正式 SDK 版本；0.1.4 Receiver 会拒绝新方法，不能通过发送普通 put 偷渡加密标记。发布前只在隔离候选包中验证，不把候选测试当作公共发布成功。
