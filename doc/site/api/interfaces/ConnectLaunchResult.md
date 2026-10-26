[keymaster-connect](../index.md) / ConnectLaunchResult

# Interface: ConnectLaunchResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | — |
| [`resolvedAt`](#resolvedat) | `number` | Yes | — |
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

***

### appIdentity?

> `optional` **appIdentity?**: [`VerifiedAppIdentity`](VerifiedAppIdentity.md)
