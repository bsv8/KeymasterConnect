# 发布说明

## 待发布：钱包身份与连接契约调整

- 公开参数与结果使用 `walletPublicKeyHex`，移除 `connectSessionId`。旧字段不兼容，需要同步升级调用代码。
- SDK 配置必须包含完整 `NetworkIdentity`；保存、恢复身份时同时保留 `bsvNetwork` 和 `publicKeyHex`，不能默认 main。
- `resume` 支持钱包公钥或 `{ walletPublicKeyHex, appIdentity }`。本地缓存清空后同身份可重建缺省连接，App proof 重新验签。
- 重置后本地设置使用缺省值，旧运行句柄失效；外部已持有凭证继续按身份、签名、范围和自身过期时间验证。
- 同步从最新 SDK 源码生成 API 参考；能力索引移除已经不存在的 multipart 上传方法。

从旧版本更新时，删除保存随机连接编号的逻辑，改为保存登录返回的 `networkIdentity`；业务参数使用
`session.walletPublicKeyHex`，恢复与注销使用该身份的公钥。不要把 `walletPublicKeyHex` 当成免确认授权凭证。

## 0.1.0

首个 SDK 与文档站版本，提供 Popup、appView、类型化请求、稳定错误、取消、事件和二进制助手。
