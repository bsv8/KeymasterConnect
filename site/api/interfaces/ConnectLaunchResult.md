[@keymaster/connect](../index.md) / ConnectLaunchResult

# Interface: ConnectLaunchResult

`connect.launch` 成功结果（与 `connect.login` 对齐）。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | — |
| [`ownerPublicKeyHex`](#ownerpublickeyhex) | `string` | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | — |
| [`resolvedAt`](#resolvedat) | `number` | Yes | — |
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

***

### appIdentity?

> `optional` **appIdentity?**: [`VerifiedAppIdentity`](VerifiedAppIdentity.md)
