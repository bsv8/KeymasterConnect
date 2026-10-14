[@keymaster/connect](../index.md) / ConnectLoginResult

# Interface: ConnectLoginResult

`connect.login` 成功结果。

返回公钥与 claims 快照；后续请求复用公钥、网络及浏览器实际来源定位身份。

关键（施工单 2026-06-28 002 硬切换 + 硬切换 002 收尾）：**不**再返回
`ownerKeyId`。owner 唯一真值 = `ownerPublicKeyHex`；vault 不再保留
任何 key 域 surrogate id（硬切换 002 后连内部借用句柄也按 hex 走）。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 钱包压缩公钥；后续请求用它定位身份。 |
| [`ownerPublicKeyHex`](#ownerpublickeyhex) | `string` | Yes | 绑定 key 的压缩公钥 hex；与 session 记录内字段一致。 |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | 本次 login 时一次解析的 claims 真值快照。 |
| [`resolvedAt`](#resolvedat) | `number` | Yes | 本次解析时间（unix milliseconds）。 |
| [`appIdentity?`](#appidentity) | [`VerifiedAppIdentity`](VerifiedAppIdentity.md) | No | — |

## Properties

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

钱包压缩公钥；后续请求用它定位身份。

***

### ownerPublicKeyHex

> **ownerPublicKeyHex**: `string`

绑定 key 的压缩公钥 hex；与 session 记录内字段一致。

***

### resolvedClaims

> **resolvedClaims**: `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\>

本次 login 时一次解析的 claims 真值快照。

***

### resolvedAt

> **resolvedAt**: `number`

本次解析时间（unix milliseconds）。

***

### appIdentity?

> `optional` **appIdentity?**: [`VerifiedAppIdentity`](VerifiedAppIdentity.md)
