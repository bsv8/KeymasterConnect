[keymaster-connect](../index.md) / ConnectResumeResult

# Interface: ConnectResumeResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | — |
| [`resolvedAt`](#resolvedat) | `number` | Yes | 解析时间——本次 resume 时间戳，**不**是 connect.login 时的快照时间。 |
| [`appIdentity?`](#appidentity) | [`VerifiedAppIdentity`](VerifiedAppIdentity.md) | No | — |

## Properties

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

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
