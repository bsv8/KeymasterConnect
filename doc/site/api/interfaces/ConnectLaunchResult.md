[keymaster-connect](../index.md) / ConnectLaunchResult

# Interface: ConnectLaunchResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`loginProof?`](#loginproof) | [`ConnectLoginProof`](ConnectLoginProof.md) | No | Present when the request includes loginChallenge. |
| [`authorizationId`](#authorizationid) | `string` | Yes | — |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | — |
| [`resolvedAt`](#resolvedat) | `number` | Yes | — |

## Properties

### loginProof?

> `optional` **loginProof?**: [`ConnectLoginProof`](ConnectLoginProof.md)

Present when the request includes loginChallenge.

***

### authorizationId

> **authorizationId**: `string`

***

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

***

### resolvedClaims

> **resolvedClaims**: `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\>

***

### resolvedAt

> **resolvedAt**: `number`
