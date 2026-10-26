[keymaster-connect](../index.md) / ConnectLoginResult

# Interface: ConnectLoginResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | 本次 login 时一次解析的 claims 真值快照。 |
| [`resolvedAt`](#resolvedat) | `number` | Yes | 本次解析时间（unix milliseconds）。 |
| [`appIdentity?`](#appidentity) | [`VerifiedAppIdentity`](VerifiedAppIdentity.md) | No | — |

## Properties

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

***

### appIdentity?

> `optional` **appIdentity?**: [`VerifiedAppIdentity`](VerifiedAppIdentity.md)
