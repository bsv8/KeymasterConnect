[@keymaster/connect](../index.md) / ConnectResumeParams

# Interface: ConnectResumeParams

`connect.resume` 请求参数。

resume 显式传入钱包公钥；本地记录为空时按当前 Key 重建缺省连接。
可重新验证外部 App proof，不恢复已被重置的本地设置。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`appIdentity?`](#appidentity) | [`AppIdentityProofV1`](AppIdentityProofV1.md) | No | 本地数据重置后重新验证已有发行人签名 proof。 |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 由 `connect.login` 返回的钱包公钥。 |

## Properties

### appIdentity?

> `optional` **appIdentity?**: [`AppIdentityProofV1`](AppIdentityProofV1.md)

本地数据重置后重新验证已有发行人签名 proof。

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

由 `connect.login` 返回的钱包公钥。
caller 持公钥，popup 的运行句柄独立受会话世代约束。
