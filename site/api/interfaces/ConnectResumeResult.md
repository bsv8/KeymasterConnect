[@keymaster/connect](../index.md) / ConnectResumeResult

# Interface: ConnectResumeResult

`connect.resume` 成功结果。

返回钱包公钥与当前 claims 快照；新建缺省连接的 claims 为空。

关键（施工单 2026-06-28 002 硬切换）：**不**再返回 `ownerKeyId`。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | — |
| [`ownerPublicKeyHex`](#ownerpublickeyhex) | `string` | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | — |
| [`resolvedAt`](#resolvedat) | `number` | Yes | 解析时间——本次 resume 时间戳，**不**是 connect.login 时的快照时间。 |
| [`appIdentity?`](#appidentity) | [`VerifiedAppIdentity`](VerifiedAppIdentity.md) | No | — |

## Properties

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

***

### ownerPublicKeyHex

> **ownerPublicKeyHex**: `string`

***

### resolvedClaims

> **resolvedClaims**: `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\>

***

### resolvedAt

> **resolvedAt**: `number`

解析时间——本次 resume 时间戳，**不**是 connect.login 时的快照时间。
给 caller 用来做"是否要重新登录"的客户端超时策略。

***

### appIdentity?

> `optional` **appIdentity?**: [`VerifiedAppIdentity`](VerifiedAppIdentity.md)
