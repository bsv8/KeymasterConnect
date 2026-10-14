[@keymaster/connect](../index.md) / ConnectResumeResult

# Interface: ConnectResumeResult

`connect.resume` 成功结果。

设计缘由：与 `connect.login` 对称——返回 sessionId + owner + claimsSnapshot
三元组。claimsSnapshot 是 connect.login 时已落库的真值快照；resume 不重新
跑 identity.get，避免 popup unlock 后还要走人工确认。

关键（施工单 2026-06-28 002 硬切换）：**不**再返回 `ownerKeyId`。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | — |
| [`ownerPublicKeyHex`](#ownerpublickeyhex) | `string` | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | — |
| [`resolvedAt`](#resolvedat) | `number` | Yes | 解析时间——本次 resume 时间戳，**不**是 connect.login 时的快照时间。 |
| [`appIdentity?`](#appidentity) | [`VerifiedAppIdentity`](VerifiedAppIdentity.md) | No | — |

## Properties

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

***

### connectSessionId

> **connectSessionId**: `string`

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
