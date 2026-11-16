[keymaster-connect](../index.md) / ConnectionRecoveryRecord

# Interface: ConnectionRecoveryRecord

本地持久的完整恢复记录（含不透明授权引用，不向 UI 公开）。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`version`](#version) | `1` | Yes | — |
| [`targetOrigin`](#targetorigin) | `string` | Yes | — |
| [`mode`](#mode) | [`KeymasterConnectMode`](../type-aliases/KeymasterConnectMode.md) | Yes | — |
| [`authorizationId`](#authorizationid) | `string` | Yes | — |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |

## Properties

### version

> **version**: `1`

***

### targetOrigin

> **targetOrigin**: `string`

***

### mode

> **mode**: [`KeymasterConnectMode`](../type-aliases/KeymasterConnectMode.md)

***

### authorizationId

> **authorizationId**: `string`

***

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)
