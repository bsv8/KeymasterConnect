# 会话

Connect 使用完整钱包身份 `{ bsvNetwork, publicKeyHex }` 与浏览器实际来源定位连接。
登录返回的 `walletPublicKeyHex` 是钱包公钥，App 不再保存随机连接会话编号。
相同公钥在 main 和 test 属于不同身份。

| 层次 | 含义与生命周期 |
| --- | --- |
| 钱包身份 | 网络与公钥；同一网络、同一私钥重导入时保持一致 |
| 本地连接记录 | 当前来源的 claims、已验证 App 身份等本地上下文；重置后不恢复旧参数 |
| Browser transport | Session Window 中的 postMessage 连接；窗口关闭即断开 |
| Unlock runtime | 受当前解锁会话约束的操作句柄；锁定、重置或 Worker 重启后失效 |
| 外部授权凭证 | 外部应用持有的签名材料；验证方检查身份、签名、范围及凭证自身有效期 |

## 登录和恢复

`connect.login` 经用户确认后返回完整 `networkIdentity`、`walletPublicKeyHex` 和 claims 快照。
App 应保存完整网络身份，后续调用携带钱包公钥；SDK 在消息外层持续传递并核对网络身份。

窗口关闭后，`connect.resume(walletPublicKeyHex)` 恢复连接；钱包锁定时仍需解锁。
本地连接缓存不存在时，当前钱包身份匹配即可重建缺省连接，不要求找回旧编号。
重建连接不会恢复已删除的 claims 或设置，也不会复活旧的运行句柄。

Storage 或 MSFile App 可以重新提交原有发行人签名 proof：

```ts
await keymaster.resume({
  walletPublicKeyHex: keymaster.networkIdentity.publicKeyHex,
  appIdentity // App 已有的发行人签名 proof
});
```

Keymaster 重新验证 proof 和所需能力条件。发行人 proof 用于确认 App 身份；它与钱包给外部应用
签发的用户授权凭证是不同材料。增加未签名参数不能取得 App 权限。

## 钱包重置与凭证有效期

重置清除钱包本地数据。重新导入同一网络、同一私钥后，本地参数使用系统缺省值；重新连接使用
新的运行句柄。导入不同公钥或使用不同网络时，旧身份的连接不能用于新身份。

重置不会改变外部应用已经持有的签名。对既有授权凭证，验证方继续检查公钥、网络、签名、范围
和凭证自身的过期时间；不能因为钱包本地连接记录丢失就额外判定凭证失效。
`connect.login` 的结果和公开公钥本身都不是免确认授权凭证。

## 注销

`connect.logout(walletPublicKeyHex)` 撤销当前来源的本地连接、订阅和相关运行授权。
SDK 的 `close()` 只关闭传输，不代替注销。注销或重置也不会改写外部已持有签名材料的有效期；
外部凭证仍按自身验证规则处理。
