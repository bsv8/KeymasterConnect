[keymaster-connect](../index.md) / ConnectLoginResult

# Interface: ConnectLoginResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`loginProof?`](#loginproof) | [`ConnectLoginProof`](ConnectLoginProof.md) | No | Present when the request includes loginChallenge. |
| [`authorizationId`](#authorizationid) | `string` | Yes | 不透明恢复凭据，绑定原钱包和精确来源；不得写入日志或 URL。 |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | 本次 login 时一次解析的 claims 真值快照。 |
| [`resolvedAt`](#resolvedat) | `number` | Yes | 本次解析时间（unix milliseconds）。 |

## Properties

### loginProof?

> `optional` **loginProof?**: [`ConnectLoginProof`](ConnectLoginProof.md)

Present when the request includes loginChallenge.

***

### authorizationId

> **authorizationId**: `string`

不透明恢复凭据，绑定原钱包和精确来源；不得写入日志或 URL。

***

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

***

### resolvedClaims

> **resolvedClaims**: `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\>

本次 login 时一次解析的 claims 真值快照。

***

### resolvedAt

> **resolvedAt**: `number`

本次解析时间（unix milliseconds）。
