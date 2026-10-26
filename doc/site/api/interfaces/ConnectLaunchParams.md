[keymaster-connect](../index.md) / ConnectLaunchParams

# Interface: ConnectLaunchParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`launchToken`](#launchtoken) | `string` | Yes | 由 launcher 写入 client app 启动 URL 的 launchToken。 |
| [`appIdentity`](#appidentity) | [`AppIdentityProofV1`](AppIdentityProofV1.md) | Yes | 与 launcher 预建 session 绑定的完整签名 proof。 |

## Properties

### launchToken

> **launchToken**: `string`

由 launcher 写入 client app 启动 URL 的 launchToken。一次性消费。

***

### appIdentity

> **appIdentity**: [`AppIdentityProofV1`](AppIdentityProofV1.md)

与 launcher 预建 session 绑定的完整签名 proof。
