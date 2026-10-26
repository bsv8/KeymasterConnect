# 发布说明

## 独立双端协议栈与单钱包 API（协议保持 v1）

- Client、生产 Receiver、公开契约及参数校验统一在仓库根目录 `src`，钱包消费同一 Receiver，业务授权与签名不移入 SDK。
- 包提供根入口、`/protocol` 和 `/server`，不再依赖相邻钱包源码；文档生成也只读本仓源码。
- 当前公共 npm 尚未发布，官方 npm pack 产物可独立安装；包版本与 wire 版本分开管理，产品未上线，wire 保持 1。
- 初始化只指定可信 Keymaster `targetOrigin`，删除 `networkIdentity` 选项。
- 首次登录、恢复和 appView 启动无需预知公钥或网络，成功结果统一在 `networkIdentity` 返回它们。App 自行判断、提示。
- 删除重复的连接结果 `walletPublicKeyHex`、`ownerPublicKeyHex`；使用 `result.networkIdentity.publicKeyHex`。
- 删除所有公开业务参数的钱包定位字段，以及用于切换网络的 `assetId`。
- `resume(params?)` 只保留必要的 App proof，不接受公钥字符串；`logout()` 不再接受公钥。
- SDK 自动使用接收端的临时连接绑定，持续校验消息来源、窗口、绑定及身份；App 不保存或重放绑定。
- 重置、重新初始化及 Worker 重启后旧绑定失效，同公钥重新导入也不继承旧运行授权。
- `ready` 仍只表示传输可用；`close()` 不代替注销。
- 不提供旧 API／协议兼容层。SDK 与 Keymaster 必须同步升级；Session Window 路径仍为 `/protocol/v1/popup`，产品路径与 wire 版本独立。

迁移：删除旧构造选项及业务公钥／网络参数，改为在连接成功后读取 `networkIdentity`；新窗口先恢复或登录，再调用业务。支付渠道、金额、幂等编号及付款状态查询继续保留。
